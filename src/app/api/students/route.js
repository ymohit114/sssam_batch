import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import Batch from '@/models/Batch';
import User from '@/models/User';
import { getCurrentUser, errorResponse, successResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function generateEnrollmentNo() {
  const year = new Date().getFullYear();
  const last = await Student.findOne({ enrollment_no: new RegExp(`^SSSAM-${year}-`) }).sort({ createdAt: -1 });
  let nextSeq = 1;
  if (last && last.enrollment_no) {
    const parts = last.enrollment_no.split('-');
    if (parts.length === 3) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed)) nextSeq = parsed + 1;
    }
  }
  return `SSSAM-${year}-${String(nextSeq).padStart(3, '0')}`;
}

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batch_id');
    const q = searchParams.get('q');

    const filter = {};

    if (batchId && batchId !== 'All') {
      filter.batches = batchId;
    }

    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { enrollment_no: regex },
      ];
    }

    const students = await Student.find(filter)
      .populate('batches', 'batch_name batch_code')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = students.map(s => ({
      id: s._id.toString(),
      name: s.name,
      email: s.email,
      phone: s.phone,
      enrollment_no: s.enrollment_no,
      city: s.city,
      status: s.status,
      created_at: s.createdAt,
      enrolled_batch_count: s.batches?.length || 0,
      batch_names: s.batches?.map(b => b.batch_name).join(', '),
      batch_codes: s.batches?.map(b => b.batch_code).join(', '),
    }));

    return successResponse({ students: formatted });
  } catch (err) {
    console.error('Students GET error:', err);
    return errorResponse('Failed to fetch students', 500);
  }
}

// Allowed for BOTH Counselor and Trainer
export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const data = await request.json();
    const { name, email, phone, city, batch_id, notes, enrollment_no } = data;

    if (!name || name.trim().length === 0) {
      return errorResponse('Student name is required', 400);
    }

    await connectDB();

    // Verify trainer batch access if role is trainer
    if (batch_id && user.role === 'trainer') {
      const batchCheck = await Batch.findById(batch_id);
      if (!batchCheck) {
        return errorResponse('Selected batch not found', 404);
      }
      if (!batchCheck.trainer || batchCheck.trainer.toString() !== user.id) {
        return errorResponse(`You can only enroll students in your own assigned batches (Batch: ${batchCheck.batch_name})`, 403);
      }
    }

    // Check if student with same email or phone exists
    let student = null;
    if (email && email.trim()) {
      student = await Student.findOne({ email: email.trim().toLowerCase() });
    }
    if (!student && phone && phone.trim()) {
      student = await Student.findOne({ phone: phone.trim() });
    }

    if (!student) {
      const roll = enrollment_no && enrollment_no.trim() ? enrollment_no.trim().toUpperCase() : await generateEnrollmentNo();
      student = await Student.create({
        name: name.trim(),
        email: email ? email.trim().toLowerCase() : null,
        phone: phone ? phone.trim() : null,
        enrollment_no: roll,
        city: city ? city.trim() : 'Delhi',
        status: 'active',
        batches: batch_id ? [batch_id] : [],
      });
    } else if (batch_id && !student.batches.includes(batch_id)) {
      student.batches.push(batch_id);
      await student.save();
    }

    let alreadyEnrolled = false;
    if (batch_id) {
      const batch = await Batch.findById(batch_id);
      if (batch) {
        const hasEnrollment = batch.students.some(s => s.student.toString() === student._id.toString());
        if (hasEnrollment) {
          alreadyEnrolled = true;
        } else {
          batch.students.push({
            student: student._id,
            enrolled_by: user.id,
            notes: notes ? notes.trim() : 'Enrolled by ' + user.name,
            enrolled_at: new Date(),
          });
          await batch.save();
        }
      }
    }

    return successResponse({
      message: alreadyEnrolled ? 'Student already enrolled in this batch' : 'Student enrolled successfully!',
      student: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        phone: student.phone,
        enrollment_no: student.enrollment_no,
        city: student.city,
        status: student.status,
      },
      alreadyEnrolled,
    }, 201);
  } catch (err) {
    console.error('Students POST error:', err);
    return errorResponse('Failed to create/enroll student: ' + err.message, 500);
  }
}

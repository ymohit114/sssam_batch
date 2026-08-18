import { connectDB } from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Course from '@/models/Course';
import User from '@/models/User';
import Student from '@/models/Student';
import BatchLog from '@/models/BatchLog';
import { getCurrentUser, errorResponse, successResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function timesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function daysOverlap(daysStrA, daysStrB) {
  if (!daysStrA || !daysStrB) return false;
  const daysA = daysStrA.split(',').map(d => d.trim().toLowerCase());
  const daysB = daysStrB.split(',').map(d => d.trim().toLowerCase());
  return daysA.some(d => daysB.includes(d));
}

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { id } = params;
    await connectDB();

    const batch = await Batch.findById(id)
      .populate('trainer', 'name email phone specialization')
      .populate('course', 'name code color')
      .populate('students.student', 'name email phone course_name enrollment_no city status')
      .populate('students.enrolled_by', 'name')
      .lean();

    if (!batch) {
      return errorResponse('Batch not found', 404);
    }

    const logs = await BatchLog.find({ batch: id })
      .populate('trainer', 'name')
      .sort({ log_date: -1 })
      .limit(10)
      .lean();

    const studentsFormatted = (batch.students || [])
      .filter(s => s.student)
      .map(s => ({
        id: s.student._id.toString(),
        name: s.student.name,
        email: s.student.email,
        phone: s.student.phone,
        course_name: s.student.course_name || '',
        enrollment_no: s.student.enrollment_no,
        city: s.student.city,
        status: s.student.status,
        enrolled_at: s.enrolled_at,
        notes: s.notes,
        enrolled_by_name: s.enrolled_by?.name,
      }));

    return successResponse({
      batch: {
        id: batch._id.toString(),
        batch_code: batch.batch_code,
        batch_name: batch.batch_name,
        course_id: batch.course?._id?.toString(),
        course_name: batch.course?.name,
        course_code: batch.course?.code,
        course_color: batch.course?.color,
        trainer_id: batch.trainer?._id?.toString(),
        trainer_name: batch.trainer?.name,
        trainer_email: batch.trainer?.email,
        trainer_phone: batch.trainer?.phone,
        trainer_specialization: batch.trainer?.specialization,
        start_date: batch.start_date,
        end_date: batch.end_date,
        start_time: batch.start_time,
        end_time: batch.end_time,
        days: batch.days,
        mode: batch.mode,
        max_capacity: batch.max_capacity,
        status: batch.status,
        description: batch.description,
        students: studentsFormatted,
        student_count: studentsFormatted.length,
        logs: logs.map(l => ({
          id: l._id.toString(),
          log_date: l.log_date,
          topic: l.topic,
          notes: l.notes,
          attendance_count: l.attendance_count,
          trainer_name: l.trainer?.name,
        })),
      },
    });
  } catch (err) {
    console.error('Batch detail GET error:', err);
    return errorResponse('Server error', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    if (user.role !== 'counselor') {
      return errorResponse('Permission Denied: Only Counselors can update batch details', 403);
    }

    const { id } = params;
    const data = await request.json();
    const {
      batch_code,
      batch_name,
      course_id,
      trainer_id,
      start_date,
      end_date,
      start_time,
      end_time,
      days,
      mode,
      max_capacity,
      status,
      description,
      ignore_conflict,
    } = data;

    await connectDB();
    const existing = await Batch.findById(id);
    if (!existing) {
      return errorResponse('Batch not found', 404);
    }

    if (batch_code && batch_code.trim().toUpperCase() !== existing.batch_code) {
      const codeCheck = await Batch.findOne({ batch_code: batch_code.trim().toUpperCase(), _id: { $ne: id } });
      if (codeCheck) {
        return errorResponse('A batch with this code already exists', 400);
      }
      existing.batch_code = batch_code.trim().toUpperCase();
    }

    const targetTrainer = trainer_id !== undefined ? trainer_id : existing.trainer;
    const targetStartTime = start_time || existing.start_time;
    const targetEndTime = end_time || existing.end_time;
    const targetDays = days || existing.days;

    if (targetTrainer && !ignore_conflict) {
      const otherBatches = await Batch.find({
        trainer: targetTrainer,
        _id: { $ne: id },
        status: { $in: ['Ongoing', 'Upcoming'] },
      }).lean();

      for (const ob of otherBatches) {
        if (daysOverlap(targetDays, ob.days) && timesOverlap(targetStartTime, targetEndTime, ob.start_time, ob.end_time)) {
          return errorResponse(
            `Schedule Conflict! Trainer is assigned to "${ob.batch_name}" (${ob.batch_code}) from ${ob.start_time} to ${ob.end_time} on ${ob.days}.`,
            409
          );
        }
      }
    }

    if (batch_name) existing.batch_name = batch_name.trim();
    if (course_id !== undefined) existing.course = course_id || null;
    if (trainer_id !== undefined) existing.trainer = trainer_id || null;
    if (start_date) existing.start_date = start_date;
    if (end_date !== undefined) existing.end_date = end_date;
    if (start_time) existing.start_time = start_time;
    if (end_time) existing.end_time = end_time;
    if (days) existing.days = days;
    if (mode) existing.mode = mode;
    if (max_capacity) existing.max_capacity = Number(max_capacity);
    if (status) existing.status = status;
    if (description !== undefined) existing.description = description;

    await existing.save();

    return successResponse({ message: 'Batch updated successfully' });
  } catch (err) {
    console.error('Batch PUT error:', err);
    return errorResponse('Failed to update batch: ' + err.message, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    if (user.role !== 'counselor') {
      return errorResponse('Permission Denied: Only Counselors can delete batches', 403);
    }

    const { id } = params;
    await connectDB();

    const existing = await Batch.findById(id);
    if (!existing) {
      return errorResponse('Batch not found', 404);
    }

    // Remove batch from all students
    await Student.updateMany({ batches: id }, { $pull: { batches: id } });
    await BatchLog.deleteMany({ batch: id });
    await Batch.findByIdAndDelete(id);

    return successResponse({ message: `Batch "${existing.batch_name}" deleted successfully` });
  } catch (err) {
    console.error('Batch DELETE error:', err);
    return errorResponse('Failed to delete batch', 500);
  }
}

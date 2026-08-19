import { connectDB } from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Course from '@/models/Course';
import User from '@/models/User';
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

export async function GET(request) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    const { searchParams } = new URL(request.url);
    const trainerIdFilter = searchParams.get('trainer_id');
    const statusFilter = searchParams.get('status');
    const courseIdFilter = searchParams.get('course_id');
    const myBatchesOnly = searchParams.get('my_batches') === 'true';

    const filter = {};

    if (user && (myBatchesOnly || (user.role === 'trainer' && !trainerIdFilter))) {
      filter.trainer = user.id;
    } else if (trainerIdFilter && trainerIdFilter !== 'All') {
      filter.trainer = trainerIdFilter;
    }

    if (statusFilter && statusFilter !== 'All') {
      filter.status = statusFilter;
    }

    if (courseIdFilter && courseIdFilter !== 'All') {
      filter.course = courseIdFilter;
    }

    const batches = await Batch.find(filter)
      .populate('trainer', 'name email phone specialization')
      .populate('course', 'name code color')
      .sort({ start_time: 1, createdAt: -1 })
      .lean();

    const formatted = batches.map(b => ({
      id: b._id.toString(),
      batch_code: b.batch_code,
      batch_name: b.batch_name,
      course_id: b.course?._id?.toString(),
      course_name: b.course?.name,
      course_code: b.course?.code,
      course_color: b.course?.color,
      trainer_id: b.trainer?._id?.toString(),
      trainer_name: b.trainer?.name,
      trainer_email: b.trainer?.email,
      trainer_phone: b.trainer?.phone,
      trainer_specialization: b.trainer?.specialization,
      start_date: b.start_date,
      end_date: b.end_date,
      start_time: b.start_time,
      end_time: b.end_time,
      days: b.days,
      mode: b.mode,
      max_capacity: b.max_capacity,
      status: b.status,
      description: b.description,
      student_count: b.students?.length || 0,
      created_at: b.createdAt,
    }));

    return successResponse({ batches: formatted });
  } catch (err) {
    console.error('Batches GET error:', err);
    return errorResponse('Failed to fetch batches', 500);
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    if (user.role !== 'counselor') {
      return errorResponse('Permission Denied: Only Counselors can create batches', 403);
    }

    await connectDB();
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

    let finalBatchName = batch_name ? batch_name.trim() : `Batch (${start_time} - ${end_time})`;
    let finalBatchCode = batch_code ? batch_code.trim().toUpperCase() : '';

    if (!finalBatchCode && finalBatchName) {
      // Derive initials from batch name (e.g. "Full Stack Web" -> "FSW", "Python DSA" -> "PDSA")
      const words = finalBatchName.split(/\s+/).filter(w => w.length > 0);
      const initials = words.map(w => w[0].toUpperCase()).join('').slice(0, 5) || 'BATCH';
      const year = new Date().getFullYear();
      const count = await Batch.countDocuments();
      finalBatchCode = `${initials}-${year}-B${count + 1}`;
    }

    if (!finalBatchCode) {
      finalBatchCode = `BATCH-${Date.now().toString().slice(-4)}`;
    }

    if (!start_date || !start_time || !end_time || !days) {
      return errorResponse('Missing required fields (start_date, start_time, end_time, days)', 400);
    }

    const existingCode = await Batch.findOne({ batch_code: finalBatchCode });
    if (existingCode) {
      finalBatchCode = `${finalBatchCode}-${Math.floor(100 + Math.random() * 900)}`;
    }

    // Check Trainer Schedule Conflict if trainer is assigned
    if (trainer_id && !ignore_conflict) {
      const existingTrainerBatches = await Batch.find({
        trainer: trainer_id,
        status: { $in: ['Ongoing', 'Upcoming'] },
      }).lean();

      for (const eb of existingTrainerBatches) {
        if (daysOverlap(days, eb.days) && timesOverlap(start_time, end_time, eb.start_time, eb.end_time)) {
          return errorResponse(
            `Schedule Conflict! Trainer is already assigned to "${eb.batch_name}" (${eb.batch_code}) from ${eb.start_time} to ${eb.end_time} on ${eb.days}.`,
            409
          );
        }
      }
    }

    const newBatch = await Batch.create({
      batch_code: finalBatchCode,
      batch_name: finalBatchName,
      course: course_id || null,
      trainer: trainer_id || null,
      start_date,
      end_date: end_date || null,
      start_time,
      end_time,
      days,
      mode: mode || 'Offline - Lab 1',
      max_capacity: max_capacity ? Number(max_capacity) : 25,
      status: status || 'Ongoing',
      description: description || '',
      students: [],
    });

    return successResponse({
      message: 'Batch created successfully',
      batch_id: newBatch._id.toString(),
    }, 201);
  } catch (err) {
    console.error('Batch POST error:', err);
    return errorResponse('Failed to create batch: ' + err.message, 500);
  }
}

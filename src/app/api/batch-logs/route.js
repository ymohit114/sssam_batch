import { connectDB } from '@/lib/mongodb';
import BatchLog from '@/models/BatchLog';
import Batch from '@/models/Batch';
import User from '@/models/User';
import { getCurrentUser, errorResponse, successResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batch_id');

    const filter = {};
    if (batchId) filter.batch = batchId;
    if (user.role === 'trainer') filter.trainer = user.id;

    const logs = await BatchLog.find(filter)
      .populate('batch', 'batch_name batch_code')
      .populate('trainer', 'name')
      .sort({ log_date: -1, createdAt: -1 })
      .lean();

    const formatted = logs.map(l => ({
      id: l._id.toString(),
      batch_id: l.batch?._id?.toString(),
      batch_name: l.batch?.batch_name,
      batch_code: l.batch?.batch_code,
      trainer_id: l.trainer?._id?.toString(),
      trainer_name: l.trainer?.name,
      log_date: l.log_date,
      topic: l.topic,
      notes: l.notes,
      attendance_count: l.attendance_count,
      created_at: l.createdAt,
    }));

    return successResponse({ logs: formatted });
  } catch (err) {
    console.error('Batch logs GET error:', err);
    return errorResponse('Failed to fetch batch logs', 500);
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { batch_id, log_date, topic, notes, attendance_count } = await request.json();

    if (!batch_id || !topic) {
      return errorResponse('Batch ID and topic are required', 400);
    }

    await connectDB();

    if (user.role === 'trainer') {
      const batch = await Batch.findById(batch_id);
      if (!batch || !batch.trainer || batch.trainer.toString() !== user.id) {
        return errorResponse('You can only log sessions for your assigned batches', 403);
      }
    }

    const newLog = await BatchLog.create({
      batch: batch_id,
      trainer: user.id,
      log_date: log_date || new Date().toISOString().split('T')[0],
      topic: topic.trim(),
      notes: notes ? notes.trim() : '',
      attendance_count: attendance_count ? Number(attendance_count) : 0,
    });

    return successResponse({
      message: 'Session log added successfully',
      log_id: newLog._id.toString(),
    }, 201);
  } catch (err) {
    console.error('Batch logs POST error:', err);
    return errorResponse('Failed to add session log', 500);
  }
}

import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Batch from '@/models/Batch';
import { getCurrentUser, errorResponse, successResponse } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const trainers = await User.find({ role: 'trainer' }).select('-password').sort({ name: 1 }).lean();

    const trainerIds = trainers.map(t => t._id);
    const batches = await Batch.find({ trainer: { $in: trainerIds } })
      .populate('course', 'name code color')
      .lean();

    const enriched = trainers.map(trainer => {
      const trainerBatches = batches.filter(b => b.trainer && b.trainer.toString() === trainer._id.toString());
      const activeBatches = trainerBatches.filter(b => b.status === 'Ongoing' || b.status === 'Upcoming');
      const totalStudents = trainerBatches.reduce((acc, b) => acc + (b.students?.length || 0), 0);

      return {
        id: trainer._id.toString(),
        name: trainer.name,
        email: trainer.email,
        phone: trainer.phone,
        specialization: trainer.specialization,
        status: trainer.status,
        createdAt: trainer.createdAt,
        batches: trainerBatches.map(b => ({
          id: b._id.toString(),
          batch_code: b.batch_code,
          batch_name: b.batch_name,
          start_time: b.start_time,
          end_time: b.end_time,
          days: b.days,
          mode: b.mode,
          status: b.status,
          course_name: b.course?.name,
          course_color: b.course?.color,
          student_count: b.students?.length || 0,
        })),
        active_batch_count: activeBatches.length,
        total_batches: trainerBatches.length,
        total_students: totalStudents,
      };
    });

    return successResponse({ trainers: enriched });
  } catch (err) {
    console.error('Trainers GET error:', err);
    return errorResponse('Failed to fetch trainers', 500);
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    if (user.role !== 'counselor') {
      return errorResponse('Permission Denied: Only Counselors can register trainers', 403);
    }

    const { name, email, password, phone, specialization } = await request.json();

    if (!name || !email || !password) {
      return errorResponse('Name, email, and password are required', 400);
    }

    await connectDB();
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return errorResponse('A user with this email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newTrainer = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'trainer',
      phone: phone ? phone.trim() : null,
      specialization: specialization ? specialization.trim() : 'General Trainer',
      status: 'active',
    });

    return successResponse({
      message: 'Trainer added successfully',
      trainer: {
        id: newTrainer._id.toString(),
        name: newTrainer.name,
        email: newTrainer.email,
        phone: newTrainer.phone,
        specialization: newTrainer.specialization,
        status: newTrainer.status,
      },
    }, 201);
  } catch (err) {
    console.error('Trainers POST error:', err);
    return errorResponse('Failed to create trainer', 500);
  }
}

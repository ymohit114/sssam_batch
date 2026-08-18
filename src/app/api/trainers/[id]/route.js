import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Batch from '@/models/Batch';
import { getCurrentUser, errorResponse, successResponse } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { id } = params;
    await connectDB();

    const trainer = await User.findOne({ _id: id, role: 'trainer' }).select('-password').lean();
    if (!trainer) {
      return errorResponse('Trainer not found', 404);
    }

    const batches = await Batch.find({ trainer: id }).populate('course', 'name color').lean();

    return successResponse({
      trainer: {
        id: trainer._id.toString(),
        name: trainer.name,
        email: trainer.email,
        phone: trainer.phone,
        specialization: trainer.specialization,
        status: trainer.status,
        createdAt: trainer.createdAt,
        batches: batches.map(b => ({
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
      },
    });
  } catch (err) {
    console.error('Trainer detail GET error:', err);
    return errorResponse('Server error', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    if (user.role !== 'counselor') {
      return errorResponse('Permission Denied: Only Counselors can update trainer details', 403);
    }

    const { id } = params;
    const { name, email, phone, specialization, status, password } = await request.json();

    await connectDB();
    const existing = await User.findOne({ _id: id, role: 'trainer' });
    if (!existing) {
      return errorResponse('Trainer not found', 404);
    }

    if (email && email.trim().toLowerCase() !== existing.email) {
      const emailCheck = await User.findOne({ email: email.trim().toLowerCase(), _id: { $ne: id } });
      if (emailCheck) {
        return errorResponse('Email already used by another account', 400);
      }
      existing.email = email.trim().toLowerCase();
    }

    if (name) existing.name = name.trim();
    if (phone !== undefined) existing.phone = phone;
    if (specialization !== undefined) existing.specialization = specialization;
    if (status) existing.status = status;
    if (password && password.trim().length > 0) {
      existing.password = await bcrypt.hash(password, 10);
    }

    await existing.save();

    return successResponse({ message: 'Trainer updated successfully' });
  } catch (err) {
    console.error('Trainer PUT error:', err);
    return errorResponse('Failed to update trainer', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    if (user.role !== 'counselor') {
      return errorResponse('Permission Denied: Only Counselors can delete trainers', 403);
    }

    const { id } = params;
    await connectDB();

    const existing = await User.findOne({ _id: id, role: 'trainer' });
    if (!existing) {
      return errorResponse('Trainer not found', 404);
    }

    const activeBatchesCount = await Batch.countDocuments({ trainer: id, status: 'Ongoing' });
    if (activeBatchesCount > 0) {
      return errorResponse(`Cannot delete trainer with ${activeBatchesCount} ongoing batch(es). Reassign the batches first.`, 400);
    }

    await User.findByIdAndDelete(id);

    return successResponse({ message: 'Trainer removed successfully' });
  } catch (err) {
    console.error('Trainer DELETE error:', err);
    return errorResponse('Failed to delete trainer', 500);
  }
}

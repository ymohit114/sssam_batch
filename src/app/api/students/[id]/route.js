import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import Batch from '@/models/Batch';
import { getCurrentUser, errorResponse, successResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { id } = params;
    await connectDB();

    const student = await Student.findById(id).populate('batches').lean();
    if (!student) {
      return errorResponse('Student not found', 404);
    }

    return successResponse({
      student: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        phone: student.phone,
        enrollment_no: student.enrollment_no,
        city: student.city,
        status: student.status,
        batches: student.batches || [],
      },
    });
  } catch (err) {
    console.error('Student detail GET error:', err);
    return errorResponse('Server error', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { id } = params;
    const { name, email, phone, city, status } = await request.json();

    await connectDB();
    const student = await Student.findById(id);
    if (!student) {
      return errorResponse('Student not found', 404);
    }

    if (name) student.name = name.trim();
    if (email !== undefined) student.email = email ? email.trim().toLowerCase() : null;
    if (phone !== undefined) student.phone = phone ? phone.trim() : null;
    if (city !== undefined) student.city = city ? city.trim() : null;
    if (status) student.status = status;

    await student.save();

    return successResponse({ message: 'Student information updated successfully' });
  } catch (err) {
    console.error('Student PUT error:', err);
    return errorResponse('Failed to update student', 500);
  }
}

// STRICT RESTRICTION: Only Counselor can remove/delete students!
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    if (user.role !== 'counselor') {
      return errorResponse(
        'Permission Denied: Only Counselors/Admins are authorized to delete students. Trainers can only add students.',
        403
      );
    }

    const { id } = params;
    await connectDB();

    const student = await Student.findById(id);
    if (!student) {
      return errorResponse('Student not found', 404);
    }

    // Remove student from all batches
    await Batch.updateMany(
      { 'students.student': id },
      { $pull: { students: { student: id } } }
    );

    await Student.findByIdAndDelete(id);

    return successResponse({ message: `Student "${student.name}" removed successfully` });
  } catch (err) {
    console.error('Student DELETE error:', err);
    return errorResponse('Failed to delete student', 500);
  }
}

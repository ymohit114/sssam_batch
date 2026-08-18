import { connectDB } from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Student from '@/models/Student';
import { getCurrentUser, errorResponse, successResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    if (user.role !== 'counselor') {
      return errorResponse(
        'Permission Denied: Only Counselors have permissions to remove/unenroll students from batches.',
        403
      );
    }

    const { id: batchId, studentId } = params;
    await connectDB();

    await Batch.findByIdAndUpdate(batchId, {
      $pull: { students: { student: studentId } },
    });

    await Student.findByIdAndUpdate(studentId, {
      $pull: { batches: batchId },
    });

    return successResponse({ message: 'Student removed from batch successfully' });
  } catch (err) {
    console.error('Unenroll DELETE error:', err);
    return errorResponse('Failed to remove student from batch', 500);
  }
}

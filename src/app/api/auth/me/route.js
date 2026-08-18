import { getCurrentUser, errorResponse, successResponse } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = await getCurrentUser(request);
    if (!authUser) {
      return errorResponse('Not authenticated', 401);
    }

    await connectDB();
    const user = await User.findById(authUser.id).select('-password');

    if (!user || user.status === 'inactive') {
      return errorResponse('User not found or inactive', 401);
    }

    return successResponse({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        specialization: user.specialization,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Me endpoint error:', err);
    return errorResponse('Server error', 500);
  }
}

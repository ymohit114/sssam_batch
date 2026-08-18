import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, errorResponse, successResponse } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    if (user.status === 'inactive') {
      return errorResponse('This account has been deactivated. Please contact administration.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse('Invalid email or password', 401);
    }

    const payload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization,
      phone: user.phone,
    };

    const token = signToken(payload);

    const cookieStore = cookies();
    cookieStore.set('sssam_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return successResponse({
      message: 'Login successful',
      user: payload,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return errorResponse('An internal server error occurred', 500);
  }
}

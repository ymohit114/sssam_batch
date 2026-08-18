import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'sssam_batch_management_secret_key_2026_secure';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(request) {
  let token = null;

  // Check Authorization header
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // Check cookies
  if (!token) {
    try {
      const cookieStore = cookies();
      const tokenCookie = cookieStore.get('sssam_auth_token');
      if (tokenCookie) {
        token = tokenCookie.value;
      }
    } catch (e) {
      // Cookie store may not be available in all contexts
    }
  }

  if (!token) return null;
  return verifyToken(token);
}

export function errorResponse(message, status = 400) {
  return NextResponse.json({ error: message, success: false }, { status });
}

export function successResponse(data, status = 200) {
  return NextResponse.json({ ...data, success: true }, { status });
}

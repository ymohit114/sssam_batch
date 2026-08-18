import { successResponse } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete('sssam_auth_token');
  return successResponse({ message: 'Logged out successfully' });
}

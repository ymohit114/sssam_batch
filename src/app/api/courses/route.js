import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import Batch from '@/models/Batch';
import { getCurrentUser, errorResponse, successResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const courses = await Course.find().sort({ name: 1 }).lean();

    const formatted = await Promise.all(courses.map(async (c) => {
      const batch_count = await Batch.countDocuments({ course: c._id });
      return {
        id: c._id.toString(),
        name: c.name,
        code: c.code,
        duration_weeks: c.duration_weeks,
        color: c.color,
        description: c.description,
        batch_count,
      };
    }));

    return successResponse({ courses: formatted });
  } catch (err) {
    console.error('Courses GET error:', err);
    return errorResponse('Failed to fetch courses', 500);
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    if (user.role !== 'counselor') {
      return errorResponse('Permission Denied: Only Counselors can create courses', 403);
    }

    const { name, code, duration_weeks, color, description } = await request.json();
    if (!name || !code) {
      return errorResponse('Course name and code are required', 400);
    }

    await connectDB();
    const newCourse = await Course.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      duration_weeks: duration_weeks ? Number(duration_weeks) : 12,
      color: color || '#4f46e5',
      description: description ? description.trim() : '',
    });

    return successResponse({
      message: 'Course created successfully',
      course_id: newCourse._id.toString(),
    }, 201);
  } catch (err) {
    console.error('Courses POST error:', err);
    return errorResponse('Failed to create course: ' + err.message, 500);
  }
}

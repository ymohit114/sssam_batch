import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sssam_batch_management';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB connected successfully to:', MONGODB_URI);
      initDefaultAdmin();
      return mongooseInstance;
    }).catch(err => {
      console.error('MongoDB connection error:', err.message);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Auto-creates default Counselor Admin if no users exist
async function initDefaultAdmin() {
  try {
    const User = (await import('@/models/User')).default;
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Initializing clean Counselor Admin account...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Amit Sharma',
        email: 'counselor@sssam.com',
        password: hashedPassword,
        role: 'counselor',
        phone: '+91 98765 00001',
        specialization: 'Academic & Batch Counselor',
        status: 'active',
      });
      console.log('Counselor Admin created: counselor@sssam.com / admin123');

      // Create standard course categories (clean metadata)
      const Course = (await import('@/models/Course')).default;
      const courseCount = await Course.countDocuments();
      if (courseCount === 0) {
        await Course.insertMany([
          { name: 'Full Stack Web Development', code: 'FSWD', duration_weeks: 16, color: '#6366f1' },
          { name: 'Data Science & AI', code: 'DSAI', duration_weeks: 20, color: '#06b6d4' },
          { name: 'Cloud & DevOps Engineering', code: 'CDEV', duration_weeks: 14, color: '#10b981' },
          { name: 'UI/UX Product Design', code: 'UIUX', duration_weeks: 10, color: '#f59e0b' },
        ]);
      }
    }
  } catch (err) {
    console.error('Default admin initialization error:', err.message);
  }
}

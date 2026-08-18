import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  duration_weeks: { type: Number, default: 12 },
  color: { type: String, default: '#4f46e5' },
  description: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);

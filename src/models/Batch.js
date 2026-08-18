import mongoose from 'mongoose';

const BatchEnrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  enrolled_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, trim: true },
  enrolled_at: { type: Date, default: Date.now },
});

const BatchSchema = new mongoose.Schema({
  batch_code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  batch_name: { type: String, required: true, trim: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  start_date: { type: String, required: true },
  end_date: { type: String },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  days: { type: String, required: true, default: 'Mon,Tue,Wed,Thu' },
  mode: { type: String, default: 'Offline - Lab 1' },
  max_capacity: { type: Number, default: 25 },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed', 'On Hold'], default: 'Ongoing' },
  description: { type: String, trim: true },
  students: [BatchEnrollmentSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Batch || mongoose.model('Batch', BatchSchema);

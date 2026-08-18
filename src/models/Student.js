import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  course_name: { type: String, trim: true },
  enrollment_no: { type: String, required: true, unique: true, uppercase: true, trim: true },
  city: { type: String, default: 'Delhi', trim: true },
  status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' },
  batches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);

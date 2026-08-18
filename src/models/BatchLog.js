import mongoose from 'mongoose';

const BatchLogSchema = new mongoose.Schema({
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  log_date: { type: String, required: true },
  topic: { type: String, required: true, trim: true },
  notes: { type: String, trim: true },
  attendance_count: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.BatchLog || mongoose.model('BatchLog', BatchLogSchema);

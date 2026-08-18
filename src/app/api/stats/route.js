import { connectDB } from '@/lib/mongodb';
import Batch from '@/models/Batch';
import User from '@/models/User';
import Student from '@/models/Student';
import Course from '@/models/Course';
import BatchLog from '@/models/BatchLog';
import { getCurrentUser, errorResponse, successResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();

    if (user.role === 'counselor') {
      const [
        totalBatches,
        ongoingBatches,
        upcomingBatches,
        completedBatches,
        totalTrainers,
        activeTrainers,
        totalStudents,
        trainers,
        recentBatchesList,
        courses,
      ] = await Promise.all([
        Batch.countDocuments(),
        Batch.countDocuments({ status: 'Ongoing' }),
        Batch.countDocuments({ status: 'Upcoming' }),
        Batch.countDocuments({ status: 'Completed' }),
        User.countDocuments({ role: 'trainer' }),
        User.countDocuments({ role: 'trainer', status: 'active' }),
        Student.countDocuments(),
        User.find({ role: 'trainer' }).select('name email specialization').lean(),
        Batch.find()
          .populate('trainer', 'name email phone specialization')
          .populate('course', 'name code color')
          .sort({ start_time: 1, createdAt: -1 })
          .limit(6)
          .lean(),
        Course.find().lean(),
      ]);

      // Calculate total enrollments
      const allBatches = await Batch.find().select('trainer status students course').lean();
      const totalEnrollments = allBatches.reduce((acc, b) => acc + (b.students?.length || 0), 0);

      // Trainer workload
      const trainerWorkload = trainers.map(tr => {
        const trBatches = allBatches.filter(b => b.trainer && b.trainer.toString() === tr._id.toString());
        const ongoingCount = trBatches.filter(b => b.status === 'Ongoing').length;
        const totalTrStudents = trBatches.reduce((acc, b) => acc + (b.students?.length || 0), 0);
        return {
          id: tr._id.toString(),
          name: tr.name,
          email: tr.email,
          specialization: tr.specialization,
          batch_count: trBatches.length,
          ongoing_count: ongoingCount,
          total_students: totalTrStudents,
        };
      }).sort((a, b) => b.ongoing_count - a.ongoing_count);

      // Course distribution
      const courseDistribution = courses.map(c => {
        const cBatches = allBatches.filter(b => b.course && b.course.toString() === c._id.toString());
        const totalCStudents = cBatches.reduce((acc, b) => acc + (b.students?.length || 0), 0);
        return {
          id: c._id.toString(),
          name: c.name,
          color: c.color,
          batch_count: cBatches.length,
          student_count: totalCStudents,
        };
      });

      const formattedRecent = recentBatchesList.map(b => ({
        id: b._id.toString(),
        batch_code: b.batch_code,
        batch_name: b.batch_name,
        trainer_name: b.trainer?.name,
        course_name: b.course?.name,
        course_color: b.course?.color,
        start_time: b.start_time,
        end_time: b.end_time,
        days: b.days,
        mode: b.mode,
        max_capacity: b.max_capacity,
        status: b.status,
        student_count: b.students?.length || 0,
      }));

      return successResponse({
        stats: {
          totalBatches,
          ongoingBatches,
          upcomingBatches,
          completedBatches,
          totalTrainers,
          activeTrainers,
          totalStudents,
          totalEnrollments,
          trainerWorkload,
          recentBatches: formattedRecent,
          courseDistribution,
        },
      });
    } else {
      // Trainer Personal Dashboard Stats
      const trainerId = user.id;

      const [
        totalMyBatches,
        ongoingMyBatches,
        upcomingMyBatches,
        myBatches,
        recentLogs,
      ] = await Promise.all([
        Batch.countDocuments({ trainer: trainerId }),
        Batch.countDocuments({ trainer: trainerId, status: 'Ongoing' }),
        Batch.countDocuments({ trainer: trainerId, status: 'Upcoming' }),
        Batch.find({ trainer: trainerId })
          .populate('course', 'name color code')
          .sort({ start_time: 1 })
          .lean(),
        BatchLog.find({ trainer: trainerId })
          .populate('batch', 'batch_name batch_code')
          .sort({ log_date: -1 })
          .limit(5)
          .lean(),
      ]);

      const myBatchIds = myBatches.map(b => b._id);
      const totalMyStudents = await Student.countDocuments({ batches: { $in: myBatchIds } });

      const formattedMyBatches = myBatches.map(b => ({
        id: b._id.toString(),
        batch_code: b.batch_code,
        batch_name: b.batch_name,
        course_name: b.course?.name,
        course_color: b.course?.color,
        start_time: b.start_time,
        end_time: b.end_time,
        days: b.days,
        mode: b.mode,
        max_capacity: b.max_capacity,
        status: b.status,
        student_count: b.students?.length || 0,
      }));

      const formattedLogs = recentLogs.map(l => ({
        id: l._id.toString(),
        batch_name: l.batch?.batch_name,
        batch_code: l.batch?.batch_code,
        log_date: l.log_date,
        topic: l.topic,
        notes: l.notes,
        attendance_count: l.attendance_count,
      }));

      return successResponse({
        stats: {
          totalMyBatches,
          ongoingMyBatches,
          upcomingMyBatches,
          totalMyStudents,
          myBatches: formattedMyBatches,
          recentLogs: formattedLogs,
        },
      });
    }
  } catch (err) {
    console.error('Stats GET error:', err);
    return errorResponse('Failed to fetch stats', 500);
  }
}

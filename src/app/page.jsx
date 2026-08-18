'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import StatCard from '@/components/StatCard';
import CreateBatchModal from '@/components/Modals/CreateBatchModal';
import AddTrainerModal from '@/components/Modals/AddTrainerModal';
import EnrollStudentModal from '@/components/Modals/EnrollStudentModal';
import BatchDetailModal from '@/components/Modals/BatchDetailModal';
import LogSessionModal from '@/components/Modals/LogSessionModal';
import {
  Layers,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  PlusCircle,
  UserPlus,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  MapPin,
  Sparkles,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isCounselor, isTrainer } = useAuth();
  const { showError } = useToast();

  const [statsData, setStatsData] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [isAddTrainerOpen, setIsAddTrainerOpen] = useState(false);
  const [isEnrollStudentOpen, setIsEnrollStudentOpen] = useState(false);
  const [selectedBatchForEnroll, setSelectedBatchForEnroll] = useState(null);
  const [selectedBatchForDetail, setSelectedBatchForDetail] = useState(null);
  const [isLogSessionOpen, setIsLogSessionOpen] = useState(false);
  const [selectedBatchForLog, setSelectedBatchForLog] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [statsRes, trainersRes, coursesRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/trainers'),
        fetch('/api/courses'),
      ]);

      const statsJson = await statsRes.json();
      const trainersJson = await trainersRes.json();
      const coursesJson = await coursesRes.json();

      if (statsJson.success) setStatsData(statsJson.stats);
      if (trainersJson.success) setTrainers(trainersJson.trainers);
      if (coursesJson.success) setCourses(coursesJson.courses);
    } catch (err) {
      showError('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, [user, showError]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading, router, fetchDashboardData]);

  if (authLoading || (!user && loading)) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs text-slate-500 font-semibold">Loading SSSAM Portal...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm relative overflow-hidden ${
        isCounselor
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white border-slate-800'
          : 'bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white border-slate-800'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isCounselor ? 'bg-purple-500/30 text-purple-200 border border-purple-400/30' : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
              }`}>
                {isCounselor ? '👑 Counselor Admin Console' : '🧑‍🏫 Trainer Faculty Portal'}
              </span>
              <span className="text-xs text-slate-300 font-medium">• Academic Session 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {isCounselor
                ? 'Full administrative control over trainer assignments, batch schedules, timings, capacity, and student roster enrollments.'
                : `Assigned Trainer for ${user.specialization || 'Academic Batches'}. Track your daily timings, view enrolled students, and enroll new students.`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isCounselor ? (
              <>
                <button
                  onClick={() => setIsCreateBatchOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Batch</span>
                </button>
                <button
                  onClick={() => setIsAddTrainerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl backdrop-blur-xs transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Trainer</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setSelectedBatchForEnroll(statsData?.myBatches?.[0]?.id || null);
                    setIsEnrollStudentOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Student to My Batch</span>
                </button>
                <Link
                  href="/batches"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl backdrop-blur-xs transition-all"
                >
                  <Layers className="w-4 h-4" />
                  <span>My Batches</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      {isCounselor ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Batches"
            value={statsData?.totalBatches || 0}
            subtitle={`${statsData?.ongoingBatches || 0} Ongoing • ${statsData?.upcomingBatches || 0} Upcoming`}
            icon={Layers}
            color="indigo"
          />
          <StatCard
            title="Active Trainers"
            value={statsData?.activeTrainers || 0}
            subtitle={`Faculty members scheduled`}
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Total Students"
            value={statsData?.totalStudents || 0}
            subtitle={`${statsData?.totalEnrollments || 0} Total batch enrollments`}
            icon={GraduationCap}
            color="emerald"
          />
          <StatCard
            title="Master Timetable"
            value={`${statsData?.ongoingBatches || 0} Slots`}
            subtitle="View full daily schedule"
            icon={Clock}
            color="amber"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="My Assigned Batches"
            value={statsData?.totalMyBatches || 0}
            subtitle={`${statsData?.ongoingMyBatches || 0} Active Ongoing`}
            icon={Layers}
            color="emerald"
          />
          <StatCard
            title="My Enrolled Students"
            value={statsData?.totalMyStudents || 0}
            subtitle="Students across your batches"
            icon={GraduationCap}
            color="indigo"
          />
          <StatCard
            title="Daily Status"
            value="Active"
            subtitle={`${statsData?.ongoingMyBatches || 0} sessions running`}
            icon={Clock}
            color="amber"
          />
        </div>
      )}

      {/* Counselor Dashboard Sections */}
      {isCounselor && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Batches & Schedule List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <span>Active Batches &amp; Timings Overview</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Batches currently running with trainer allocations &amp; seat occupancy
                </p>
              </div>
              <Link
                href="/batches"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {statsData?.recentBatches?.map((batch) => {
                const occupancy = Math.round(((batch.student_count || 0) / batch.max_capacity) * 100);
                return (
                  <div
                    key={batch.id}
                    onClick={() => setSelectedBatchForDetail(batch.id)}
                    className="cursor-pointer bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {batch.batch_code}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        batch.status === 'Ongoing'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {batch.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {batch.batch_name}
                    </h4>

                    <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{batch.start_time} - {batch.end_time}</span>
                        <span className="text-[10px] font-normal text-slate-500">({batch.days})</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>Trainer: <strong>{batch.trainer_name || 'Unassigned'}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{batch.mode}</span>
                      </div>
                    </div>

                    {/* Mini capacity bar */}
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Enrollment</span>
                        <span className="font-semibold text-slate-800">{batch.student_count || 0}/{batch.max_capacity} ({occupancy}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min(occupancy, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trainer Workload Sidebar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>Trainer Allocations</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Batches assigned per trainer
                </p>
              </div>
              <Link
                href="/trainers"
                className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <span>Manage</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
              {statsData?.trainerWorkload?.map((tr) => (
                <div
                  key={tr.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-purple-50/50 hover:border-purple-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-slate-900">
                      {tr.name}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {tr.batch_count || 0} Batches
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {tr.specialization}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                    <span>{tr.ongoing_count || 0} Ongoing batches</span>
                    <span>{tr.total_students || 0} Students</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Trainer Dashboard View */}
      {isTrainer && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>My Assigned Batches &amp; Daily Schedule</span>
              </h3>
              <p className="text-xs text-slate-500">
                Classroom timings, student rosters, and quick student enrollment
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedBatchForEnroll(statsData?.myBatches?.[0]?.id || null);
                setIsEnrollStudentOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statsData?.myBatches?.map((batch) => {
              const occupancy = Math.round(((batch.student_count || 0) / batch.max_capacity) * 100);
              return (
                <div
                  key={batch.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {batch.batch_code}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {batch.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {batch.batch_name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{batch.course_name}</p>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{batch.start_time} - {batch.end_time}</span>
                        <span className="text-slate-400 font-normal">({batch.days})</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-600 px-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{batch.mode}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs px-1 pt-1 font-semibold text-slate-700">
                        <span>Students Enrolled:</span>
                        <span>{batch.student_count || 0} / {batch.max_capacity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedBatchForDetail(batch.id)}
                      className="py-1.5 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-center transition-colors"
                    >
                      View Students
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBatchForLog(batch);
                        setIsLogSessionOpen(true);
                      }}
                      className="py-1.5 px-3 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-center transition-colors"
                    >
                      Log Session
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Session Logs */}
          {statsData?.recentLogs?.length > 0 && (
            <div className="mt-8 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>My Recent Class Activity Logs</span>
              </h3>
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {statsData.recentLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <span>{log.batch_name}</span>
                        <span className="font-normal text-slate-400">• {log.log_date}</span>
                      </div>
                      <div className="text-slate-700 font-semibold mt-1">
                        Topic: {log.topic}
                      </div>
                      {log.notes && <div className="text-slate-500 mt-0.5">{log.notes}</div>}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                        {log.attendance_count} Present
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateBatchModal
        isOpen={isCreateBatchOpen}
        onClose={() => setIsCreateBatchOpen(false)}
        onSuccess={fetchDashboardData}
        trainers={trainers}
        courses={courses}
      />

      <AddTrainerModal
        isOpen={isAddTrainerOpen}
        onClose={() => setIsAddTrainerOpen(false)}
        onSuccess={fetchDashboardData}
      />

      <EnrollStudentModal
        isOpen={isEnrollStudentOpen}
        onClose={() => setIsEnrollStudentOpen(false)}
        onSuccess={fetchDashboardData}
        defaultBatchId={selectedBatchForEnroll}
        batches={isCounselor ? (statsData?.recentBatches || []) : (statsData?.myBatches || [])}
      />

      <BatchDetailModal
        batchId={selectedBatchForDetail}
        isOpen={!!selectedBatchForDetail}
        onClose={() => setSelectedBatchForDetail(null)}
        onOpenEnrollStudent={(bId) => {
          setSelectedBatchForEnroll(bId);
          setIsEnrollStudentOpen(true);
        }}
        onDataChanged={fetchDashboardData}
      />

      <LogSessionModal
        isOpen={isLogSessionOpen}
        onClose={() => setIsLogSessionOpen(false)}
        onSuccess={fetchDashboardData}
        batchId={selectedBatchForLog?.id}
        batchName={selectedBatchForLog?.batch_name}
        currentEnrolled={selectedBatchForLog?.student_count}
      />

    </div>
  );
}

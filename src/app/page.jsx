'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import CreateBatchModal from '@/components/Modals/CreateBatchModal';
import EnrollStudentModal from '@/components/Modals/EnrollStudentModal';
import BatchDetailModal from '@/components/Modals/BatchDetailModal';
import {
  Users,
  Plus,
  Clock,
  Calendar,
  Eye,
  Trash2,
  Edit,
  ArrowRight,
  ArrowLeft,
  Search,
  BookOpen,
  Mail,
  Phone,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user, isCounselor, isTrainer, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [trainers, setTrainers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Trainer profile view for Counselor (null = show all trainers list)
  const [selectedTrainerId, setSelectedTrainerId] = useState(null);
  const [trainerSearchQuery, setTrainerSearchQuery] = useState('');

  // Modals state
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [preselectedTrainer, setPreselectedTrainer] = useState(null);
  const [editBatchData, setEditBatchData] = useState(null);

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollBatchId, setEnrollBatchId] = useState(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailBatchId, setDetailBatchId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [trRes, btRes] = await Promise.all([
        fetch('/api/trainers'),
        fetch('/api/batches'),
      ]);
      const trData = await trRes.json();
      const btData = await btRes.json();

      if (trData.trainers) setTrainers(trData.trainers);
      if (btData.batches) setBatches(btData.batches);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleDeleteBatch = async (batchId, batchName) => {
    if (!confirm(`Are you sure you want to delete batch "${batchName}"?`)) return;
    try {
      const res = await fetch(`/api/batches/${batchId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete batch');
      showSuccess(data.message || 'Batch deleted');
      fetchData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleOpenCreateForTrainer = (trainerId) => {
    setEditBatchData(null);
    setPreselectedTrainer(trainerId);
    setShowCreateBatch(true);
  };

  const handleOpenEditBatch = (batch) => {
    setEditBatchData(batch);
    setPreselectedTrainer(batch.trainer_id);
    setShowCreateBatch(true);
  };

  const handleOpenEnroll = (batchId) => {
    setEnrollBatchId(batchId);
    setShowEnrollModal(true);
  };

  const handleOpenDetail = (batchId) => {
    setDetailBatchId(batchId);
    setShowDetailModal(true);
  };

  if (authLoading || !user || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
          <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading batch system...</span>
        </div>
      </div>
    );
  }

  // Filter active trainers (excluding counselor)
  const activeTrainers = trainers.filter(t => t.role ? t.role === 'trainer' : true);

  // Filtered trainers for search
  const filteredTrainers = activeTrainers.filter(t => 
    t.name?.toLowerCase().includes(trainerSearchQuery.toLowerCase()) ||
    t.specialization?.toLowerCase().includes(trainerSearchQuery.toLowerCase())
  );

  // Selected trainer object
  const currentSelectedTrainer = selectedTrainerId
    ? activeTrainers.find(t => t.id === selectedTrainerId)
    : null;

  const currentTrainerBatches = currentSelectedTrainer
    ? batches.filter(
        b => (b.trainer_id && b.trainer_id === currentSelectedTrainer.id) ||
             (b.trainer_name && b.trainer_name.toLowerCase().includes(currentSelectedTrainer.name.toLowerCase()))
      )
    : [];

  // If logged in as trainer, filter only their own
  const myBatches = isTrainer
    ? batches.filter(b => b.trainer_name?.toLowerCase().includes(user?.name?.toLowerCase()))
    : batches;

  // Trainer color palette helper
  const getTrainerTheme = (idx) => {
    const themes = [
      { bg: 'bg-indigo-600', lightBg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', badge: 'bg-indigo-100 text-indigo-800' },
      { bg: 'bg-emerald-600', lightBg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-800' },
      { bg: 'bg-sky-600', lightBg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100', badge: 'bg-sky-100 text-sky-800' },
      { bg: 'bg-amber-600', lightBg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', badge: 'bg-amber-100 text-amber-800' },
      { bg: 'bg-rose-600', lightBg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', badge: 'bg-rose-100 text-rose-800' },
    ];
    return themes[idx % themes.length];
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-purple-100 text-purple-800">
              {isCounselor ? '👑 Counselor Portal' : '🧑‍🏫 Trainer Portal'}
            </span>
            <span className="text-xs text-slate-400 font-medium">SSSAM Institute</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isCounselor
              ? (currentSelectedTrainer ? `${currentSelectedTrainer.name} - Batch Management` : 'Institute Trainers & Batches')
              : `Welcome, ${user?.name}!`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isCounselor
              ? (currentSelectedTrainer
                  ? `Viewing all batches, timetable, and enrolled students for ${currentSelectedTrainer.name} (${currentSelectedTrainer.specialization}).`
                  : `Select any trainer from the list below to manage their batch timings and students.`)
              : 'Here are your active batches, class timings, and enrolled students.'}
          </p>
        </div>

        {/* Global Action Buttons */}
        {isCounselor && (
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                setEditBatchData(null);
                setPreselectedTrainer(selectedTrainerId || null);
                setShowCreateBatch(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Batch</span>
            </button>
            <button
              onClick={() => {
                setEnrollBatchId(null);
                setShowEnrollModal(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
            >
              <Users className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
          </div>
        )}
      </div>

      {/* COUNSELOR VIEW 1: PROPER TRAINERS LIST TABLE */}
      {isCounselor && !selectedTrainerId && (
        <div className="space-y-4">
          
          {/* List Header & Search Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span>All Trainers Directory ({activeTrainers.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click on any trainer row to open their timetable and manage batches
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search trainer name or subject..."
                value={trainerSearchQuery}
                onChange={(e) => setTrainerSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50 focus:bg-white text-slate-900"
              />
            </div>
          </div>

          {/* Proper Table List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Trainer Name</th>
                    <th className="px-6 py-4">Specialization / Subject</th>
                    <th className="px-6 py-4">Active Batches</th>
                    <th className="px-6 py-4">Total Students</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium">
                  {filteredTrainers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold text-xs">
                        No trainers found matching "{trainerSearchQuery}"
                      </td>
                    </tr>
                  ) : (
                    filteredTrainers.map((trainer, idx) => {
                      const trainerBatches = batches.filter(
                        b => (b.trainer_id && b.trainer_id === trainer.id) ||
                             (b.trainer_name && b.trainer_name.toLowerCase().includes(trainer.name.toLowerCase()))
                      );
                      const totalStudents = trainerBatches.reduce((acc, b) => acc + (b.student_count || 0), 0);

                      const initials = trainer.name
                        ? trainer.name.split(' ').map(n => n[0]).join('').toUpperCase()
                        : 'TR';

                      const theme = getTrainerTheme(idx);

                      return (
                        <tr
                          key={trainer.id}
                          onClick={() => setSelectedTrainerId(trainer.id)}
                          className="hover:bg-purple-50/50 cursor-pointer transition-colors group"
                        >
                          
                          {/* Trainer Info */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl ${theme.bg} text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform`}>
                                {initials}
                              </div>
                              <div>
                                <div className="text-sm font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                                  {trainer.name}
                                </div>
                                <div className="text-[11px] text-slate-400 font-medium">
                                  {trainer.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Domain / Subject */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${theme.badge} ${theme.border}`}>
                              {trainer.specialization || 'Trainer'}
                            </span>
                          </td>

                          {/* Batches Count */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <Clock className="w-4 h-4 text-purple-600" />
                              <span>{trainerBatches.length} Batch{trainerBatches.length !== 1 ? 'es' : ''}</span>
                            </div>
                          </td>

                          {/* Students Count */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <Users className="w-4 h-4 text-emerald-600" />
                              <span>{totalStudents} Student{totalStudents !== 1 ? 's' : ''}</span>
                            </div>
                          </td>

                          {/* Action Button */}
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTrainerId(trainer.id);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all hover:scale-105"
                            >
                              <span>Manage Batches</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* COUNSELOR VIEW 2: INDIVIDUAL TRAINER PROFILE & BATCH MANAGEMENT */}
      {isCounselor && selectedTrainerId && currentSelectedTrainer && (
        <div className="space-y-6">
          
          {/* Back Button & Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setSelectedTrainerId(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>← Back to All Trainers</span>
            </button>

            {/* Quick Switch Pills for all trainers */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 font-bold mr-1 hidden sm:inline">Switch Trainer:</span>
              {activeTrainers.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrainerId(t.id)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                    t.id === selectedTrainerId
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Trainer Info Header Card */}
          <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-purple-500/20">
                {currentSelectedTrainer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {currentSelectedTrainer.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                    {currentSelectedTrainer.specialization}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5 font-semibold">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentSelectedTrainer.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>{currentTrainerBatches.length} Active Batches</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleOpenCreateForTrainer(currentSelectedTrainer.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Batch for {currentSelectedTrainer.name.split(' ')[0]}</span>
            </button>
          </div>

          {/* Trainer's Batches List */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Assigned Batches &amp; Timetable ({currentTrainerBatches.length})</span>
            </h3>

            {currentTrainerBatches.length === 0 ? (
              <div className="bg-white text-center py-14 px-4 rounded-3xl border-2 border-dashed border-slate-200 shadow-xs">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">No batches assigned to {currentSelectedTrainer.name} yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Click the button below to assign class timings, subject name, and days for this trainer.
                </p>
                <button
                  onClick={() => handleOpenCreateForTrainer(currentSelectedTrainer.id)}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-purple-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Batch for {currentSelectedTrainer.name}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTrainerBatches.map((batch) => (
                  <BatchCard
                    key={batch.id}
                    batch={batch}
                    isCounselor={isCounselor}
                    onOpenDetail={handleOpenDetail}
                    onOpenEnroll={handleOpenEnroll}
                    onOpenEdit={handleOpenEditBatch}
                    onDelete={handleDeleteBatch}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TRAINER VIEW: Direct personal schedule for logged-in Trainer */}
      {isTrainer && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                My Assigned Batches &amp; Class Timings
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                You can view timings and add new students to your batches.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
              {myBatches.length} Batches Active
            </div>
          </div>

          {myBatches.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No active batches assigned to you right now</p>
              <p className="text-xs text-slate-400 mt-1">Counselor Saloni will allocate your batch timings soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myBatches.map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  isCounselor={false}
                  onOpenDetail={handleOpenDetail}
                  onOpenEnroll={handleOpenEnroll}
                  onOpenEdit={null}
                  onDelete={null}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateBatchModal
        isOpen={showCreateBatch}
        onClose={() => setShowCreateBatch(false)}
        onSuccess={fetchData}
        editBatch={editBatchData}
        preselectedTrainerId={preselectedTrainer}
      />

      <EnrollStudentModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        onSuccess={fetchData}
        defaultBatchId={enrollBatchId}
      />

      <BatchDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        batchId={detailBatchId}
        onBatchUpdated={fetchData}
      />

    </div>
  );
}

function formatDisplayTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  let hour = parseInt(h, 10);
  if (isNaN(hour)) return timeStr;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${m || '00'} ${ampm}`;
}

// Single Clean Batch Card Component
function BatchCard({ batch, isCounselor, onOpenDetail, onOpenEnroll, onOpenEdit, onDelete }) {
  const isWeekend = batch.days?.toLowerCase().includes('sat') || batch.days?.toLowerCase().includes('sun');

  return (
    <div className="bg-white hover:bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 transition-all group shadow-xs hover:shadow-md">
      
      {/* Top Details */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-900">
              {batch.batch_name}
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
              {batch.batch_code}
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">
            Trainer: <strong className="text-slate-800">{batch.trainer_name || 'Unassigned'}</strong>
          </p>
        </div>

        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
          batch.status === 'Ongoing'
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-amber-100 text-amber-800'
        }`}>
          {batch.status || 'Active'}
        </span>
      </div>

      {/* Large Timing Block */}
      <div className="mt-3 p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
              {formatDisplayTime(batch.start_time)} – {formatDisplayTime(batch.end_time)}
            </div>
            <div className="text-[11px] font-bold text-indigo-700 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isWeekend ? 'Weekend (Sat - Sun)' : 'Weekdays (Mon - Thu)'}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
            {batch.mode || 'Lab 1'}
          </span>
        </div>
      </div>

      {/* Students Count */}
      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 px-1">
        <div className="flex items-center gap-1 font-bold text-slate-700">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>{batch.student_count || 0} Enrolled Student{batch.student_count !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3.5 pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          <button
            onClick={() => onOpenDetail(batch.id)}
            className="flex-1 sm:flex-none px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-200/60 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Students ({batch.student_count || 0})</span>
          </button>

          <button
            onClick={() => onOpenEnroll(batch.id)}
            className="flex-1 sm:flex-none px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
        </div>

        {/* Counselor Edit & Delete */}
        {isCounselor && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenEdit(batch)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200/60 bg-white transition-colors"
              title="Edit Batch"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(batch.id, batch.batch_name)}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200/60 bg-white transition-colors"
              title="Delete Batch"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

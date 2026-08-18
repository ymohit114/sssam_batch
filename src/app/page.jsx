'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import CreateBatchModal from '@/components/Modals/CreateBatchModal';
import EnrollStudentModal from '@/components/Modals/EnrollStudentModal';
import BatchDetailModal from '@/components/Modals/BatchDetailModal';
import {
  Plus,
  Clock,
  Calendar,
  Users,
  MapPin,
  Trash2,
  Edit,
  Eye,
  ShieldCheck,
  UserCheck,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user, isCounselor, isTrainer, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [trainers, setTrainers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Split batches by trainer
  const mohitTrainer = trainers.find(t => t.name?.toLowerCase().includes('mohit'));
  const sudeshTrainer = trainers.find(t => t.name?.toLowerCase().includes('sudesh'));

  const mohitBatches = batches.filter(b => b.trainer_name?.toLowerCase().includes('mohit') || (mohitTrainer && b.trainer_id === mohitTrainer.id));
  const sudeshBatches = batches.filter(b => b.trainer_name?.toLowerCase().includes('sudesh') || (sudeshTrainer && b.trainer_id === sudeshTrainer.id));

  // If logged in as trainer, filter only their own
  const myBatches = isTrainer
    ? batches.filter(b => b.trainer_name?.toLowerCase().includes(user?.name?.toLowerCase()))
    : batches;

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
            {isCounselor ? 'Trainer Batches & Timetable Management' : `Welcome, ${user?.name}!`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isCounselor
              ? 'Easily view, assign, and track batch timings for Mohit Yadav & Sudesh Yadav'
              : 'Here are your active batches, class timings, and enrolled students.'}
          </p>
        </div>

        {/* Action Buttons for Counselor */}
        {isCounselor && (
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                setEditBatchData(null);
                setPreselectedTrainer(null);
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

      {/* COUNSELOR VIEW: 2 Dedicated Sections for Mohit & Sudesh */}
      {isCounselor && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* SECTION 1: Mohit Yadav */}
          <div className="bg-white rounded-3xl border border-indigo-100 shadow-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/20">
                  MY
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Mohit Yadav (Trainer)
                  </h2>
                  <p className="text-xs text-indigo-600 font-bold">
                    {mohitBatches.length} Active Batch{mohitBatches.length !== 1 ? 'es' : ''} Assigned
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenCreateForTrainer(mohitTrainer?.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Batch</span>
              </button>
            </div>

            {/* Mohit Batches List */}
            {mohitBatches.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No batches assigned to Mohit Yadav yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Batch" to allocate a time slot</p>
                <button
                  onClick={() => handleOpenCreateForTrainer(mohitTrainer?.id)}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Batch for Mohit</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {mohitBatches.map((batch) => (
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

          {/* SECTION 2: Sudesh Yadav */}
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-500/20">
                  SY
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Sudesh Yadav (Trainer)
                  </h2>
                  <p className="text-xs text-emerald-600 font-bold">
                    {sudeshBatches.length} Active Batch{sudeshBatches.length !== 1 ? 'es' : ''} Assigned
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenCreateForTrainer(sudeshTrainer?.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Batch</span>
              </button>
            </div>

            {/* Sudesh Batches List */}
            {sudeshBatches.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No batches assigned to Sudesh Yadav yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Batch" to allocate a time slot</p>
                <button
                  onClick={() => handleOpenCreateForTrainer(sudeshTrainer?.id)}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Batch for Sudesh</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sudeshBatches.map((batch) => (
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

      {/* TRAINER VIEW: Personal Schedule */}
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
        </div>

        {/* Status Badge */}
        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
          {batch.status}
        </span>
      </div>

      {/* BIG HIGH-VISIBILITY TIMING BLOCK */}
      <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-white border border-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
      <div className="mt-3.5 pt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenDetail(batch.id)}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-200/60 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
          >
            <Eye className="w-3 h-3 text-slate-500" />
            <span>Students ({batch.student_count || 0})</span>
          </button>

          <button
            onClick={() => onOpenEnroll(batch.id)}
            className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add Student</span>
          </button>
        </div>

        {/* Counselor Edit & Delete */}
        {isCounselor && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenEdit(batch)}
              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit Batch"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(batch.id, batch.batch_name)}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

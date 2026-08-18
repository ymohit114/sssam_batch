'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import CreateBatchModal from '@/components/Modals/CreateBatchModal';
import BatchDetailModal from '@/components/Modals/BatchDetailModal';
import EnrollStudentModal from '@/components/Modals/EnrollStudentModal';
import {
  Layers,
  PlusCircle,
  Search,
  Filter,
  Clock,
  Calendar,
  Users,
  MapPin,
  Edit3,
  Trash2,
  UserPlus,
  Eye,
  CheckCircle2
} from 'lucide-react';

export default function BatchesPage() {
  const { user, isCounselor, isTrainer } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [batches, setBatches] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [trainerFilter, setTrainerFilter] = useState('All');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [selectedBatchDetailId, setSelectedBatchDetailId] = useState(null);
  const [isEnrollStudentOpen, setIsEnrollStudentOpen] = useState(false);
  const [enrollBatchId, setEnrollBatchId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/api/batches';
      const params = new URLSearchParams();
      if (isTrainer) {
        params.append('my_batches', 'true');
      } else if (trainerFilter !== 'All') {
        params.append('trainer_id', trainerFilter);
      }
      if (statusFilter !== 'All') {
        params.append('status', statusFilter);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBatches(data.batches);
      }
    } catch (err) {
      showError('Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  }, [isTrainer, trainerFilter, statusFilter, showError]);

  const fetchAuxData = useCallback(async () => {
    try {
      const [trRes, crRes] = await Promise.all([
        fetch('/api/trainers'),
        fetch('/api/courses'),
      ]);
      const trData = await trRes.json();
      const crData = await crRes.json();
      if (trData.success) setTrainers(trData.trainers);
      if (crData.success) setCourses(crData.courses);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchBatches();
    fetchAuxData();
  }, [fetchBatches, fetchAuxData]);

  const handleDeleteBatch = async (batchId, batchName) => {
    if (!isCounselor) {
      showWarning('Only Counselors can delete batches.');
      return;
    }

    if (!confirm(`Are you sure you want to delete batch "${batchName}"? This will remove all enrollments.`)) {
      return;
    }

    setDeletingId(batchId);
    try {
      const res = await fetch(`/api/batches/${batchId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete batch');

      showSuccess(`Batch "${batchName}" deleted.`);
      fetchBatches();
    } catch (err) {
      showError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBatches = batches.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.batch_name.toLowerCase().includes(q) ||
      b.batch_code.toLowerCase().includes(q) ||
      (b.trainer_name && b.trainer_name.toLowerCase().includes(q)) ||
      (b.course_name && b.course_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              {isCounselor ? 'Master Administration' : 'Faculty View'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {isCounselor ? 'Batch Management & Timetable' : 'My Assigned Batches'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isCounselor
              ? 'Create, edit, schedule batches, prevent trainer timing conflicts, and oversee enrollments.'
              : 'Inspect your active batch timings, view student roster, and enroll new students.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isCounselor && (
            <button
              onClick={() => {
                setEditingBatch(null);
                setIsCreateOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Batch</span>
            </button>
          )}

          <button
            onClick={() => {
              setEnrollBatchId(batches[0]?.id || null);
              setIsEnrollStudentOpen(true);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-all ${
              isCounselor ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by batch name, code, trainer or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Trainer Filter for Counselor */}
          {isCounselor && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Trainer:</span>
              <select
                value={trainerFilter}
                onChange={(e) => setTrainerFilter(e.target.value)}
                className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="All">All Trainers</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

      </div>

      {/* Batches Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 font-semibold">Loading batches...</div>
      ) : filteredBatches.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No batches match your criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or status filter, or create a new batch.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBatches.map((batch) => {
            const occupancy = Math.round(((batch.student_count || 0) / batch.max_capacity) * 100);

            return (
              <div
                key={batch.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                {/* Card Top */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {batch.batch_code}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      batch.status === 'Ongoing'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {batch.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {batch.batch_name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{batch.course_name}</p>

                  {/* Timing Pill */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{batch.start_time} - {batch.end_time}</span>
                      <span className="text-[11px] font-normal text-slate-500">({batch.days})</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 font-medium text-[11px]">
                      <Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>Trainer: <strong className="text-slate-800">{batch.trainer_name || 'Unassigned'}</strong></span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{batch.mode}</span>
                    </div>
                  </div>

                  {/* Enrolled Students Count */}
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-bold">
                    <span>Enrolled Students</span>
                    <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{batch.student_count || 0} Students</span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedBatchDetailId(batch.id)}
                    className="flex-1 py-1.5 px-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Roster</span>
                  </button>

                  <button
                    onClick={() => {
                      setEnrollBatchId(batch.id);
                      setIsEnrollStudentOpen(true);
                    }}
                    className="py-1.5 px-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    title="Add Student to this batch"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Enroll</span>
                  </button>

                  {isCounselor && (
                    <>
                      <button
                        onClick={() => {
                          setEditingBatch(batch);
                          setIsCreateOpen(true);
                        }}
                        className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit Batch (Counselor privilege)"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteBatch(batch.id, batch.batch_name)}
                        disabled={deletingId === batch.id}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Batch (Counselor privilege)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateBatchModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchBatches}
        editBatch={editingBatch}
        trainers={trainers}
        courses={courses}
      />

      <BatchDetailModal
        batchId={selectedBatchDetailId}
        isOpen={!!selectedBatchDetailId}
        onClose={() => setSelectedBatchDetailId(null)}
        onOpenEnrollStudent={(bId) => {
          setEnrollBatchId(bId);
          setIsEnrollStudentOpen(true);
        }}
        onOpenEditBatch={(b) => {
          setEditingBatch(b);
          setIsCreateOpen(true);
        }}
        onDataChanged={fetchBatches}
      />

      <EnrollStudentModal
        isOpen={isEnrollStudentOpen}
        onClose={() => setIsEnrollStudentOpen(false)}
        onSuccess={fetchBatches}
        defaultBatchId={enrollBatchId}
        batches={batches}
      />

    </div>
  );
}

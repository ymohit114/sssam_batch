'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import AddTrainerModal from '@/components/Modals/AddTrainerModal';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  BookOpen,
  Clock,
  Layers,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Search
} from 'lucide-react';

export default function TrainersPage() {
  const { isCounselor } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchTrainers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trainers');
      const data = await res.json();
      if (data.success) {
        setTrainers(data.trainers);
      }
    } catch (err) {
      showError('Failed to fetch trainers');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  const handleDeleteTrainer = async (trainerId, trainerName) => {
    if (!isCounselor) {
      showWarning('Only Counselors have permission to delete trainers.');
      return;
    }

    if (!confirm(`Are you sure you want to remove trainer "${trainerName}"?`)) {
      return;
    }

    setDeletingId(trainerId);
    try {
      const res = await fetch(`/api/trainers/${trainerId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete trainer');

      showSuccess(`Trainer "${trainerName}" deleted.`);
      fetchTrainers();
    } catch (err) {
      showError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTrainers = trainers.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.specialization && t.specialization.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              Faculty Directory
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Trainer Management &amp; Workload
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage trainers, view which time slots they are teaching, and track their active batch assignments.
          </p>
        </div>

        {isCounselor && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Trainer</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search trainers by name, email, or domain specialization..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs focus:outline-none"
        />
      </div>

      {/* Trainers Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 font-semibold">Loading trainers...</div>
      ) : filteredTrainers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No trainers found</h3>
          <p className="text-xs text-slate-400">Click "Add New Trainer" to register a faculty member.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTrainers.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Trainer Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-md shadow-purple-500/20">
                      {trainer.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900">{trainer.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {trainer.status}
                        </span>
                      </div>
                      <div className="text-xs text-purple-700 font-semibold mt-0.5">
                        {trainer.specialization || 'General Faculty'}
                      </div>
                    </div>
                  </div>

                  {isCounselor && (
                    <button
                      onClick={() => handleDeleteTrainer(trainer.id, trainer.name)}
                      disabled={deletingId === trainer.id}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Trainer (Counselor privilege)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Contact Pills */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{trainer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{trainer.phone || 'N/A'}</span>
                  </div>
                </div>

                {/* Assigned Batches List & Timings */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Assigned Batch Timetable ({trainer.batches?.length || 0})</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {trainer.total_students || 0} Total Students
                    </span>
                  </div>

                  {trainer.batches?.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      No batches assigned yet. Go to Batches to assign.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {trainer.batches.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-200/60 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                              {b.batch_code}
                            </span>
                            <span className="font-bold text-slate-800 truncate max-w-[140px]">
                              {b.batch_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                            <span className="text-indigo-600">{b.start_time} - {b.end_time}</span>
                            <span className="text-slate-400">({b.days})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Active Batches: <strong className="text-slate-800">{trainer.active_batch_count || 0}</strong></span>
                <span>Member since {trainer.created_at ? new Date(trainer.created_at).toLocaleDateString() : '2026'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AddTrainerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchTrainers}
      />

    </div>
  );
}

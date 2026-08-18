'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import TimetableGrid from '@/components/TimetableGrid';
import BatchDetailModal from '@/components/Modals/BatchDetailModal';
import EnrollStudentModal from '@/components/Modals/EnrollStudentModal';
import CreateBatchModal from '@/components/Modals/CreateBatchModal';
import {
  Calendar,
  Clock,
  Layers,
  PlusCircle,
  Users,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function TimetablePage() {
  const { user, isCounselor, isTrainer } = useAuth();
  const { showError } = useToast();

  const [batches, setBatches] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedBatchDetailId, setSelectedBatchDetailId] = useState(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollBatchId, setEnrollBatchId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  const fetchTimetableData = useCallback(async () => {
    setLoading(true);
    try {
      const [batchesRes, trainersRes, coursesRes] = await Promise.all([
        fetch('/api/batches'),
        fetch('/api/trainers'),
        fetch('/api/courses'),
      ]);

      const batchesJson = await batchesRes.json();
      const trainersJson = await trainersRes.json();
      const coursesJson = await coursesRes.json();

      if (batchesJson.success) setBatches(batchesJson.batches);
      if (trainersJson.success) setTrainers(trainersJson.trainers);
      if (coursesJson.success) setCourses(coursesJson.courses);
    } catch (err) {
      showError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchTimetableData();
  }, [fetchTimetableData]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              {isCounselor ? 'Master Timetable' : 'Faculty Timetable'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Batch Timetable &amp; Schedule Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isCounselor
              ? 'Complete schedule matrix across all trainers and classrooms to optimize institute utilization.'
              : 'Your assigned batch timetable. Click on any batch to view the enrolled students.'}
          </p>
        </div>

        {isCounselor && (
          <button
            onClick={() => {
              setEditingBatch(null);
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Batch</span>
          </button>
        )}
      </div>

      {/* Timetable Grid View */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 font-semibold">Loading schedule grid...</div>
      ) : (
        <TimetableGrid
          batches={batches}
          trainers={trainers}
          userRole={user?.role}
          currentUserId={user?.id}
          onSelectBatch={(batch) => setSelectedBatchDetailId(batch.id)}
        />
      )}

      {/* Modals */}
      <BatchDetailModal
        batchId={selectedBatchDetailId}
        isOpen={!!selectedBatchDetailId}
        onClose={() => setSelectedBatchDetailId(null)}
        onOpenEnrollStudent={(bId) => {
          setEnrollBatchId(bId);
          setIsEnrollModalOpen(true);
        }}
        onOpenEditBatch={(b) => {
          setEditingBatch(b);
          setIsCreateOpen(true);
        }}
        onDataChanged={fetchTimetableData}
      />

      <EnrollStudentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        onSuccess={fetchTimetableData}
        defaultBatchId={enrollBatchId}
        batches={batches}
      />

      <CreateBatchModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchTimetableData}
        editBatch={editingBatch}
        trainers={trainers}
        courses={courses}
      />

    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Layers,
  Clock,
  Calendar,
  MapPin,
  Users,
  UserPlus,
  Trash2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  BookOpen,
  CheckCircle,
  Phone,
  Mail,
  Edit3
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

export default function BatchDetailModal({
  batchId,
  isOpen,
  onClose,
  onOpenEnrollStudent,
  onOpenEditBatch,
  onDataChanged
}) {
  const { showSuccess, showError, showWarning } = useToast();
  const { isCounselor, isTrainer } = useAuth();

  const [loading, setLoading] = useState(true);
  const [batchData, setBatchData] = useState(null);
  const [removingStudentId, setRemovingStudentId] = useState(null);

  const fetchBatchDetail = useCallback(async () => {
    if (!batchId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/batches/${batchId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load batch');
      setBatchData(data.batch);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [batchId, showError]);

  useEffect(() => {
    if (isOpen && batchId) {
      fetchBatchDetail();
    }
  }, [isOpen, batchId, fetchBatchDetail]);

  if (!isOpen) return null;

  const handleRemoveStudent = async (studentId, studentName) => {
    if (!isCounselor) {
      showWarning('Permission Denied: Only Counselors can remove students from batches.');
      return;
    }

    if (!confirm(`Are you sure you want to remove "${studentName}" from this batch?`)) {
      return;
    }

    setRemovingStudentId(studentId);
    try {
      const res = await fetch(`/api/batches/${batchId}/students/${studentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove student');

      showSuccess(`"${studentName}" removed from batch.`);
      fetchBatchDetail();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      showError(err.message);
    } finally {
      setRemovingStudentId(null);
    }
  };

  const occupancy = batchData ? Math.round((batchData.student_count / batchData.max_capacity) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-slide-in my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                  {batchData?.batch_code || 'Loading...'}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  batchData?.status === 'Ongoing'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {batchData?.status || 'Active'}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                {batchData?.batch_name || 'Batch Details'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCounselor && onOpenEditBatch && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEditBatch(batchData);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Batch</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400">Loading batch details...</div>
          ) : batchData ? (
            <>
              {/* Batch Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Daily Timing</span>
                  <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-800 text-xs sm:text-sm">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>{batchData.start_time} - {batchData.end_time}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Assigned Trainer</span>
                  <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-800 text-xs sm:text-sm">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="truncate">{batchData.trainer_name || 'Unassigned'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Days</span>
                  <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-800 text-xs sm:text-sm">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span>{batchData.days}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Mode / Room</span>
                  <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-800 text-xs sm:text-sm">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span className="truncate">{batchData.mode}</span>
                  </div>
                </div>
              </div>

              {/* Student Roster Section */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>Enrolled Students ({batchData.students?.length || 0})</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isCounselor
                        ? 'Counselor Full Control: You can add new students or remove enrolled students.'
                        : 'Trainer Portal: You can add students. Removal is restricted to Counselor.'}
                    </p>
                  </div>

                  {/* Add student button */}
                  <button
                    onClick={() => onOpenEnrollStudent && onOpenEnrollStudent(batchData.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Student to Batch</span>
                  </button>
                </div>

                {/* Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Course / Subject</th>
                        <th className="px-4 py-3">Enrolled At</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {batchData.students?.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                            No students enrolled in this batch yet. Click "Add Student to Batch" above to enroll.
                          </td>
                        </tr>
                      ) : (
                        batchData.students.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-900">
                              {student.name}
                            </td>
                            <td className="px-4 py-3 text-slate-700 font-bold">
                              {student.phone}
                            </td>
                            <td className="px-4 py-3 text-purple-700 font-bold">
                              <span className="bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                                {student.course_name || batchData.batch_name || 'Course'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-[11px]">
                              {student.enrolled_at ? new Date(student.enrolled_at).toLocaleDateString() : 'Active'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isCounselor ? (
                                <button
                                  onClick={() => handleRemoveStudent(student.id, student.name)}
                                  disabled={removingStudentId === student.id}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
                                  title="Remove student from batch (Counselor privilege)"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Remove</span>
                                </button>
                              ) : (
                                <span
                                  className="text-[10px] text-slate-400 italic bg-slate-100 px-2 py-0.5 rounded cursor-not-allowed"
                                  title="Only Counselors have permission to remove students"
                                >
                                  Counselor Protected
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}

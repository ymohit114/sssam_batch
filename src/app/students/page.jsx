'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import EnrollStudentModal from '@/components/Modals/EnrollStudentModal';
import {
  GraduationCap,
  UserPlus,
  Search,
  Filter,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Layers,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function StudentsPage() {
  const { user, isCounselor, isTrainer } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('All');

  // Modals
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/api/students';
      const params = new URLSearchParams();
      if (selectedBatchId !== 'All') {
        params.append('batch_id', selectedBatchId);
      }
      if (searchQuery) {
        params.append('q', searchQuery);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const headers = {};
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('sssam_auth_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers, credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (err) {
      showError('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [selectedBatchId, searchQuery, showError]);

  const fetchBatches = useCallback(async () => {
    try {
      const headers = {};
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('sssam_auth_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/batches', { headers, credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setBatches(data.batches || []);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchBatches();
  }, [fetchStudents, fetchBatches]);

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!isCounselor) {
      showWarning('Permission Denied: Only Counselors are authorized to remove students.');
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete student "${studentName}" and all their batch enrollments?`)) {
      return;
    }

    setDeletingId(studentId);
    try {
      const headers = {};
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('sssam_auth_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/students/${studentId}`, { method: 'DELETE', headers, credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete student');

      showSuccess(`Student "${studentName}" removed successfully.`);
      fetchStudents();
    } catch (err) {
      showError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter available batches in dropdown for Trainer
  const displayBatches = isTrainer
    ? batches.filter(b => b.trainer_name?.toLowerCase().includes(user?.name?.toLowerCase()))
    : batches;

  return (
    <div className="space-y-6">
      
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
              isCounselor ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isCounselor ? '👑 Institute Student Directory' : '🧑‍🏫 My Batch Students'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isCounselor ? 'Student Directory' : 'My Students Roster'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isCounselor
              ? 'Complete list of all students enrolled across all trainers and batches.'
              : 'Students enrolled exclusively in your assigned batches.'}
          </p>
        </div>

        {/* Total Students Stat Badge & Action */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-purple-700">Total Students</div>
              <div className="text-xl font-black text-slate-900 leading-none mt-0.5">{students.length}</div>
            </div>
          </div>

          <button
            onClick={() => setIsEnrollModalOpen(true)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 text-white text-xs font-bold rounded-2xl shadow-md transition-all ${
              isCounselor
                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student name, roll no, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        {/* Batch Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Batch Filter:</span>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="All">All {isTrainer ? 'My' : ''} Batches</option>
            {displayBatches.map(b => (
              <option key={b.id} value={b.id}>{b.batch_code} - {b.batch_name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 font-semibold">Loading student roster...</div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No students found</h3>
            <p className="text-xs text-slate-400">Click "Enroll New Student" to add a student to a batch.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Phone Number</th>
                  <th className="px-5 py-3.5">Course / Subject</th>
                  <th className="px-5 py-3.5">Enrolled Batch</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Student Name */}
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 text-xs">
                        {student.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {student.enrollment_no}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-3.5 text-slate-700">
                      <a href={`tel:${student.phone}`} className="flex items-center gap-1.5 font-bold text-xs hover:text-emerald-700">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{student.phone}</span>
                      </a>
                    </td>

                    {/* Course */}
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                        {student.course_name || 'General Course'}
                      </span>
                    </td>

                    {/* Enrolled Batches */}
                    <td className="px-5 py-3.5">
                      {student.batch_names ? (
                        <div className="font-semibold text-xs text-slate-800">
                          {student.batch_names}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Not assigned</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      {isCounselor ? (
                        <button
                          onClick={() => handleDeleteStudent(student.id, student.name)}
                          disabled={deletingId === student.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors shadow-2xs"
                          title="Permanently remove student (Counselor privilege)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      ) : (
                        <span
                          className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md"
                          title="Only Counselors can delete students"
                        >
                          Counselor Only
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Card View (shown only on mobile < md) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-semibold bg-white rounded-2xl border border-slate-200">
            Loading student roster...
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center space-y-2 border border-slate-200">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No students found</h3>
            <p className="text-xs text-slate-400">Click "Enroll Student" to add a student to a batch.</p>
          </div>
        ) : (
          students.map((student) => (
            <div key={student.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{student.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{student.enrollment_no}</div>
                </div>
                <span className="font-bold text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100 shrink-0">
                  {student.course_name || 'General Course'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                <a href={`tel:${student.phone}`} className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{student.phone}</span>
                </a>

                <div className="text-[11px] font-semibold text-slate-600 truncate max-w-[150px]">
                  {student.batch_names || 'No Batch'}
                </div>
              </div>

              {isCounselor && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleDeleteStudent(student.id, student.name)}
                    disabled={deletingId === student.id}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Student</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <EnrollStudentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        onSuccess={fetchStudents}
        batches={batches}
      />

    </div>
  );
}

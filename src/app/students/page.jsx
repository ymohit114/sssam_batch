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

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      showError('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [selectedBatchId, searchQuery, showError]);

  const fetchBatches = useCallback(async () => {
    try {
      const res = await fetch('/api/batches');
      const data = await res.json();
      if (data.success) {
        setBatches(data.batches);
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
      const res = await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Student Directory
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Enrolled Students Roster
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isCounselor
              ? 'Complete student records with full enrollment and removal authority.'
              : 'View enrolled students. You can enroll new students; removal is restricted to Counselor.'}
          </p>
        </div>

        <button
          onClick={() => setIsEnrollModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-all ${
            isCounselor
              ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Role Policy Reminder Box for Trainer */}
      {isTrainer && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
          <UserCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Trainer Student Management Policy:</span> You have full permissions to enroll new students into your assigned batches. To maintain central academic auditing, removing or un-enrolling students is restricted to the Counselor.
          </div>
        </div>
      )}

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
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Batch Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Batch Filter:</span>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="All">All Batches</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.batch_code} - {b.batch_name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
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
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{student.phone}</span>
                      </div>
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

                    {/* Action: Counselor has delete; Trainer has restricted status */}
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

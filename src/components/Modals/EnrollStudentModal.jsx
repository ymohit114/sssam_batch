'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

export default function EnrollStudentModal({ isOpen, onClose, onSuccess, defaultBatchId = null, batches: propBatches = [] }) {
  const { showSuccess, showError } = useToast();
  const { user, isCounselor, isTrainer } = useAuth();
  const [loading, setLoading] = useState(false);
  const [batchesList, setBatchesList] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    course_name: '',
    batch_id: '',
  });

  useEffect(() => {
    if (!isOpen) return;

    const loadBatches = async () => {
      if (propBatches && propBatches.length > 0) {
        setBatchesList(propBatches);
        setFormData(prev => ({
          ...prev,
          batch_id: defaultBatchId ? String(defaultBatchId) : String(propBatches[0].id),
        }));
      } else {
        try {
          const res = await fetch('/api/batches');
          const data = await res.json();
          if (data.batches) {
            // If trainer, filter their own batches
            const filtered = isTrainer
              ? data.batches.filter(b => b.trainer_name?.toLowerCase().includes(user?.name?.toLowerCase()))
              : data.batches;

            setBatchesList(filtered);
            setFormData(prev => ({
              ...prev,
              batch_id: defaultBatchId ? String(defaultBatchId) : (filtered[0]?.id ? String(filtered[0].id) : ''),
            }));
          }
        } catch (err) {
          console.error('Failed to load batches for student enroll:', err);
        }
      }
    };

    loadBatches();
  }, [isOpen, defaultBatchId, propBatches, isTrainer, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showError('Please enter student name');
      return;
    }
    if (!formData.phone.trim()) {
      showError('Please enter phone number');
      return;
    }
    if (!formData.batch_id) {
      showError('Please select a batch');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to enroll student');
      }

      showSuccess(`Student "${formData.name}" added successfully!`);
      setFormData({
        name: '',
        phone: '',
        course_name: '',
        batch_id: defaultBatchId || (batchesList[0]?.id ? String(batchesList[0].id) : ''),
      });
      onSuccess();
      onClose();
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-slide-in">
        
        {/* Header */}
        <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${
          isCounselor
            ? 'bg-purple-50'
            : 'bg-emerald-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold shadow-xs ${
              isCounselor ? 'bg-purple-600' : 'bg-emerald-600'
            }`}>
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Add Student to Batch</h3>
              <p className="text-[11px] text-slate-500">
                Enter student details to enroll
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simplified Form (Batch, Name, Number, Course) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Select Batch / Slot */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Batch / Timing *
            </label>
            <select
              required
              value={formData.batch_id}
              onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white text-slate-900"
            >
              <option value="">-- Choose Batch --</option>
              {batchesList.map(b => (
                <option key={b.id} value={b.id}>
                  {b.batch_name} ({b.start_time} - {b.end_time}) • {b.trainer_name}
                </option>
              ))}
            </select>
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Student Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aryan Khurana"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone / Mobile Number *
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* Student Course */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Student Course / Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Full Stack Web Development, Python, CCNA"
              value={formData.course_name}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md disabled:opacity-50 transition-all ${
                isCounselor
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              }`}
            >
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

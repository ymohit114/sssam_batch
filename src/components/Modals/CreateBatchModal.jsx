'use client';

import React, { useState, useEffect } from 'react';
import { X, Layers, Clock, AlertTriangle, UserCheck, Calendar } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const DAYS_OPTIONS = [
  { label: 'Weekdays (Mon, Tue, Wed, Thu) - 4 Days', value: 'Mon,Tue,Wed,Thu' },
  { label: 'Weekend (Sat, Sun) - 2 Days', value: 'Sat,Sun' },
  { label: 'Mon - Fri (5 Days)', value: 'Mon,Tue,Wed,Thu,Fri' },
  { label: 'Custom Days Selection', value: 'custom' },
];

const ALL_DAYS = [
  { id: 'Mon', label: 'Monday' },
  { id: 'Tue', label: 'Tuesday' },
  { id: 'Wed', label: 'Wednesday' },
  { id: 'Thu', label: 'Thursday' },
  { id: 'Fri', label: 'Friday' },
  { id: 'Sat', label: 'Saturday' },
  { id: 'Sun', label: 'Sunday' },
];

export default function CreateBatchModal({ isOpen, onClose, onSuccess, editBatch = null, trainers = [], courses = [] }) {
  const { showSuccess, showError, showWarning } = useToast();
  const [loading, setLoading] = useState(false);
  const [conflictWarning, setConflictWarning] = useState(null);

  const [formData, setFormData] = useState({
    batch_code: '',
    batch_name: '',
    course_id: '',
    trainer_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    start_time: '10:00',
    end_time: '12:00',
    days: 'Mon,Tue,Wed,Thu',
    mode: 'Offline - Lab 101',
    max_capacity: 25,
    status: 'Ongoing',
    description: '',
  });

  useEffect(() => {
    if (editBatch) {
      setFormData({
        batch_code: editBatch.batch_code || '',
        batch_name: editBatch.batch_name || '',
        course_id: editBatch.course_id || '',
        trainer_id: editBatch.trainer_id || '',
        start_date: editBatch.start_date || new Date().toISOString().split('T')[0],
        end_date: editBatch.end_date || '',
        start_time: editBatch.start_time || '10:00',
        end_time: editBatch.end_time || '12:00',
        days: editBatch.days || 'Mon,Tue,Wed,Thu',
        mode: editBatch.mode || 'Offline - Lab 101',
        max_capacity: editBatch.max_capacity || 25,
        status: editBatch.status || 'Ongoing',
        description: editBatch.description || '',
      });
    } else {
      setFormData({
        batch_code: '',
        batch_name: '',
        course_id: courses[0]?.id || '',
        trainer_id: trainers[0]?.id || '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        start_time: '10:00',
        end_time: '12:00',
        days: 'Mon,Tue,Wed,Thu',
        mode: 'Offline - Lab 101',
        max_capacity: 25,
        status: 'Ongoing',
        description: '',
      });
    }
    setConflictWarning(null);
  }, [editBatch, isOpen, trainers, courses]);

  if (!isOpen) return null;

  const handleSubmit = async (e, forceIgnoreConflict = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    setConflictWarning(null);

    try {
      const url = editBatch ? `/api/batches/${editBatch.id}` : '/api/batches';
      const method = editBatch ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ignore_conflict: forceIgnoreConflict,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setConflictWarning(data.error);
          showWarning('Timing Conflict Detected!');
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Failed to save batch');
      }

      showSuccess(editBatch ? 'Batch updated successfully!' : 'New batch created successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-slide-in my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editBatch ? 'Edit Batch Configuration' : 'Create New Batch'}
              </h3>
              <p className="text-xs text-slate-500">
                Counselor Admin: Set batch schedule, assign trainer &amp; manage timings
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

        {/* Form Body */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Conflict Warning Alert */}
          {conflictWarning && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Trainer Schedule Conflict Warning</span>
              </div>
              <p className="text-xs text-amber-700">{conflictWarning}</p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmit(null, true)}
                  className="px-3 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  Override &amp; Save Anyway
                </button>
                <button
                  type="button"
                  onClick={() => setConflictWarning(null)}
                  className="px-3 py-1 text-xs font-semibold bg-white border border-amber-300 text-amber-900 rounded-lg hover:bg-amber-100/50 transition-colors"
                >
                  Adjust Timing
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Course Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Course / Subject <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-medium"
              >
                <option value="">Select Course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            {/* Trainer Assignment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assign Trainer <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.trainer_id}
                onChange={(e) => setFormData({ ...formData, trainer_id: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-medium"
              >
                <option value="">Select Trainer</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.specialization || 'Trainer'})
                  </option>
                ))}
              </select>
            </div>

            {/* Start Time & End Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Daily Timing (24h) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Start Time</span>
                </div>
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">End Time</span>
                </div>
              </div>
            </div>

            {/* Days Schedule */}
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Days of Week <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, days: 'Mon,Tue,Wed,Thu' })}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                      formData.days === 'Mon,Tue,Wed,Thu'
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    Weekdays (Mon-Thu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, days: 'Sat,Sun' })}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                      formData.days === 'Sat,Sun'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                  >
                    Weekend (Sat-Sun)
                  </button>
                </div>
              </div>

              {/* Day Pills Toggle */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ALL_DAYS.map((day) => {
                  const currentDays = formData.days ? formData.days.split(',').map(d => d.trim().toLowerCase()) : [];
                  const isSelected = currentDays.includes(day.id.toLowerCase());

                  const toggleDay = () => {
                    let newDays;
                    if (isSelected) {
                      newDays = currentDays.filter(d => d !== day.id.toLowerCase());
                    } else {
                      newDays = [...currentDays, day.id.toLowerCase()];
                    }
                    // Sort by ALL_DAYS order
                    const sorted = ALL_DAYS.filter(d => newDays.includes(d.id.toLowerCase())).map(d => d.id);
                    setFormData({ ...formData, days: sorted.join(',') });
                  };

                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={toggleDay}
                      className={`flex-1 min-w-[50px] py-1.5 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {day.id}
                    </button>
                  );
                })}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>Selected: <strong className="text-slate-800">{formData.days || 'None'}</strong></span>
                <span>(Click buttons above to toggle days)</span>
              </div>
            </div>

            {/* Start Date & End Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Mode & Max Capacity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Classroom / Mode
              </label>
              <input
                type="text"
                placeholder="e.g. Offline - Lab 101 or Zoom Link"
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Max Capacity (Seats)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.max_capacity}
                onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Batch Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing (Active)</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving...' : editBatch ? 'Update Batch' : 'Create Batch'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

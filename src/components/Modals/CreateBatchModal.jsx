'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { X, Layers, AlertTriangle, Calendar, Clock, MapPin, Users, Check } from 'lucide-react';

export default function CreateBatchModal({ isOpen, onClose, onSuccess, editBatch = null, preselectedTrainerId = null }) {
  const { showSuccess, showError, showWarning } = useToast();

  const [trainers, setTrainers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conflictWarning, setConflictWarning] = useState(null);

  const [formData, setFormData] = useState({
    batch_name: '',
    course_id: '',
    trainer_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    start_time: '10:00',
    end_time: '12:00',
    days: 'Mon,Tue,Wed,Thu',
    mode: 'Offline - Lab 1',
    max_capacity: 25,
    status: 'Ongoing',
  });

  useEffect(() => {
    if (!isOpen) return;

    const loadMeta = async () => {
      try {
        const [trRes, crRes] = await Promise.all([
          fetch('/api/trainers'),
          fetch('/api/courses'),
        ]);
        const trData = await trRes.json();
        const crData = await crRes.json();

        if (trData.trainers) setTrainers(trData.trainers);
        if (crData.courses) setCourses(crData.courses);

        if (!editBatch) {
          setFormData(prev => ({
            ...prev,
            trainer_id: preselectedTrainerId || trData.trainers?.[0]?.id || '',
            course_id: crData.courses?.[0]?.id || '',
          }));
        }
      } catch (err) {
        console.error('Failed to load modal metadata:', err);
      }
    };

    loadMeta();
  }, [isOpen, editBatch, preselectedTrainerId]);

  useEffect(() => {
    if (editBatch) {
      setFormData({
        batch_name: editBatch.batch_name || '',
        course_id: editBatch.course_id || '',
        trainer_id: editBatch.trainer_id || '',
        start_date: editBatch.start_date || new Date().toISOString().split('T')[0],
        end_date: editBatch.end_date || '',
        start_time: editBatch.start_time || '10:00',
        end_time: editBatch.end_time || '12:00',
        days: editBatch.days || 'Mon,Tue,Wed,Thu',
        mode: editBatch.mode || 'Offline - Lab 1',
        max_capacity: editBatch.max_capacity || 25,
        status: editBatch.status || 'Ongoing',
      });
    } else {
      setFormData({
        batch_name: '',
        course_id: courses[0]?.id || '',
        trainer_id: preselectedTrainerId || trainers[0]?.id || '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        start_time: '10:00',
        end_time: '12:00',
        days: 'Mon,Tue,Wed,Thu',
        mode: 'Offline - Lab 1',
        max_capacity: 25,
        status: 'Ongoing',
      });
    }
    setConflictWarning(null);
  }, [editBatch, isOpen, preselectedTrainerId]);

  if (!isOpen) return null;

  const handleSubmit = async (e, forceIgnore = false) => {
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
          ignore_conflict: forceIgnore,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setConflictWarning(data.error);
          showWarning('Timing conflict detected with trainer schedule!');
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

  const handleDayPreset = (preset) => {
    if (preset === 'weekdays') setFormData({ ...formData, days: 'Mon,Tue,Wed,Thu' });
    if (preset === 'weekends') setFormData({ ...formData, days: 'Sat,Sun' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                {editBatch ? 'Edit Batch' : 'Create New Batch'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Set batch timing, trainer, and schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Alert */}
        {conflictWarning && (
          <div className="m-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Trainer Schedule Conflict!</p>
                <p className="text-[11px] mt-0.5 text-amber-800">{conflictWarning}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1 border-t border-amber-200/60">
              <button
                type="button"
                onClick={() => setConflictWarning(null)}
                className="px-2.5 py-1 text-[11px] font-bold bg-white text-slate-700 rounded-lg border border-slate-300"
              >
                Change Time
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
              >
                Save Anyway
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Trainer Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Assign Trainer *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {trainers.map((tr) => (
                <button
                  type="button"
                  key={tr.id}
                  onClick={() => setFormData({ ...formData, trainer_id: tr.id })}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    formData.trainer_id === tr.id
                      ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{tr.name}</div>
                    <div className="text-[10px] text-slate-500">{tr.specialization}</div>
                  </div>
                  {formData.trainer_id === tr.id && (
                    <Check className="w-4 h-4 text-purple-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Batch Name / Subject Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Batch Name / Subject *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Full Stack Web Development, Python DSA, React Morning"
              value={formData.batch_name}
              onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Daily Timing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Start Time *</span>
              </label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>End Time *</span>
              </label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold text-slate-800"
              />
            </div>
          </div>

          {/* Days Preset */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Class Days *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDayPreset('weekdays')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  formData.days === 'Mon,Tue,Wed,Thu'
                    ? 'border-purple-600 bg-purple-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Weekdays (Mon - Thu)
              </button>
              <button
                type="button"
                onClick={() => handleDayPreset('weekends')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  formData.days === 'Sat,Sun'
                    ? 'border-purple-600 bg-purple-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Weekend (Sat - Sun)
              </button>
            </div>
          </div>

          {/* Start Date & Room */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Date *
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
                Classroom / Mode
              </label>
              <input
                type="text"
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                placeholder="Lab 1 / Online"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
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
              className="px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving...' : editBatch ? 'Update Batch' : 'Create Batch'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

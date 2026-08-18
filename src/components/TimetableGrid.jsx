'use client';

import React, { useState } from 'react';
import { Clock, MapPin, Users, Calendar, Filter } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = [
  { label: '09:00 AM', hour: 9 },
  { label: '10:00 AM', hour: 10 },
  { label: '11:00 AM', hour: 11 },
  { label: '12:00 PM', hour: 12 },
  { label: '01:00 PM', hour: 13 },
  { label: '02:00 PM', hour: 14 },
  { label: '03:00 PM', hour: 15 },
  { label: '04:00 PM', hour: 16 },
  { label: '05:00 PM', hour: 17 },
  { label: '06:00 PM', hour: 18 },
  { label: '07:00 PM', hour: 19 },
];

export default function TimetableGrid({ batches = [], trainers = [], onSelectBatch, userRole, currentUserId }) {
  const [selectedTrainer, setSelectedTrainer] = useState(userRole === 'trainer' ? String(currentUserId) : 'all');
  const [selectedDay, setSelectedDay] = useState('all');

  const filteredBatches = batches.filter(b => {
    if (selectedTrainer !== 'all' && String(b.trainer_id) !== String(selectedTrainer)) {
      return false;
    }
    if (selectedDay !== 'all') {
      const days = b.days.split(',').map(d => d.trim().toLowerCase());
      if (!days.includes(selectedDay.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>Weekly Batch Timetable Matrix</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time schedule tracking to view trainer allocations and avoid overlapping batch timings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {userRole === 'counselor' && trainers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Trainer:</span>
              <select
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
                className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
              >
                <option value="all">All Trainers</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.active_batch_count || 0} batches)</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Schedule:</span>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            >
              <option value="all">All Days (Full Week)</option>
              <option value="weekdays">Weekdays (Mon, Tue, Wed, Thu)</option>
              <option value="weekends">Weekend (Sat, Sun)</option>
              <option value="Mon">Monday</option>
              <option value="Tue">Tuesday</option>
              <option value="Wed">Wednesday</option>
              <option value="Thu">Thursday</option>
              <option value="Fri">Friday</option>
              <option value="Sat">Saturday</option>
              <option value="Sun">Sunday</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Timeline */}
      <div className="p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[750px] space-y-4">
          
          {/* Days column headers or Day-by-Day view */}
          {DAYS.filter(d => {
            if (selectedDay === 'all') return true;
            if (selectedDay === 'weekdays') return ['Mon', 'Tue', 'Wed', 'Thu'].includes(d);
            if (selectedDay === 'weekends') return ['Sat', 'Sun'].includes(d);
            return d.toLowerCase() === selectedDay.toLowerCase();
          }).map(day => {
            // Find batches that run on this day
            const dayBatches = filteredBatches.filter(b => {
              const dayList = b.days.split(',').map(x => x.trim().toLowerCase());
              return dayList.includes(day.toLowerCase());
            });

            const isWeekday = ['Mon', 'Tue', 'Wed', 'Thu'].includes(day);
            const isWeekend = ['Sat', 'Sun'].includes(day);

            return (
              <div key={day} className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                {/* Day Badge */}
                <div className="w-20 shrink-0 text-center py-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-xs font-extrabold text-slate-900">{day}</div>
                  <div className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md inline-block mt-0.5 ${
                    isWeekday ? 'bg-purple-50 text-purple-700' : isWeekend ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isWeekday ? 'Weekday' : isWeekend ? 'Weekend' : 'Off'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {dayBatches.length} {dayBatches.length === 1 ? 'batch' : 'batches'}
                  </div>
                </div>

                {/* Batches in this day */}
                <div className="flex-1">
                  {dayBatches.length === 0 ? (
                    <div className="h-12 flex items-center text-xs text-slate-400 italic">
                      No batches scheduled on {day}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dayBatches.map(b => (
                        <div
                          key={b.id}
                          onClick={() => onSelectBatch && onSelectBatch(b)}
                          className="cursor-pointer bg-white p-3.5 rounded-xl border border-slate-200/90 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {b.batch_code}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              b.status === 'Ongoing'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {b.batch_name}
                          </h4>

                          <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>{b.start_time} - {b.end_time}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>Trainer: <strong className="text-slate-700">{b.trainer_name || 'Unassigned'}</strong></span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span className="truncate max-w-[120px]">{b.mode}</span>
                              </span>
                              <span className="font-semibold text-slate-700">
                                {b.student_count || 0}/{b.max_capacity} Enrolled
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}

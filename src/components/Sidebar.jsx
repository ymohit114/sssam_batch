'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Layers,
  GraduationCap,
  Clock,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isCounselor, isTrainer } = useAuth();

  if (!user) return null;

  const counselorNav = [
    { name: 'Batches & Timetable', href: '/', icon: Layers },
    { name: 'Student Directory', href: '/students', icon: GraduationCap },
  ];

  const trainerNav = [
    { name: 'My Batches & Timetable', href: '/', icon: Layers },
    { name: 'My Students', href: '/students', icon: GraduationCap },
  ];

  const navItems = isCounselor ? counselorNav : trainerNav;

  return (
    <>
      {/* DESKTOP SIDEBAR (Visible on md and larger) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex-col justify-between py-6 px-4 shrink-0 shadow-2xs">
        <div className="space-y-6">
          
          {/* Role Banner Card */}
          <div className={`p-3.5 rounded-xl border ${
            isCounselor
              ? 'bg-purple-50/70 border-purple-200'
              : 'bg-emerald-50/70 border-emerald-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isCounselor ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {isCounselor ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {isCounselor ? 'Counselor Admin' : 'Trainer Access'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate max-w-[130px]">
                  {user.specialization || user.email}
                </div>
              </div>
            </div>
            
            {/* Permissions note for trainer */}
            {isTrainer && (
              <div className="mt-2.5 pt-2.5 border-t border-emerald-200/60 text-[11px] text-emerald-800 flex items-start gap-1.5 leading-snug">
                <span className="font-semibold text-emerald-700">Note:</span>
                <span>You can add students to your batches. Student removal is restricted to Counselor.</span>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Main Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? isCounselor
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 font-semibold'
                        : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Help / Info Footer */}
        <div className="pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Active Term 2026</span>
            </div>
            <p className="text-slate-500 text-[10px] leading-relaxed">
              SSSAM Institute Batch &amp; Timetable System
            </p>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on mobile screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-6 flex items-center justify-around shadow-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? isCounselor
                    ? 'text-purple-700 bg-purple-50'
                    : 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? (isCounselor ? 'text-purple-600' : 'text-emerald-600') : 'text-slate-400'}`} />
              <span className="text-[11px] tracking-tight">{item.name.split('&')[0].trim()}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

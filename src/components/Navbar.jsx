'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  UserCheck,
  LogOut,
  Sparkles,
  ChevronDown,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const { user, logout, switchDemoUser, isCounselor, isTrainer } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  if (!user) return null;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-slate-900">
                  SSSAM
                </span>
                <span className="text-xs ml-1.5 px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  BATCHES
                </span>
              </div>
            </Link>
          </div>

          {/* Role Badge */}
          <div className="hidden sm:flex items-center gap-2">
            {isCounselor ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Saloni (Counselor / Admin)</span>
                <span className="bg-purple-200 text-purple-900 text-[10px] px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                  Full Control
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>{user.name} (Trainer)</span>
                <span className="bg-emerald-200 text-emerald-900 text-[10px] px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                  Add Students
                </span>
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            
            {/* Quick Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Switch Role</span>
                <ChevronDown className="w-3 h-3 text-amber-700" />
              </button>

              {showDemoMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDemoMenu(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-slide-in">
                    <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Switch User Profile
                    </div>
                    
                    {/* Saloni */}
                    <button
                      onClick={() => { switchDemoUser('saloni'); setShowDemoMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-800 group-hover:text-purple-700">👑 Saloni (Counselor)</div>
                        <div className="text-[10px] text-slate-500">saloni@gmail.com • Admin</div>
                      </div>
                      {isCounselor && <span className="w-2 h-2 rounded-full bg-purple-600"></span>}
                    </button>

                    {/* Mohit Yadav */}
                    <button
                      onClick={() => { switchDemoUser('mohit'); setShowDemoMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-800 group-hover:text-indigo-700">🧑‍🏫 Mohit Yadav</div>
                        <div className="text-[10px] text-slate-500">mohit@gmail.com • Cyber Security</div>
                      </div>
                      {user.email === 'mohit@gmail.com' && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
                    </button>

                    {/* Sudesh Yadav */}
                    <button
                      onClick={() => { switchDemoUser('sudesh'); setShowDemoMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-800 group-hover:text-emerald-700">🧑‍🏫 Sudesh Yadav</div>
                        <div className="text-[10px] text-slate-500">sudesh@gmail.com • Data Analytics &amp; Data Science</div>
                      </div>
                      {user.email === 'sudesh@gmail.com' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white ${
                isCounselor ? 'bg-purple-600' : 'bg-indigo-600'
              }`}>
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {user.role}
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}

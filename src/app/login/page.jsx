'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Layers, ShieldCheck, UserCheck, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      showSuccess('Logged in successfully!');
      router.push('/');
    } catch (err) {
      showError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setLoading(true);

    try {
      await login(quickEmail, quickPassword);
      showSuccess('Logged in successfully!');
      router.push('/');
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-slide-in">
        
        {/* Brand Logo & Title */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            SSSAM Batch System
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Counselor &amp; Trainers Batch Management
          </p>
        </div>

        {/* 1-Click Quick Select Login */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Select Account (1-Click Login)</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Counselor Saloni */}
            <button
              type="button"
              onClick={() => handleQuickLogin('saloni@gmail.com', '1234567890')}
              disabled={loading}
              className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 text-left transition-all group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-purple-800">
                    👑 Saloni (Counselor / Admin)
                  </div>
                  <div className="text-[10px] text-slate-500">Full Access • Manage Batches, Trainers &amp; Students</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Trainer Mohit Yadav */}
            <button
              type="button"
              onClick={() => handleQuickLogin('mohit@gmail.com', '1234567890')}
              disabled={loading}
              className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-200 text-left transition-all group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-800">
                    🧑‍🏫 Mohit Yadav (Cyber Security)
                  </div>
                  <div className="text-[10px] text-slate-500">Cyber Security Trainer • Add Students</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Trainer Sudesh Yadav */}
            <button
              type="button"
              onClick={() => handleQuickLogin('sudesh@gmail.com', '1234567890')}
              disabled={loading}
              className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-left transition-all group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                    🧑‍🏫 Sudesh Yadav (Data Analytics &amp; Data Science)
                  </div>
                  <div className="text-[10px] text-slate-500">Data Analytics &amp; AI Trainer • Add Students</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Custom Login */}
        <form onSubmit={handleLogin} className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Logging in...' : 'Sign In'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}

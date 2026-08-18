'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    try {
      const headers = {};
      if (typeof window !== 'undefined') {
        const localToken = localStorage.getItem('sssam_auth_token');
        if (localToken) {
          headers['Authorization'] = `Bearer ${localToken}`;
        }
      }

      const res = await fetch('/api/auth/me', { headers });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const login = async (email, password) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (typeof window !== 'undefined' && data.token) {
        localStorage.setItem('sssam_auth_token', data.token);
      }

      setUser(data.user);
      return data.user;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Connection timed out. Please check your network and try again.');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sssam_auth_token');
    }
    setUser(null);
    router.push('/login');
  };

  const switchDemoUser = async (targetRole) => {
    setLoading(true);
    try {
      if (targetRole === 'counselor' || targetRole === 'saloni') {
        await login('saloni@gmail.com', '1234567890');
      } else if (targetRole === 'mohit') {
        await login('mohit@gmail.com', '1234567890');
      } else if (targetRole === 'sudesh') {
        await login('sudesh@gmail.com', '1234567890');
      }
    } catch (err) {
      console.error('Demo switch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isCounselor = user?.role === 'counselor';
  const isTrainer = user?.role === 'trainer';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        switchDemoUser,
        isCounselor,
        isTrainer,
        refreshUser: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

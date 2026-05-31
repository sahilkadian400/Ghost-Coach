/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Target, ShieldCheck, Clock, Award } from 'lucide-react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import { AuthResponse } from './types';

export default function App() {
  const [authData, setAuthData] = useState<AuthResponse | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Validate session on load
  useEffect(() => {
    const storedToken = localStorage.getItem('ghost_coach_token');
    if (!storedToken) {
      setCheckingAuth(false);
      return;
    }

    const checkMe = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        if (res.ok) {
          const userProfile = await res.json();
          setAuthData({
            token: storedToken,
            user: userProfile
          });
        } else {
          // Stale session
          localStorage.removeItem('ghost_coach_token');
        }
      } catch (err) {
        console.error('Network error during initial auth verify:', err);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkMe();
  }, []);

  const handleAuthSuccess = (data: AuthResponse) => {
    localStorage.setItem('ghost_coach_token', data.token);
    setAuthData(data);
  };

  const handleLogout = () => {
    if (authData) {
      // Call black logout API to clear session silently
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.token}`
        }
      }).catch(err => console.error(err));
    }
    localStorage.removeItem('ghost_coach_token');
    setAuthData(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 flex flex-col relative overflow-hidden" id="app_root">
      {/* Background ambient gold radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(212,175,55,0.04),transparent_50%)] pointer-events-none"></div>
      
      {/* Universal Global Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5" id="global_header">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg flex items-center justify-center text-[#d4af37] shadow-sm">
              <Target className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="font-serif italic font-bold text-xl tracking-tight text-[#d4af37] block leading-none">
                Playmotech
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 block mt-1">
                GHOST COACH PRO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">

            {authData && (
              <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/20 px-2.5 py-1 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SECURE SPORTING CORE</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Hub */}
      <main className="flex-grow flex items-center justify-center py-10 relative z-10" id="main_hub">
        {checkingAuth ? (
          <div className="text-center" id="session_loading">
            <div className="inline-block animate-spin border-4 border-[#d4af37] border-t-transparent rounded-full w-12 h-12 mb-4"></div>
            <p className="text-sm font-semibold text-slate-400 font-sans tracking-wide">Initializing Coach Workspace...</p>
          </div>
        ) : authData ? (
          <Dashboard 
            authData={authData} 
            onLogout={handleLogout} 
            onUpdateUser={(updatedUser) => {
              setAuthData({
                ...authData,
                user: updatedUser
              });
            }}
          />
        ) : (
          <AuthForm onSuccess={handleAuthSuccess} />
        )}
      </main>

      {/* Beautiful humble design credit footer (Anti-AI-Slop & Clean) */}
      <footer className="py-6 border-t border-white/5 bg-[#0a0a0a] relative z-10" id="main_footer">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#d4af37]" />
            <span>© 2026 Playmotech Stance Hub • Powered by Gemini Vision Mechanics.</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#d4af37]/75">
            SECURE ANALYTIC FEEDBACK CHANNEL
          </div>
        </div>
      </footer>

    </div>
  );
}

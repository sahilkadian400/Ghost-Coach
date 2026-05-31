/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Award, Target, ArrowRight, Sparkles } from 'lucide-react';
import { AuthResponse } from '../types';

interface AuthFormProps {
  onSuccess: (authData: AuthResponse) => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [sport, setSport] = useState<string>('Cricket');
  const [customSport, setCustomSport] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [customPosition, setCustomPosition] = useState<string>('');
  const [experience, setExperience] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Suggested roles for sports
  const sportSuggestions: Record<string, string[]> = {
    Cricket: ['Batsman', 'Bowler', 'Wicketkeeper', 'All-rounder', 'Slip Fielder'],
    Football: ['Goalkeeper', 'Striker', 'Midfielder', 'Defender', 'Winger'],
    Basketball: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
    Badminton: ['Singles Specialist', 'Doubles Attacker', 'Doubles Defender', 'All-around Player'],
    Other: [],
  };

  // Switch position when sport changes
  useEffect(() => {
    const list = sportSuggestions[sport];
    if (list && list.length > 0) {
      setPosition(list[0]);
    } else {
      setPosition('');
    }
  }, [sport]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const actualSport = sport === 'Other' ? customSport.trim() : sport;
    const actualPosition = position === 'Other' || !position ? customPosition.trim() : position;

    if (!username.trim() || !password) {
      setError('Please fill out all required credentials.');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        setError('Please provide your full name.');
        setLoading(false);
        return;
      }
      if (!actualSport) {
        setError('Please specify which sport you train for.');
        setLoading(false);
        return;
      }
      if (!actualPosition) {
        setError('Please specify your position or role.');
        setLoading(false);
        return;
      }
    }

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin
      ? { username, password }
      : {
          username,
          password,
          fullName,
          sport: actualSport,
          position: actualPosition,
          experience,
        };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please try again.');
      }

      onSuccess(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4" id="auth_container">
      <div className="bg-[#0a0a0a]/90 backdrop-blur-md px-8 py-10 shadow-2xl rounded-2xl border border-white/5 relative overflow-hidden">
        {/* Subtle decorative internal gradient overlay */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 rounded-full mb-4 shadow-inner">
            <Target className="w-7 h-7 animate-pulse" id="logo_icon" />
          </div>
          
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-mono font-bold leading-none">
            {isLogin ? 'AUTHENTICATION GATEWAY' : 'ATHLETE ONBOARDINGS'}
          </p>

          <h2 className="text-3xl font-serif italic text-white mt-2 tracking-tight" id="auth_title">
            {isLogin ? 'Workspace Login' : 'Onboard Athlete'}
          </h2>
          
          <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed" id="auth_sub">
            {isLogin
              ? 'Securely load past stance assessments and clinical drill lists.'
              : 'Configure your positional context to receive highly targeted AI mechanical reviews.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-950/40 text-rose-300 text-xs rounded-xl border border-rose-500/20 flex items-start gap-2" id="auth_error">
            <span className="font-semibold block shrink-0">⚠️ SYSTEM FAULT:</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10 font-sans" id="auth_form">
          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Email / Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
              <input
                id="input_username"
                type="text"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm font-light"
                placeholder="athlete.name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Secret Key (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
              <input
                id="input_password"
                type="password"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Full Athlete Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
                  <input
                    id="input_fullname"
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm font-light"
                    placeholder="Liam Sterling"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Target Sport
                  </label>
                  <select
                    id="select_sport"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0e0e0e] border border-white/10 text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all text-sm font-mono"
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                  >
                    <option value="Cricket">Cricket</option>
                    <option value="Football">Football</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Other">Other Sport</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Skill Level
                  </label>
                  <select
                    id="select_experience"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0e0e0e] border border-white/10 text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all text-sm font-mono"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value as any)}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {sport === 'Other' && (
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Specify Custom Sport
                  </label>
                  <div className="relative">
                    <Target className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
                    <input
                      id="input_custom_sport"
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm font-light"
                      placeholder="e.g., Baseball, Golf, Tennis"
                      value={customSport}
                      onChange={(e) => setCustomSport(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Sport position / role
                </label>
                {sportSuggestions[sport] && sportSuggestions[sport].length > 0 ? (
                  <select
                    id="select_position"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0e0e0e] border border-white/10 text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all text-sm font-mono"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    {sportSuggestions[sport].map((suggestion) => (
                      <option key={suggestion} value={suggestion}>
                        {suggestion}
                      </option>
                    ))}
                    <option value="Other">Other Position</option>
                  </select>
                ) : (
                  <div className="relative">
                    <Award className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
                    <input
                      id="input_custom_position"
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm font-light"
                      placeholder="e.g., Striker, Point Guard, Pitcher"
                      value={position === 'Other' ? customPosition : position}
                      onChange={(e) => {
                        if (position === 'Other' || sport === 'Other') {
                          setCustomPosition(e.target.value);
                        } else {
                          setPosition(e.target.value);
                        }
                      }}
                      required
                    />
                  </div>
                )}
              </div>

              {position === 'Other' && sport !== 'Other' && (
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Specify Custom Position
                  </label>
                  <input
                    id="input_custom_position_direct"
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm font-light"
                    placeholder="e.g., Sweeper, Pinch Hitter"
                    value={customPosition}
                    onChange={(e) => setCustomPosition(e.target.value)}
                    required
                  />
                </div>
              )}
            </>
          )}

          <button
            id="auth_submit_btn"
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] hover:bg-[#c29f2e] text-black font-semibold font-sans py-3.5 px-4 rounded-lg shadow-lg shadow-[#d4af37]/15 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none text-xs uppercase tracking-widest"
          >
            {loading ? (
              <span className="inline-block animate-spin border-2 border-black border-t-transparent rounded-full w-4 h-4"></span>
            ) : (
              <>
                <span>{isLogin ? 'Enter Training Zone' : 'Initialize Athlete Code'}</span>
                {isLogin && <ArrowRight className="w-4 h-4" />}
                {!isLogin && <Sparkles className="w-4 h-4 text-black" />}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center relative z-10">
          <button
            id="auth_toggle_btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-xs font-mono tracking-wider text-[#d4af37] hover:text-[#f3cd4e] transition uppercase"
          >
            {isLogin ? "PRO-HUB ACCESS: CREATE NEW PROFILE" : "ALREADY ENROLLED? SIGN IN HERE"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, Calendar, ChevronDown, ChevronUp, Trash2, 
  Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Activity, BookOpen, Clock, Zap,
  Target, Compass, Maximize2, Eye, Grid, Play, Check, Loader, User, LogOut, ChevronRight
} from 'lucide-react';
import { AuthResponse, CoachingSession } from '../types';

interface DashboardProps {
  authData: AuthResponse;
  onLogout: () => void;
  onUpdateUser?: (updatedUser: any) => void;
}

// Interactive Stance Lens Component to draw biomechanical skeleton/HUD overlays over stance photos
interface InteractiveStanceLensProps {
  imageSrc: string;
  score: number;
  confidence: string;
  mode: 'clean' | 'skeleton' | 'grid';
  isScanning?: boolean;
}

export function InteractiveStanceLens({ imageSrc, score, confidence, mode, isScanning }: InteractiveStanceLensProps) {
  // Calculate simulated postural offsets based on the actual score
  const calculatedSpineAngle = (32 - (score * 1.8)).toFixed(1);
  const calculatedKneeFlex = (108 + (score * 1.2)).toFixed(0);
  const tiltBias = score >= 8 ? "Optimal Load" : score >= 5.5 ? "Slight Pivot Deflection" : "Urgent Pivot Align Req.";
  const symmetryRatioLeft = (45 + (score * 0.7)).toFixed(0);
  const symmetryRatioRight = (100 - parseFloat(symmetryRatioLeft)).toFixed(0);

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black flex flex-col justify-between group select-none min-h-[300px]">
      {/* Top Telemetry Header */}
      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/90 via-black/40 to-transparent p-3.5 flex justify-between items-center z-20 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse"></span>
          <span className="text-[9px] font-mono tracking-widest text-[#d4af37] uppercase font-bold">NEURAL DIAGNOSTICS LENS v2.5</span>
        </div>
        <div className="text-[8px] font-mono bg-black/75 px-1.5 py-0.5 rounded text-emerald-400 border border-emerald-500/20 backdrop-blur-sm">
          CAM RESOLVED: INTEL HD
        </div>
      </div>

      {/* Main Image Frame */}
      <div className="relative w-full flex-1 flex items-center justify-center bg-[#050505] overflow-hidden min-h-[290px] max-h-[380px]">
        <img 
          referrerPolicy="no-referrer"
          src={imageSrc} 
          alt="Athlete Biomechanics" 
          className="w-full h-full object-cover transition-all duration-300 min-h-[290px] max-h-[380px]"
        />

        {/* Tactical Crosshair Corners */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#d4af37]/60 pointer-events-none"></div>
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#d4af37]/60 pointer-events-none"></div>
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#d4af37]/60 pointer-events-none"></div>
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#d4af37]/60 pointer-events-none"></div>

        {/* 1. SKELETON DIAGNOSTICS LAYER */}
        {mode === 'skeleton' && !isScanning && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* SVG Linking Joints */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Head-to-Spine axis */}
              <line x1="50%" y1="18%" x2="50%" y2="48%" stroke="#10b981" strokeWidth="2.5" filter="url(#neon-glow)" />
              {/* Shoulders */}
              <line x1="40%" y1="28%" x2="60%" y2="28%" stroke="#06b6d4" strokeWidth="2" filter="url(#neon-glow)" />
              {/* Spine-to-Hip base */}
              <line x1="50%" y1="48%" x2="43%" y2="58%" stroke="#f59e0b" strokeWidth="2" filter="url(#neon-glow)" />
              <line x1="50%" y1="48%" x2="57%" y2="58%" stroke="#f59e0b" strokeWidth="2" filter="url(#neon-glow)" />
              {/* Hips alignment */}
              <line x1="43%" y1="58%" x2="57%" y2="58%" stroke="#06b6d4" strokeWidth="2" filter="url(#neon-glow)" />
              
              {/* Left Leg: Hip to Knee to Foot */}
              <line x1="43%" y1="58%" x2="41%" y2="76%" stroke="#10b981" strokeWidth="2.5" filter="url(#neon-glow)" />
              <line x1="41%" y1="76%" x2="38%" y2="92%" stroke="#10b981" strokeWidth="2" filter="url(#neon-glow)" />

              {/* Right Leg: Hip to Knee to Foot */}
              <line x1="57%" y1="58%" x2="59%" y2="76%" stroke="#06b6d4" strokeWidth="2.5" filter="url(#neon-glow)" />
              <line x1="59%" y1="76%" x2="62%" y2="92%" stroke="#06b6d4" strokeWidth="2" filter="url(#neon-glow)" />

              {/* Arms linkages */}
              <line x1="40%" y1="28%" x2="35%" y2="45%" stroke="#a855f7" strokeWidth="2" />
              <line x1="60%" y1="28%" x2="65%" y2="45%" stroke="#a855f7" strokeWidth="2" />
            </svg>

            {/* Glowing Joints Dot Layout */}
            {/* Head */}
            <div className="absolute top-[18%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
            </div>
            {/* Left Shoulder */}
            <div className="absolute top-[28%] left-[40%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-cyan-500/20 border-2 border-cyan-400 rounded-full"></div>
            {/* Right Shoulder */}
            <div className="absolute top-[28%] left-[60%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-cyan-500/20 border-2 border-cyan-400 rounded-full"></div>
            {/* Spine Node */}
            <div className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-amber-500/20 border-2 border-amber-400 rounded-full"></div>
            {/* Left Hip */}
            <div className="absolute top-[58%] left-[43%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-cyan-500/20 border-2 border-cyan-400 rounded-full"></div>
            {/* Right Hip */}
            <div className="absolute top-[58%] left-[57%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-cyan-500/20 border-2 border-cyan-400 rounded-full"></div>
            
            {/* Knee Joints */}
            <div className="absolute top-[76%] left-[41%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-500/25 border-2 border-emerald-400 rounded-full flex items-center justify-center animate-ping"></div>
            <div className="absolute top-[76%] left-[41%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-emerald-500/20 border-2 border-emerald-400 rounded-full"></div>
            
            <div className="absolute top-[76%] left-[59%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-cyan-500/20 border-2 border-cyan-400 rounded-full"></div>
            
            {/* Feet Anchors */}
            <div className="absolute top-[92%] left-[38%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-rose-500/25 border-2 border-rose-400 rounded-full"></div>
            <div className="absolute top-[92%] left-[62%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-rose-500/25 border-2 border-rose-400 rounded-full"></div>

            {/* Glowing HUD Overlay Badges */}
            <div className="absolute top-[20%] left-[58%] bg-black/85 border border-cyan-500/35 text-[9px] font-mono px-2 py-0.5 rounded backdrop-blur-md text-cyan-300 uppercase shadow-md font-bold leading-relaxed">
              SPINE ANGLE: {calculatedSpineAngle}°
            </div>
            <div className="absolute top-[70%] left-[10%] bg-black/85 border border-emerald-500/35 text-[9px] font-mono px-2 py-0.5 rounded backdrop-blur-md text-emerald-300 uppercase shadow-md font-bold leading-relaxed">
              KNEE FLEXION: {calculatedKneeFlex}°
            </div>
            <div className="absolute top-[50%] left-[62%] bg-black/85 border border-amber-500/35 text-[9px] font-mono px-2 py-0.5 rounded backdrop-blur-md text-amber-300 uppercase shadow-md font-bold leading-relaxed">
              POSE STABILITY: {tiltBias}
            </div>
          </div>
        )}

        {/* 2. CHIMERICAL STROBE ALIGNMENT GRID */}
        {mode === 'grid' && !isScanning && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Viewfinder Scope lines */}
            <div className="absolute inset-y-0 left-1/2 w-[1.5px] bg-[#d4af37]/30 border-l border-dashed border-[#d4af37]/45"></div>
            <div className="absolute inset-x-0 top-[48%] h-[1.5px] bg-[#d4af37]/30 border-t border-dashed border-[#d4af37]/45"></div>

            {/* Finer cross rails */}
            <div className="absolute inset-y-0 left-[25%] w-[1px] bg-white/5"></div>
            <div className="absolute inset-y-0 left-[75%] w-[1px] bg-white/5"></div>
            <div className="absolute inset-x-0 top-[25%] h-[1px] bg-white/5"></div>
            <div className="absolute inset-x-0 top-[75%] h-[1px] bg-white/5"></div>

            {/* HUD Status labels */}
            <div className="absolute bottom-4 left-4 bg-zinc-950/90 border border-[#d4af37]/30 text-[9px] font-mono px-2 py-1 rounded text-slate-300 tracking-wider">
              BALANCE SYMMETRY: <strong className="text-[#d4af37]">{symmetryRatioLeft}% L | {symmetryRatioRight}% R</strong>
            </div>
            <div className="absolute top-12 right-4 bg-zinc-950/90 border border-teal-500/30 text-[9px] font-mono px-2 py-1 rounded text-teal-400 tracking-wider">
              CENTER DEVIATION: Optimal Center (0.83°)
            </div>
          </div>
        )}

        {/* 3. PHYSICAL DETECT SWEEPING ANIMATION */}
        {isScanning && (
          <div className="absolute inset-0 bg-black/55 z-10 pointer-events-none flex flex-col justify-between">
            <div className="animate-scanner-line"></div>
            {/* Visual scanning matrix grids */}
            <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(212,175,55,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.25)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
          </div>
        )}
      </div>

      {/* Bottom Info HUD */}
      <div className="bg-zinc-950 px-4 py-2.5 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-400">
        <span className="tracking-wider uppercase">POSTURE QUALITY: <strong className="text-white font-bold">{score} / 10</strong></span>
        <span className="tracking-widest font-bold uppercase text-[#d4af37] bg-[#d4af37]/5 px-2 py-0.5 rounded border border-[#d4af37]/15">
          {confidence} CONFIDENCE
        </span>
      </div>
    </div>
  );
}

// Interactive Sports Preset list with target postures to easily play with Golf, Baseball, etc.
const SPORT_PRESETS = [
  { sport: 'Golf', position: 'Driver Swing Hinge', icon: '🏌️‍♂️', desc: 'Precision spinal tilt & posture width.' },
  { sport: 'Cricket', position: 'Spin Bowler Release', icon: '🏏', desc: 'Braced front knee & bowling arc extension.' },
  { sport: 'Baseball', position: 'Power Batting Setup', icon: '⚾', desc: 'Deep pelvic load & hip-shoulder torque.' },
  { sport: 'Basketball', position: 'Jump Shot Base', icon: '🏀', desc: 'Symmetrical ankle alignment & vertical axis.' },
  { sport: 'Weightlifting', position: 'Clean squat setup', icon: '🏋️‍♂️', desc: 'Lumbar integrity & flat heel balance.' },
  { sport: 'Tennis', position: 'Match Serve Stance', icon: '🎾', desc: 'Shoulder load & center-of-gravity lift.' },
];

export default function Dashboard({ authData, onLogout, onUpdateUser }: DashboardProps) {
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<CoachingSession | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // High-Tech Lens view state controls
  const [activeLensMode, setActiveLensMode] = useState<'clean' | 'skeleton' | 'grid'>('skeleton');
  const [expandedLensModes, setExpandedLensModes] = useState<Record<string, 'clean' | 'skeleton' | 'grid'>>({});

  // Interactive Clinical Drill Walkthrough Player State
  const [drillWalkthroughActive, setDrillWalkthroughActive] = useState<boolean>(false);
  const [drillWalkthroughStep, setDrillWalkthroughStep] = useState<number>(0);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(15);

  const [editExperience, setEditExperience] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    authData.user.experience as any || 'Beginner'
  );
  const [editPosition, setEditPosition] = useState<string>(authData.user.position || '');
  const [updatingCalibration, setUpdatingCalibration] = useState<boolean>(false);

  useEffect(() => {
    if (authData.user) {
      setEditExperience(authData.user.experience as any || 'Beginner');
      setEditPosition(authData.user.position || '');
    }
  }, [authData.user]);

  // Handle ticking clock simulations for active drill tutorial guidance card
  useEffect(() => {
    let timerRef: any;
    if (drillWalkthroughActive) {
      timerRef = setInterval(() => {
        setCountdownSeconds(prev => {
          if (prev <= 1) {
            setDrillWalkthroughStep(currentStep => {
              if (currentStep >= 2) {
                setDrillWalkthroughActive(false);
                return 0;
              }
              return currentStep + 1;
            });
            return 15; // reset countdown time
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef);
  }, [drillWalkthroughActive]);

  const handleUpdateCalibration = async () => {
    if (!editPosition.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Calibration error: Sports position cannot be blank.' });
      return;
    }

    setUpdatingCalibration(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/analysis/calibration', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`
        },
        body: JSON.stringify({
          experience: editExperience,
          position: editPosition.trim(),
          sport: authData.user.sport
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFeedbackMsg({ type: 'success', text: 'Athlete calibration fine-tuned successfully.' });
        if (onUpdateUser) {
          onUpdateUser(data.user);
        }
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to apply athlete settings.');
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setUpdatingCalibration(false);
    }
  };

  // Swapping the active athlete sport & position securely from our dynamic preset cards!
  const handleQuickSportPresetSelect = async (chosenSport: string, chosenPosition: string) => {
    setUpdatingCalibration(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/analysis/calibration', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`
        },
        body: JSON.stringify({
          experience: editExperience,
          position: chosenPosition,
          sport: chosenSport
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFeedbackMsg({ type: 'success', text: `Sports diagnostic template synchronized to: ${chosenSport} - ${chosenPosition}` });
        if (onUpdateUser) {
          onUpdateUser(data.user);
        }
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to configure sport focus layout.');
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setUpdatingCalibration(false);
    }
  };

  // Load history from backend
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/analysis/history', {
        headers: {
          'Authorization': `Bearer ${authData.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error('Failed to load stance history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Set timeout messages during AI coaching pipeline
  useEffect(() => {
    let interval: any;
    if (analyzing) {
      const messages = [
        "Aligning coordinate markers and stance vectors...",
        "Tracing anatomical structural joint linkages...",
        "Gauging spine hinge flexion and balance offsets...",
        "Formulating tailored clinical athletic drills...",
        "Compiling dynamic corrective feedback...",
      ];
      let index = 0;
      setProgressMsg(messages[0]);
      interval = setInterval(() => {
        index = (index + 1) % messages.length;
        setProgressMsg(messages[index]);
      }, 2500);
    } else {
      setProgressMsg('');
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFeedbackMsg({ type: 'error', text: 'Mechanics error: Unsupported image format. Upload standard JPEG, PNG or WEBP.' });
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFeedbackMsg({ type: 'error', text: 'Mechanics error: Stance image exceeds critical 5MB payload limit.' });
      return false;
    }
    return true;
  };

  const registerFile = (file: File) => {
    if (!validateFile(file)) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setFeedbackMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      registerFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      registerFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    setFeedbackMsg(null);

    const mimeMatch = imagePreview.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const base64Data = imagePreview.includes(',') 
      ? imagePreview.split(',')[1] 
      : imagePreview;

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('image', selectedFile);
      } else {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        formData.append('image', blob, 'stance_upload.jpg');
      }

      formData.append('sport', authData.user.sport);
      formData.append('position', authData.user.position);
      formData.append('experience', authData.user.experience);

      const response = await fetch('/api/analysis/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server rejected coaching analysis request.');
      }

      setSessions(prev => [data, ...prev]);
      setActiveAnalysis(data);
      // Auto focus skeleton layout
      setActiveLensMode('skeleton');
      setFeedbackMsg({ type: 'success', text: 'Stance posture generated & parsed into physical dashboard.' });
      setExpandedSessions(prev => ({ ...prev, [data.id]: true }));

      setSelectedFile(null);
      setImagePreview(null);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Stance generation pipeline error.' });
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedSessions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Discard this biomechanical stance statement from your log?')) {
      return;
    }

    try {
      const res = await fetch(`/api/analysis/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authData.token}`
        }
      });

      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (activeAnalysis?.id === id) {
          setActiveAnalysis(null);
        }
        setFeedbackMsg({ type: 'success', text: 'Mechanics session removed from workspace history.' });
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete stance session.');
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-[#d4af37] bg-[#d4af37]/5 border-[#d4af37]/35';
    if (score >= 5.5) return 'text-amber-500 bg-amber-500/5 border-amber-500/20';
    return 'text-rose-400 bg-rose-400/5 border-rose-500/20';
  };

  const getConfidenceBadge = (level: string) => {
    const lvl = level?.toLowerCase() || 'medium';
    if (lvl === 'high') {
      return <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">HIGH ACCURACY</span>;
    }
    if (lvl === 'medium') {
      return <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase rounded bg-amber-950/40 text-amber-400 border border-amber-500/20">MEDIUM ACCURACY</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase rounded bg-rose-950/40 text-rose-400 border border-rose-500/20">LOW QUALITY</span>;
  };

  // Switcher of modes for past history elements
  const toggleHistoricalLensMode = (id: string, mode: 'clean' | 'skeleton' | 'grid') => {
    setExpandedLensModes(prev => ({
      ...prev,
      [id]: mode
    }));
  };

  // Structured kinetic drill steps mock tracker for high engagement
  const workoutDrillStages = [
    { name: "PHASE 1: ATHLETIC BASE SETUP", instruct: "Align your stance securely. Keep weight biased lightly forwards. Deep breath, stabilize posture." },
    { name: "PHASE 2: ISOMETRIC HOLD & HINGE", instruct: "Engage the kinetic focus points. Push knees slightly out and hold the target tension for 8 seconds." },
    { name: "PHASE 3: EXPLOSIVE RELEASE RECOILS", instruct: "Trigger smooth pivot release. Maintain pelvic level and repeat motion 12 times cleanly." }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6" id="dashboard_container">
      
      {/* Top Professional Ticker Header */}
      <div className="flex justify-between items-center bg-[#090909] border border-white/5 px-4 py-2 rounded-xl mb-6 text-[9px] font-mono tracking-widest text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
          <span>SYSTEM RUNNING: ONLINE</span>
        </div>
        <div className="hidden sm:block">POSE EVALUATOR MATCH ENGINE v2.5</div>
        <div>CLIENT INTERFACE LIVED</div>
      </div>

      {/* Popular Sports Preset Deck Slider */}
      <div className="mb-8" id="sports_deck_panel">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-[#d4af37]" />
          <h3 className="text-[10px] font-mono uppercase text-slate-400 tracking-widest font-bold">Quick Sport Selection Preset</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {SPORT_PRESETS.map((preset) => {
            const isActive = authData.user.sport.toLowerCase() === preset.sport.toLowerCase();
            return (
              <button
                key={preset.sport}
                onClick={() => handleQuickSportPresetSelect(preset.sport, preset.position)}
                className={`py-3 px-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between h-24 ${
                  isActive
                    ? 'bg-[#d4af37]/10 border-[#d4af37] text-white shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                    : 'bg-[#0a0a0a] border-white/5 hover:border-white/20 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-xl">{preset.icon}</span>
                  {isActive && <span className="text-[8px] bg-[#d4af37]/25 text-[#d4af37] px-1 rounded-sm uppercase tracking-wider font-bold">READY</span>}
                </div>
                <div className="text-left mt-2">
                  <p className="text-[10px] font-mono leading-none tracking-wide font-bold">{preset.sport}</p>
                  <p className="text-[8px] font-light text-slate-500 mt-1 truncate max-w-[120px]">{preset.position}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Athlete Workspace Header Card */}
      <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 p-6 md:p-8 shadow-2xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-8 relative overflow-hidden" id="profile_banner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(212,175,55,0.06),transparent_50%)] pointer-events-none"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#8a6d29] text-black font-serif italic text-2xl font-bold flex items-center justify-center rounded-xl shadow-lg cursor-default shrink-0">
            {authData.user.fullName.trim().charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-serif italic text-white tracking-tight">{authData.user.fullName}</h1>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 tracking-wider uppercase">
                {authData.user.experience} CODE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active Focus: <span className="font-semibold text-white">{authData.user.sport}</span> • Assigned Bias Position: <span className="font-semibold text-[#d4af37]">{authData.user.position}</span>
            </p>
          </div>
        </div>

        <button
          id="btn_logout"
          onClick={onLogout}
          className="relative z-10 flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/10 hover:bg-rose-950/20 hover:border-rose-500/30 text-slate-300 text-xs font-mono uppercase tracking-wider rounded-lg transition duration-150 active:translate-y-0.5"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Exit Workspace</span>
        </button>
      </div>

      {feedbackMsg && (
        <div 
          id="dashboard_feedback"
          className={`mb-8 p-4 rounded-xl flex items-center gap-2 border text-xs font-mono tracking-wide ${
            feedbackMsg.type === 'success' 
              ? 'bg-[#d4af37]/5 border-[#d4af37]/20 text-[#d4af37]' 
              : 'bg-rose-950/30 border-rose-500/20 text-rose-300'
          }`}
        >
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#d4af37]" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
          <span>{feedbackMsg.text.toUpperCase()}</span>
        </div>
      )}

      {/* Main Analysis grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Left Hand: Upload & Video calibration */}
        <div className="lg:col-span-5 flex flex-col gap-6" id="upload_left_area">
          
          {/* Stance Upload Widget Card */}
          <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 p-6 shadow-xl flex-1 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_right_top,_rgba(212,175,55,0.02),transparent_60%)] pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#d4af37] animate-pulse" />
                <h2 className="text-sm font-mono uppercase text-slate-300 tracking-wider font-bold">STANCE CAPTURE TRANSMISSION</h2>
              </div>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed font-light">
                Drop your biomechanical posture photo (JPEG, PNG, WEBP, up to 5MB). Ghost Coach assesses limb symmetry, hinge angles and load ratios.
              </p>

              {/* Drag Drop Area with Scanning line during loading for extreme premium feel */}
              <div
                id="file_uploader_card"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden ${
                  dragActive 
                    ? 'border-[#d4af37] bg-[#d4af37]/5' 
                    : 'border-white/10 hover:border-[#d4af37]/40 hover:bg-white/[0.01]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleFileInput}
                />

                {imagePreview ? (
                  <div className="relative group w-full max-h-[180px] flex items-center justify-center overflow-hidden rounded-lg">
                    <img
                      src={imagePreview}
                      alt="Stance Preview"
                      className="max-h-[170px] rounded object-contain border border-white/5 bg-black"
                    />
                    
                    {/* Animated sweep line scanning preview */}
                    {analyzing && <div className="animate-scanner-line" />}
                    
                    <div className="absolute inset-0 bg-black/75 text-[#d4af37] flex items-center justify-center text-[10px] font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition duration-200">
                      CHANGE POSTURE CAPTURE
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-11 h-11 bg-white/[0.03] text-[#d4af37] rounded-lg border border-white/5 flex items-center justify-center mb-3">
                      <Activity className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest block font-sans">Drag & drop stance image</span>
                    <span className="text-[10px] text-[#d4af37] font-mono mt-1 block font-bold leading-normal">OR CLICK TO BROWSE WORKSPACE</span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 relative z-10">
              <button
                id="btn_run_analysis"
                onClick={handleAnalyze}
                disabled={!imagePreview || analyzing}
                className="w-full bg-[#d4af37] hover:bg-[#c29f2e] text-black py-3 px-4 rounded-lg font-bold shadow-md shadow-[#d4af37]/10 tracking-widest text-[11px] uppercase transition-all duration-150 active:translate-y-0.5 flex items-center justify-center gap-2 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:shadow-none cursor-pointer"
              >
                {analyzing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin inline-block"></span>
                    <span className="animate-pulse">PARSING KINETIC CODES...</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT TO NEURAL ANALYZER</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
                  </>
                )}
              </button>

              {analyzing && (
                <div className="mt-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center" id="analysis-step-log">
                  <span className="text-[9px] font-mono font-bold text-[#d4af37] tracking-[0.2em] block uppercase">
                    ⚡ NEURAL ENGINE ONLINE
                  </span>
                  <span className="text-xs text-slate-300 mt-1.5 block min-h-[16px] font-mono font-medium animate-pulse">
                    {progressMsg}
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* Modify Athlete Calibration Parameters */}
          <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between" id="calibration_card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_right_top,_rgba(212,175,55,0.01),transparent_60%)] pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-[#d4af37]" />
                <h2 className="text-sm font-mono uppercase text-slate-300 tracking-wider font-bold">Athlete Calibration</h2>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed font-light">
                Fine-tune your mechanical skill tier and position to customize the coach's neural feedback.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-2 font-bold" htmlFor="calib_experience">
                    Experience Tier
                  </label>
                  <select
                    id="calib_experience"
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value as any)}
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#d4af37]/50"
                  >
                    <option value="Beginner" className="bg-[#0a0a0a]">Beginner</option>
                    <option value="Intermediate" className="bg-[#0a0a0a]">Intermediate</option>
                    <option value="Advanced" className="bg-[#0a0a0a]">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-2 font-bold" htmlFor="calib_position">
                    Sports Position / Core Role
                  </label>
                  <input
                    id="calib_position"
                    type="text"
                    placeholder="e.g. Quarterback, Striker, Guard"
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50"
                  />
                </div>

                <button
                  id="btn_update_calibration"
                  onClick={handleUpdateCalibration}
                  disabled={updatingCalibration || !editPosition.trim()}
                  className="w-full mt-2 bg-[#d4af37] text-black hover:bg-[#c29f2e] py-2.5 px-4 rounded-lg font-mono font-bold tracking-wider text-[10px] uppercase transition cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:translate-y-0.5"
                >
                  {updatingCalibration ? (
                    <>
                      <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin inline-block"></span>
                      <span>Saving Calibration...</span>
                    </>
                  ) : (
                    <>
                      <span>Apply Calibration</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Hand: Interactive high-fidelity Coaching Diagnostics Zone */}
        <div className="lg:col-span-7 flex flex-col" id="analysis_right_area">
          <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 p-6 shadow-xl h-full flex flex-col justify-start relative overflow-hidden">
            
            {activeAnalysis ? (
              <div className="space-y-6" id="coaching_results_panel">
                
                {/* Header Metrics */}
                <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-white/5">
                  <div>
                    <span className="text-[9px] font-mono tracking-[0.2em] text-[#d4af37] block uppercase font-bold">LASER BIOMECHANICAL REPORT</span>
                    <h3 className="text-xl font-serif italic text-white mt-1">Biomechanical Assessment</h3>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-0.5 rounded border border-[#d4af37]/20 uppercase">
                        {activeAnalysis.sport}
                      </span>
                      <span className="text-[10px] font-mono bg-white/[0.04] text-slate-300 px-2 py-0.5 rounded uppercase">
                        {activeAnalysis.position}
                      </span>
                      <span className="text-[10px] font-mono bg-white/[0.04] text-slate-400 px-2 py-0.5 rounded uppercase font-bold">
                        {activeAnalysis.experience} LEVEL
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div id="latest_overall_rating" className={`px-4 py-2 text-center rounded-xl border ${getScoreColor(activeAnalysis.analysis.overallScore)} font-serif font-black text-3xl flex items-baseline gap-1`}>
                      {activeAnalysis.analysis.overallScore}
                      <span className="text-xs text-slate-500 font-sans font-normal">/10</span>
                    </div>
                    <span className="text-[8px] tracking-widest font-mono font-bold text-slate-500 mt-1 uppercase">POSE MATCH RATIO</span>
                  </div>
                </div>

                {/* HIGH-TECH MULTI-LENS INTERACTIVE DIAGNOSTIC VIEWER */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Interactive Lens Overlays */}
                  <div className="md:col-span-6 space-y-4">
                    <div className="flex justify-between items-center bg-[#121212] p-1.5 rounded-lg border border-white/5">
                      <button
                        onClick={() => setActiveLensMode('clean')}
                        className={`flex-1 py-1 px-2 text-[9px] font-mono uppercase tracking-widest rounded transition-all cursor-pointer ${
                          activeLensMode === 'clean' ? 'bg-[#d4af37] text-black font-extrabold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Clean
                      </button>
                      <button
                        onClick={() => setActiveLensMode('skeleton')}
                        className={`flex-1 py-1 px-2 text-[9px] font-mono uppercase tracking-widest rounded transition-all cursor-pointer ${
                          activeLensMode === 'skeleton' ? 'bg-[#d4af37] text-black font-extrabold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Skeleton
                      </button>
                      <button
                        onClick={() => setActiveLensMode('grid')}
                        className={`flex-1 py-1 px-2 text-[9px] font-mono uppercase tracking-widest rounded transition-all cursor-pointer ${
                          activeLensMode === 'grid' ? 'bg-[#d4af37] text-black font-extrabold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Grids
                      </button>
                    </div>

                    <InteractiveStanceLens 
                      imageSrc={activeAnalysis.photoBase64}
                      score={activeAnalysis.analysis.overallScore}
                      confidence={activeAnalysis.analysis.confidenceLevel}
                      mode={activeLensMode}
                    />
                  </div>

                  {/* Right Column: Physical Telemetry Gauges bento style */}
                  <div className="md:col-span-6 space-y-4">
                    <h4 className="text-[10px] font-mono font-bold text-slate-400 tracking-[0.15em] uppercase pb-1 border-b border-white/5 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-[#d4af37]" />
                      Biomechanical Telemetry
                    </h4>

                    {/* Progress dials / bento stats box */}
                    <div className="grid grid-cols-2 gap-3">
                      
                      {/* Metric 1 */}
                      <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                        <div className="flex justify-between items-center text-[#d4af37] mb-1">
                          <Target className="w-3.5 h-3.5" />
                          <span className="text-[8px] font-mono font-bold uppercase">BALANCE</span>
                        </div>
                        <div className="text-slate-100 font-serif font-black text-lg my-1">
                          {(45 + activeAnalysis.analysis.overallScore * 0.75).toFixed(0)}% <span className="text-[10px] text-slate-500 font-sans">Lead</span>
                        </div>
                        <div className="w-full bg-[#1b1b1b] rounded-full h-1 mt-1">
                          <div 
                            className="bg-[#d4af37] h-1 rounded-full" 
                            style={{ width: `${45 + activeAnalysis.analysis.overallScore * 0.75}%` }}
                          />
                        </div>
                      </div>

                      {/* Metric 2 */}
                      <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                        <div className="flex justify-between items-center text-teal-400 mb-1">
                          <Compass className="w-3.5 h-3.5" />
                          <span className="text-[8px] font-mono font-bold uppercase">SPINE TILT</span>
                        </div>
                        <div className="text-slate-100 font-serif font-black text-lg my-1">
                          {(32 - activeAnalysis.analysis.overallScore * 1.6).toFixed(1)}°
                        </div>
                        <span className="text-[8px] font-mono text-slate-500">Angle from plumb</span>
                      </div>

                      {/* Metric 3 */}
                      <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                        <div className="flex justify-between items-center text-emerald-400 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="text-[8px] font-mono font-bold uppercase">SYMMETRY</span>
                        </div>
                        <div className="text-slate-100 font-serif font-black text-lg my-1">
                          {(72 + activeAnalysis.analysis.overallScore * 2.6).toFixed(0)}%
                        </div>
                        <span className="text-[8px] font-mono text-emerald-500 font-bold uppercase">EXCELLENT MATCH</span>
                      </div>

                      {/* Metric 4 */}
                      <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                        <div className="flex justify-between items-center text-amber-500 mb-1">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span className="text-[8px] font-mono font-bold uppercase">HIP GAP WIDTH</span>
                        </div>
                        <div className="text-slate-100 font-serif font-bold text-xs my-2 tracking-wide uppercase">
                          {activeAnalysis.analysis.overallScore >= 8 ? 'STANDARDIZED' : activeAnalysis.analysis.overallScore >= 5.5 ? 'SLIGHTLY WIDE' : 'LOOSE COMPRESSION'}
                        </div>
                        <span className="text-[8px] font-mono text-slate-500">Shoulder proportion</span>
                      </div>

                    </div>

                    {/* Identified Strengths */}
                    <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                      <h4 className="text-[10px] font-mono font-bold text-slate-400 tracking-[0.10em] uppercase mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ANATOMICAL ASSETS
                      </h4>
                      <ul className="space-y-1.5">
                        {activeAnalysis.analysis.strengths.slice(0, 3).map((str, idx) => (
                          <li key={idx} className="text-[11px] text-slate-300 font-light pl-2.5 border-l border-[#d4af37] leading-relaxed">
                            {str}
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </div>

                {/* Strategy adjustments box */}
                <div className="p-3 bg-zinc-950 border border-white/5 rounded-xl">
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 tracking-[0.10em] uppercase mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    KINETIC FLUGS & COMPROMISES
                  </h4>
                  <div className="space-y-2">
                    {activeAnalysis.analysis.areasToImprove.slice(0, 2).map((item: any, idx) => {
                      const flaw = typeof item === 'string' ? item : item.flaw;
                      const explanation = typeof item === 'string' ? '' : item.explanation;
                      return (
                        <div key={idx} className="bg-white/[0.02] border border-white/5 px-2.5 py-2 rounded-lg">
                          <span className="text-[11px] font-semibold text-slate-200 block">{flaw}</span>
                          {explanation && <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-light">{explanation}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Locker-room chalkboard drill interactive workout panel */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 border-t border-white/5" id="coaching_directives">
                  
                  {/* Left priority fix */}
                  <div className="md:col-span-5 bg-[#d4af37]/5 border border-[#d4af37]/20 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-[#d4af37] uppercase tracking-widest block mb-1">🔥 THE PRIORITY MOVE</span>
                      <p className="text-xs font-serif italic text-white leading-relaxed">{activeAnalysis.analysis.priorityFix}</p>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500 mt-2 block uppercase">CORE SYNERGETIC ADVICE</span>
                  </div>
                  
                  {/* Right clinical drill with walkthrough generator */}
                  <div className="md:col-span-7 bg-[#111111] border border-white/10 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        🛠️ ASSIGNED DRILL STRATEGY
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-light mb-3">{activeAnalysis.analysis.drillSuggestion}</p>
                    </div>

                    {/* Highly Interactive Workout simulation triggers */}
                    {drillWalkthroughActive ? (
                      <div className="mt-2 bg-[#090909] p-3 rounded-lg border border-[#d4af37]/30">
                        <div className="flex justify-between items-center text-[9px] font-mono text-[#d4af37] mb-1 font-bold">
                          <span>{workoutDrillStages[drillWalkthroughStep].name}</span>
                          <span className="animate-pulse">HOLD SECS: {countdownSeconds}s</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans italic">
                          {workoutDrillStages[drillWalkthroughStep].instruct}
                        </p>
                        <div className="mt-2 flex gap-1 bg-white/5 rounded-full overflow-hidden h-1">
                          <div className={`h-full bg-[#d4af37] transition-all`} style={{ width: `${(drillWalkthroughStep + 1) * 33}%` }}></div>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            onClick={() => {
                              if (drillWalkthroughStep >= 2) {
                                setDrillWalkthroughActive(false);
                                setDrillWalkthroughStep(0);
                              } else {
                                setDrillWalkthroughStep(s => s + 1);
                                setCountdownSeconds(15);
                              }
                            }}
                            className="bg-[#d4af37] text-black text-[9px] font-mono font-bold uppercase px-2 py-1 rounded cursor-pointer hover:bg-[#c29f2e]"
                          >
                            Next Action
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setDrillWalkthroughActive(true);
                          setDrillWalkthroughStep(0);
                          setCountdownSeconds(15);
                        }}
                        className="w-full bg-[#1b1b1b] hover:bg-white/[0.04] text-[#d4af37] border border-[#d4af37]/25 hover:border-[#d4af37] py-2 px-3 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Launch Walkthrough Training Companion</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl bg-[#090909]" id="empty_coach_panel">
                <div className="w-16 h-16 bg-white/[0.02] border border-white/10 text-[#d4af37] rounded-full flex items-center justify-center mb-4">
                  <Award className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-serif italic text-white">No active stance assessment selected</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed font-light">
                  Submit a posture photo on the left panel or select any past sessions below. Ghost Coach assesses mechanical geometry instantly.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* TRAINING HIST HISTORIES */}
      <div className="mb-6 flex justify-between items-center pt-4 border-t border-white/5" id="history_header_area">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4.5 h-4.5 text-[#d4af37]" />
          <h2 className="text-lg font-serif italic text-white tracking-tight">Coaching Session History</h2>
          <span className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/[0.04] border border-white/5 rounded-md font-bold">
            {sessions.length} TRAINING LOGS
          </span>
        </div>
      </div>

      {sessions.length > 0 ? (
        <div className="space-y-4" id="session_history_list">
          {sessions.map((item) => {
            const isExpanded = expandedSessions[item.id] || false;
            const currentItemLensMode = expandedLensModes[item.id] || 'skeleton';
            return (
              <div
                key={item.id}
                onClick={() => toggleExpand(item.id)}
                className="bg-[#0a0a0a] rounded-xl border border-white/5 hover:border-[#d4af37]/35 transition-all duration-300 cursor-pointer overflow-hidden shadow-lg relative"
                id={`session_card_${item.id}`}
              >
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#d4af37] to-[#8a6d29]"></div>

                {/* Header summary row */}
                <div className="p-4 pl-6 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                  <div className="flex items-start md:items-center gap-4">
                    {/* Stance Photo thumbnail */}
                    <div className="w-14 h-16 rounded overflow-hidden shrink-0 border border-white/10 relative shadow-2xl bg-black">
                      <img
                        src={item.photoBase64}
                        alt="Posture Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{item.sport} biomechanical session</span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-white/[0.03] px-1.5 py-0.5 rounded">
                          {item.position}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>{new Date(item.createdAt).toLocaleDateString()} AT {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase()}</span>
                      </div>
                      
                      <p className="text-xs font-light text-slate-400 mt-1.5 leading-snug">
                        <span className="text-[9px] uppercase font-mono font-bold text-[#d4af37] bg-[#d4af37]/10 px-1.5 py-0.5 rounded border border-[#d4af37]/20 mr-2">PRIORITY MOVE DIRECTIVE</span>
                        <span className="italic font-serif text-white">"{item.analysis.priorityFix}"</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions summary rating */}
                  <div className="flex items-center justify-between md:justify-end gap-5 border-t border-white/5 md:border-none pt-3 md:pt-0">
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 font-serif text-sm font-bold rounded-lg border leading-tight ${getScoreColor(item.analysis.overallScore)}`}>
                        {item.analysis.overallScore} / 10
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        id={`delete_btn_${item.id}`}
                        onClick={(e) => handleDeleteSession(item.id, e)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Delete Stance Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="text-slate-400 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-[#d4af37]" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub expansion detail panel */}
                {isExpanded && (
                  <div 
                    className="px-6 pb-6 pt-4 bg-[#0a0a0a] border-t border-white/5 flex flex-col md:flex-row gap-6 items-start animate-fade-in text-sans pl-10"
                    onClick={(e) => e.stopPropagation()}
                    id={`expanded_report_${item.id}`}
                  >
                    
                    {/* Left view inside expanded panel */}
                    <div className="w-full md:w-1/3 flex flex-col gap-4">
                      
                      {/* Image lens mode toolbar */}
                      <div className="flex justify-between items-center bg-[#121212] p-1 rounded border border-white/5">
                        <button
                          onClick={() => toggleHistoricalLensMode(item.id, 'clean')}
                          className={`flex-1 py-1 text-[8px] font-mono uppercase tracking-wider rounded cursor-pointer ${
                            currentItemLensMode === 'clean' ? 'bg-[#d4af37] text-black font-extrabold' : 'text-slate-400'
                          }`}
                        >
                          Clean
                        </button>
                        <button
                          onClick={() => toggleHistoricalLensMode(item.id, 'skeleton')}
                          className={`flex-1 py-1 text-[8px] font-mono uppercase tracking-wider rounded cursor-pointer ${
                            currentItemLensMode === 'skeleton' ? 'bg-[#d4af37] text-black font-extrabold' : 'text-slate-400'
                          }`}
                        >
                          Skeleton
                        </button>
                        <button
                          onClick={() => toggleHistoricalLensMode(item.id, 'grid')}
                          className={`flex-1 py-1 text-[8px] font-mono uppercase tracking-wider rounded cursor-pointer ${
                            currentItemLensMode === 'grid' ? 'bg-[#d4af37] text-black font-extrabold' : 'text-slate-400'
                          }`}
                        >
                          Grids
                        </button>
                      </div>

                      <InteractiveStanceLens 
                        imageSrc={item.photoBase64}
                        score={item.analysis.overallScore}
                        confidence={item.analysis.confidenceLevel}
                        mode={currentItemLensMode}
                      />
                    </div>

                    {/* Right feedback breakdown inside expanded panel */}
                    <div className="w-full md:w-2/3 space-y-4">
                      
                      {/* Identified Strengths */}
                      <div>
                        <h4 className="text-[10px] font-mono font-bold text-slate-400 tracking-[0.10em] uppercase flex items-center gap-1.5 mb-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Anatomical Strengths
                        </h4>
                        <ul className="space-y-1.5">
                          {item.analysis.strengths.map((str, idx) => (
                            <li key={idx} className="text-xs text-slate-300 pl-3 border-l border-[#d4af37] font-light">
                              {str}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Technical corrections areas */}
                      <div>
                        <h4 className="text-[10px] font-mono font-bold text-slate-400 tracking-[0.10em] uppercase flex items-center gap-1.5 mb-2">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                          Mechanical Errors & Adjustments
                        </h4>
                        <div className="space-y-2">
                          {item.analysis.areasToImprove.map((flawItem: any, idx) => {
                            const flaw = typeof flawItem === 'string' ? flawItem : flawItem.flaw;
                            const explanation = typeof flawItem === 'string' ? '' : flawItem.explanation;
                            return (
                              <div key={idx} className="bg-[#121212] p-3 rounded-lg border border-white/5">
                                <span className="text-xs font-semibold text-slate-200 block">{flaw}</span>
                                {explanation && <p className="text-[11px] text-slate-400 mt-1 font-light leading-relaxed">{explanation}</p>}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Directive summary blocks */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                        <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 p-3.5 rounded-xl">
                          <span className="text-[9px] font-mono font-bold text-[#d4af37] uppercase tracking-wider block mb-1">🔥 THE PRIORITY FIX</span>
                          <p className="text-xs text-white italic font-serif leading-relaxed">{item.analysis.priorityFix}</p>
                        </div>
                        <div className="bg-[#0f0f0f] border border-white/10 p-3.5 rounded-xl">
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">🛠️ EXERCISE STRATEGY</span>
                          <p className="text-xs text-slate-300 leading-normal font-light">{item.analysis.drillSuggestion}</p>
                        </div>
                      </div>

                      {/* Focus button */}
                      <div className="pt-2 flex justify-end">
                        <button
                          id={`btn_set_active_${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveAnalysis(item);
                            // Auto select matching layout mode
                            setActiveLensMode(currentItemLensMode);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] hover:text-white border border-[#d4af37]/20 hover:border-[#d4af37] px-3 py-1.5 rounded bg-white/[0.01] hover:bg-[#d4af37]/10 transition cursor-pointer"
                        >
                          Focus on Diagnostics HUD
                        </button>
                      </div>

                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#0a0a0a] rounded-xl border border-white/5 p-12 text-center shadow-xl" id="history_empty_state">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-serif italic text-white">No workspace sessions documented</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed font-light">
            Record coaching stance critiques above to build your historic biomechanical training log!
          </p>
        </div>
      )}

    </div>
  );
}

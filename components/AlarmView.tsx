
import React, { useState, useEffect, useRef } from 'react';
import { Alarm } from '../types';
import { IconPlus, IconTrash } from './Icons';
import { Bell, Play, Pause, RotateCcw, ChevronRight, BellOff, Check, X } from 'lucide-react';
import { SystemManager, RINGTONE_LIST } from '../utils';

interface AlarmViewProps {
  alarms: Alarm[];
  onAddAlarm: (time: string, label: string, ringtone: string) => void;
  onToggleAlarm: (id: string) => void;
  onDeleteAlarm: (id: string) => void;
}

type Tab = 'ALARM' | 'STOPWATCH' | 'TIMER';

// --- HELPER: CALCULATE TIME UNTIL RING ---
const getTimeUntil = (hour24: number, minute: number) => {
    const now = new Date();
    let target = new Date();
    target.setHours(hour24, minute, 0, 0);
    
    if (target <= now) {
        target.setDate(target.getDate() + 1); // Next day
    }
    
    const diffMs = target.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs === 0 && diffMins === 0) return 'Alarm will ring in less than a minute';
    return `Alarm set for ${diffHrs}h ${diffMins}m from now`;
};

// --- SUB-COMPONENTS ---

const Stopwatch = () => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState<number[]>([]);
    const requestRef = useRef<number>();
    const startTimeRef = useRef<number>(0);

    const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp - time;
        setTime(timestamp - startTimeRef.current);
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (isRunning) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(requestRef.current!);
            startTimeRef.current = 0;
        }
        return () => cancelAnimationFrame(requestRef.current!);
    }, [isRunning]);

    const formatTime = (ms: number) => {
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        const cs = Math.floor((ms % 1000) / 10);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center h-full pt-10 px-6">
            <div className="w-[280px] h-[280px] rounded-full border-[4px] border-gray-100 dark:border-white/5 flex items-center justify-center shadow-inner relative bg-white dark:bg-gray-800/50 mb-12">
                <span className="text-6xl font-mono font-light tracking-tighter tabular-nums text-gray-800 dark:text-white">
                    {formatTime(time)}
                </span>
            </div>

            <div className="flex gap-12 mb-8">
                 {isRunning ? (
                     <button onClick={() => setLaps([time, ...laps])} className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center active:scale-95 transition-transform">
                         <span className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">Lap</span>
                     </button>
                 ) : (
                     <button onClick={() => { setTime(0); setLaps([]); }} className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center active:scale-95 transition-transform">
                         <RotateCcw className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                     </button>
                 )}
                 
                 <button 
                    onClick={() => setIsRunning(!isRunning)} 
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all ${isRunning ? 'bg-red-500/20 text-red-500 ring-2 ring-red-500' : 'bg-green-500/20 text-green-500 ring-2 ring-green-500'}`}
                >
                     {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                 </button>
            </div>

            <div className="w-full flex-1 overflow-y-auto no-scrollbar mask-gradient-b">
                 {laps.map((lap, i) => (
                     <div key={i} className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800 text-sm font-mono text-gray-500 dark:text-gray-400">
                         <span>Lap {laps.length - i}</span>
                         <span>{formatTime(lap)}</span>
                     </div>
                 ))}
            </div>
        </div>
    );
};

const Timer = () => {
    const [duration, setDuration] = useState(0); 
    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isRinging, setIsRinging] = useState(false);

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            setIsRinging(true);
            SystemManager.playRingtone('radar');
            SystemManager.vibrate('sos');
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const format = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const addTime = (sec: number) => {
        if (isRinging) return;
        setDuration(prev => prev + sec);
        setTimeLeft(prev => prev + sec);
    };

    const stopRinging = () => {
        SystemManager.stopRingtone();
        setIsRinging(false);
    };

    return (
        <div className="flex flex-col items-center h-full pt-10 px-6">
             <div className="relative w-[280px] h-[280px] flex items-center justify-center mb-10">
                 {/* Progress Ring */}
                 <svg className="w-full h-full transform -rotate-90">
                     <circle cx="140" cy="140" r="135" stroke="currentColor" strokeWidth="4" fill="transparent" className={`text-gray-100 dark:text-gray-800 ${isRinging ? 'animate-pulse text-red-200' : ''}`} />
                     <circle 
                        cx="140" cy="140" r="135" 
                        stroke={isRinging ? "#EF4444" : "#F58316"} 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={848} 
                        strokeDashoffset={848 - (timeLeft / (duration || 1)) * 848}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                     />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className={`text-6xl font-mono font-light tracking-tighter tabular-nums ${isRinging ? 'text-red-500 animate-pulse' : 'text-gray-800 dark:text-white'}`}>
                         {format(timeLeft)}
                     </span>
                     <span className="text-gray-400 text-sm font-medium mt-2 uppercase tracking-widest">
                        {isRinging ? 'Time Up!' : isActive ? 'Running' : 'Ready'}
                     </span>
                 </div>
             </div>

             <div className="flex gap-8 mb-8">
                 {isRinging ? (
                    <button 
                        onClick={stopRinging}
                        className="w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all bg-red-500 text-white animate-bounce-slight ring-4 ring-red-500/30"
                    >
                        <BellOff className="w-8 h-8 fill-current mb-1" />
                        <span className="text-xs font-bold uppercase tracking-widest">Stop</span>
                    </button>
                 ) : (
                    <>
                        <button onClick={() => { setIsActive(false); setTimeLeft(duration); }} className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center active:scale-95 transition-transform text-gray-600 dark:text-gray-300">
                            <RotateCcw className="w-6 h-6" />
                        </button>
                        <button 
                            onClick={() => setIsActive(!isActive)}
                            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all ${isActive ? 'bg-orange-500/20 text-orange-500 ring-2 ring-orange-500' : 'bg-green-500/20 text-green-500 ring-2 ring-green-500'}`}
                        >
                            {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                        </button>
                    </>
                 )}
             </div>

             <div className={`grid grid-cols-4 gap-3 w-full transition-opacity ${isRinging ? 'opacity-30 pointer-events-none' : ''}`}>
                 {[1, 5, 10, 15].map(m => (
                     <button 
                        key={m} 
                        onClick={() => addTime(m * 60)}
                        className="py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                     >
                         +{m}m
                     </button>
                 ))}
             </div>
        </div>
    );
};

// --- LUXURY ANALOG CLOCK FACE (Chronograph Style) ---
const ClockFace = ({ mode, value, onChange, onAutoSwitch }: { mode: 'HOUR'|'MINUTE', value: number, onChange: (val: number) => void, onAutoSwitch: () => void }) => {
    const clockRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleInteraction = (clientX: number, clientY: number, isFinished: boolean) => {
        if (!clockRef.current) return;
        const rect = clockRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = clientX - rect.left - centerX;
        const y = clientY - rect.top - centerY;

        let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;

        const step = mode === 'HOUR' ? 30 : 6;
        const roundedAngle = Math.round(angle / step) * step;

        let newValue;
        if (mode === 'HOUR') {
            newValue = Math.round(roundedAngle / 30);
            if (newValue === 0) newValue = 12;
        } else {
            newValue = Math.round(roundedAngle / 6);
            if (newValue === 60) newValue = 0;
        }

        if (newValue !== value) {
            onChange(newValue);
            if(navigator.vibrate) navigator.vibrate(5);
        }

        if (isFinished && mode === 'HOUR') {
             setTimeout(onAutoSwitch, 400);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); handleInteraction(e.clientX, e.clientY, false); };
    const handleMouseMove = (e: React.MouseEvent) => { if (isDragging) handleInteraction(e.clientX, e.clientY, false); };
    const handleMouseUp = (e: React.MouseEvent) => { setIsDragging(false); handleInteraction(e.clientX, e.clientY, true); };
    const handleTouchStart = (e: React.TouchEvent) => { setIsDragging(true); handleInteraction(e.touches[0].clientX, e.touches[0].clientY, false); };
    const handleTouchMove = (e: React.TouchEvent) => { e.preventDefault(); handleInteraction(e.touches[0].clientX, e.touches[0].clientY, false); };
    const handleTouchEnd = (e: React.TouchEvent) => { setIsDragging(false); handleInteraction(e.changedTouches[0].clientX, e.changedTouches[0].clientY, true); };

    // Math for positioning
    const radius = 110; 
    const numbers = mode === 'HOUR' ? [12,1,2,3,4,5,6,7,8,9,10,11] : [0,5,10,15,20,25,30,35,40,45,50,55];

    let degrees = 0;
    if (mode === 'HOUR') {
        degrees = (value % 12) * 30;
        if (value === 12) degrees = 0; 
    } else {
        degrees = value * 6;
    }

    // Tick Marks Generation (Chronograph look)
    const ticks = Array.from({length: 60}).map((_, i) => {
        const isMajor = i % 5 === 0;
        const tickDeg = i * 6;
        return (
            <div 
                key={i}
                className={`absolute top-0 left-1/2 -translate-x-1/2 origin-bottom h-full pointer-events-none`}
                style={{ transform: `rotate(${tickDeg}deg)` }}
            >
                <div className={`w-[1px] mx-auto ${isMajor ? 'h-3 bg-white/50' : 'h-1.5 bg-white/20'}`}></div>
            </div>
        );
    });

    return (
        <div 
            ref={clockRef}
            className="w-[280px] h-[280px] rounded-full bg-black/40 backdrop-blur-md border border-white/10 relative cursor-pointer touch-none shadow-2xl"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
             {/* Tick Marks Ring */}
             <div className="absolute inset-4 rounded-full border border-white/5">
                {ticks}
             </div>

             {/* Numbers */}
             {numbers.map((num, i) => {
                 // Adjust logic to map index 0 (12) to 0 deg, 1 to 30 deg etc.
                 // The array is already ordered correctly 12, 1, 2...
                 const angleDeg = i * 30;
                 const angleRad = (angleDeg - 90) * (Math.PI / 180); // -90 to start at top
                 
                 const x = radius * Math.cos(angleRad);
                 const y = radius * Math.sin(angleRad);
                 
                 const isSelected = value === num || (mode === 'MINUTE' && value === num) || (mode === 'MINUTE' && num === 0 && value === 60);
                 const displayNum = mode === 'MINUTE' && num === 0 ? '00' : num;

                 return (
                     <div 
                        key={i}
                        className={`absolute w-8 h-8 flex items-center justify-center text-[16px] transition-all duration-300 pointer-events-none select-none
                            ${isSelected ? 'text-white font-bold scale-110 text-shadow-glow' : 'text-white/40 font-medium'}
                        `}
                        style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            transform: 'translate(-50%, -50%)'
                        }}
                     >
                         {displayNum}
                     </div>
                 );
             })}

             {/* Clock Hand */}
             <div 
                className="absolute top-0 left-1/2 w-[2px] h-[50%] origin-bottom transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) z-10 pointer-events-none"
                style={{ transform: `translateX(-50%) rotate(${degrees}deg)` }}
             >
                 {/* The Line */}
                 <div className="w-[2px] h-[65%] bg-accent mt-[35%] relative shadow-[0_0_10px_rgba(245,131,22,0.8)]">
                     {/* The Tip Circle */}
                     <div className="absolute -top-1.5 -left-[5px] w-3 h-3 bg-accent rounded-full shadow-lg"></div>
                 </div>
             </div>
             
             {/* Center Pin */}
             <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20 shadow-lg border border-gray-400"></div>
        </div>
    );
};


export const AlarmView: React.FC<AlarmViewProps> = ({ alarms, onAddAlarm, onToggleAlarm, onDeleteAlarm }) => {
  const [activeTab, setActiveTab] = useState<Tab>('ALARM');
  const [isAdding, setIsAdding] = useState(false);
  
  // Alarm Edit State
  const now = new Date();
  const currentHours = now.getHours();
  const [editHour12, setEditHour12] = useState(currentHours % 12 || 12);
  const [editMinute, setEditMinute] = useState(now.getMinutes());
  const [editAmPm, setEditAmPm] = useState<'AM'|'PM'>(currentHours >= 12 ? 'PM' : 'AM');
  const [inputMode, setInputMode] = useState<'HOUR' | 'MINUTE'>('HOUR'); 
  
  const [editLabel, setEditLabel] = useState('Alarm');
  const [editRingtone, setEditRingtone] = useState('radar');
  const [editRepeat, setEditRepeat] = useState([1, 1, 1, 1, 1, 1, 1]); 
  const [editSnooze, setEditSnooze] = useState(true);
  
  const [showRepeatSelector, setShowRepeatSelector] = useState(false);
  const [showSoundSelector, setShowSoundSelector] = useState(false);

  const handleSave = () => {
    let hour24 = editHour12;
    if (editAmPm === 'AM' && hour24 === 12) hour24 = 0;
    if (editAmPm === 'PM' && hour24 !== 12) hour24 += 12;

    const timeStr = `${hour24.toString().padStart(2, '0')}:${editMinute.toString().padStart(2, '0')}`;
    // In a real app, we would pass 'editRepeat', 'editSnooze' etc. 
    // Since App.tsx signature is limited, we stick to the core params but the UI handles the data collection
    onAddAlarm(timeStr, editLabel, editRingtone);
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
      setShowRepeatSelector(false);
      setShowSoundSelector(false);
      setEditLabel('Alarm');
      setInputMode('HOUR');
  };

  const getRepeatString = () => {
      const days = editRepeat;
      const total = days.reduce((a, b) => a + b, 0);
      if (total === 7) return 'Every day';
      if (total === 0) return 'Never';
      if (days[0] === 1 && days[6] === 1 && total === 2) return 'Weekends';
      if (days[0] === 0 && days[6] === 0 && total === 5) return 'Weekdays';
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return dayNames.filter((_, i) => days[i] === 1).join(', ');
  };

  const formatRepeat = (index: number) => {
      const d = [...editRepeat];
      d[index] = d[index] ? 0 : 1;
      setEditRepeat(d);
  };

  const getPreviewTime = () => {
      let h = editHour12;
      if (editAmPm === 'AM' && h === 12) h = 0;
      if (editAmPm === 'PM' && h !== 12) h += 12;
      return getTimeUntil(h, editMinute);
  };

  return (
    <div className="h-full flex flex-col animate-slide-up pb-24">
      
      {/* Top Tab Bar */}
      <div className="px-6 pb-4">
          <div className="flex bg-gray-200 dark:bg-white/10 p-1 rounded-xl">
              <button onClick={() => setActiveTab('ALARM')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'ALARM' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}>Alarm</button>
              <button onClick={() => setActiveTab('STOPWATCH')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'STOPWATCH' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}>Stopwatch</button>
              <button onClick={() => setActiveTab('TIMER')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'TIMER' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}>Timer</button>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
          {activeTab === 'ALARM' && (
              <>
                <div className="flex items-center justify-between px-6 mb-2 mt-2">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sleep | Wake Up</span>
                     <button onClick={() => setIsAdding(true)} className="text-accent font-bold text-sm flex items-center gap-1 active:opacity-50">
                         <IconPlus className="w-4 h-4" /> Add
                     </button>
                </div>
                
                <div className="flex flex-col gap-3 px-4 mt-2">
                    {alarms.map(alarm => {
                        const [h, m] = alarm.time.split(':').map(Number);
                        const ampm = h >= 12 ? 'PM' : 'AM';
                        const h12 = h % 12 || 12;
                        const timeDisplay = `${h12}:${m.toString().padStart(2, '0')}`;

                        return (
                        <div key={alarm.id} className="glass-card p-4 rounded-2xl flex items-center justify-between group dark:bg-[#1C1C1E] border dark:border-white/5 shadow-sm">
                            <div className="flex flex-col">
                                <div className="flex items-end gap-1">
                                    <span className={`text-5xl font-light tracking-tight ${alarm.isEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                        {timeDisplay}
                                    </span>
                                    <span className="text-lg font-medium text-gray-500 mb-1.5">{ampm}</span>
                                </div>
                                <div className="text-xs text-gray-500 font-medium mt-1">
                                    {alarm.label || 'Alarm'}, {alarm.snoozeCount > 0 ? 'Snoozed' : 'Every day'}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => onDeleteAlarm(alarm.id)}
                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <IconTrash className="w-5 h-5" />
                                </button>
                                
                                <button 
                                    onClick={() => onToggleAlarm(alarm.id)}
                                    className={`w-[52px] h-[32px] rounded-full p-0.5 transition-all duration-300 ${alarm.isEnabled ? 'bg-[#34C759]' : 'bg-[#39393D]'}`}
                                >
                                    <div className={`w-[28px] h-[28px] bg-white rounded-full shadow-md transition-transform duration-300 ${alarm.isEnabled ? 'translate-x-[22px]' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                        );
                    })}
                </div>
              </>
          )}
          {activeTab === 'STOPWATCH' && <Stopwatch />}
          {activeTab === 'TIMER' && <Timer />}
      </div>

      {/* --- PREMIUM GLASSMORPHIC ADD MODAL --- */}
      {isAdding && (
          <div className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-2xl flex flex-col animate-fade-in-up font-sans text-white">
              
              {/* Top Bar */}
              <div className="px-6 py-4 flex items-center justify-between z-20">
                  <button 
                    onClick={() => setIsAdding(false)} 
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                      <X className="w-5 h-5 text-gray-300" />
                  </button>
                  <span className="text-[17px] font-semibold tracking-wide">Add Alarm</span>
                  <button 
                    onClick={handleSave} 
                    className="px-5 py-2 rounded-full bg-accent text-white font-semibold text-sm shadow-lg shadow-accent/20 active:scale-95 transition-transform"
                  >
                      Save
                  </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pb-10 flex flex-col items-center w-full">
                  
                  {/* Digital Time & AM/PM */}
                  <div className="flex items-center justify-center gap-6 mt-6 mb-8 relative">
                        {/* Time Text */}
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setInputMode('HOUR')}
                                className={`text-[72px] font-light leading-none transition-all ${inputMode === 'HOUR' ? 'text-white scale-105' : 'text-white/30'}`}
                            >
                                {editHour12.toString().padStart(2,'0')}
                            </button>
                            <span className="text-[72px] font-light leading-none text-white/30 pb-2">:</span>
                            <button 
                                onClick={() => setInputMode('MINUTE')}
                                className={`text-[72px] font-light leading-none transition-all ${inputMode === 'MINUTE' ? 'text-white scale-105' : 'text-white/30'}`}
                            >
                                {editMinute.toString().padStart(2,'0')}
                            </button>
                        </div>
                        
                        {/* AM/PM Switcher */}
                        <div className="flex flex-col bg-white/10 rounded-lg p-1 gap-1">
                            <button 
                                onClick={() => setEditAmPm('AM')}
                                className={`px-3 py-1 rounded text-sm font-bold transition-all ${editAmPm === 'AM' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
                            >
                                AM
                            </button>
                            <button 
                                onClick={() => setEditAmPm('PM')}
                                className={`px-3 py-1 rounded text-sm font-bold transition-all ${editAmPm === 'PM' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
                            >
                                PM
                            </button>
                        </div>
                  </div>

                  {/* ANALOG CLOCK */}
                  <div className="mb-8 scale-90 sm:scale-100 transition-transform">
                       <ClockFace 
                            mode={inputMode} 
                            value={inputMode === 'HOUR' ? editHour12 : editMinute}
                            onChange={(val) => {
                                if (inputMode === 'HOUR') setEditHour12(val);
                                else setEditMinute(val);
                            }}
                            onAutoSwitch={() => setInputMode('MINUTE')}
                       />
                  </div>

                  {/* Settings Islands */}
                  <div className="w-[90%] max-w-md flex flex-col gap-4">
                      
                      {/* Repeat Group */}
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/5">
                          <button 
                            onClick={() => setShowRepeatSelector(!showRepeatSelector)}
                            className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors"
                          >
                             <div className="flex flex-col items-start">
                                 <span className="text-[17px] text-white">Repeat</span>
                                 <span className="text-[13px] text-accent mt-0.5">{getRepeatString()}</span>
                             </div>
                             <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${showRepeatSelector ? 'rotate-90' : ''}`} />
                          </button>
                          
                          {showRepeatSelector && (
                              <div className="px-4 pb-4 animate-slide-up bg-black/20 pt-2">
                                  <div className="flex justify-between p-1">
                                      {['S','M','T','W','T','F','S'].map((d, i) => (
                                          <button 
                                            key={i}
                                            onClick={() => formatRepeat(i)}
                                            className={`
                                                w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center transition-all
                                                ${editRepeat[i] ? 'bg-accent text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}
                                            `}
                                          >
                                              {d}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* Label Input */}
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-1 flex items-center justify-between border border-white/5">
                          <span className="text-[17px] text-white font-medium">Label</span>
                          <input 
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="bg-transparent text-right text-[17px] text-white/70 outline-none w-2/3 h-12 placeholder-white/30"
                            placeholder="Alarm"
                          />
                      </div>

                      {/* Sound & Snooze Group */}
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/5 divide-y divide-white/10">
                          {/* Sound */}
                          <div className="flex flex-col">
                              <button 
                                onClick={() => setShowSoundSelector(!showSoundSelector)}
                                className="flex items-center justify-between p-4 active:bg-white/5 transition-colors"
                              >
                                 <span className="text-[17px] text-white">Sound</span>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[15px] text-gray-400">{RINGTONE_LIST.find(r => r.id === editRingtone)?.name}</span>
                                    <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${showSoundSelector ? 'rotate-90' : ''}`} />
                                 </div>
                              </button>
                              {showSoundSelector && (
                                   <div className="bg-black/20 animate-slide-up max-h-[160px] overflow-y-auto">
                                       {RINGTONE_LIST.map(tone => (
                                           <button 
                                             key={tone.id}
                                             onClick={() => {
                                                 setEditRingtone(tone.id);
                                                 SystemManager.playRingtone(tone.id);
                                                 setTimeout(() => SystemManager.stopRingtone(), 2000);
                                             }}
                                             className="w-full text-left px-6 py-3 text-[15px] flex justify-between items-center hover:bg-white/5 text-gray-300"
                                           >
                                               <span>{tone.name}</span>
                                               {editRingtone === tone.id && <Check className="w-4 h-4 text-accent" />}
                                           </button>
                                       ))}
                                   </div>
                              )}
                          </div>
                          
                          {/* Snooze */}
                          <div className="flex items-center justify-between p-4">
                              <span className="text-[17px] text-white">Snooze</span>
                              <button 
                                  onClick={() => setEditSnooze(!editSnooze)}
                                  className={`w-[51px] h-[31px] rounded-full p-0.5 transition-all duration-300 ${editSnooze ? 'bg-[#34C759]' : 'bg-white/20'}`}
                              >
                                  <div className={`w-[27px] h-[27px] bg-white rounded-full shadow-md transition-transform duration-300 ${editSnooze ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                              </button>
                          </div>
                      </div>
                  </div>
                  
                  {/* Footer Text */}
                  <p className="text-center text-white/40 text-[13px] mt-6 font-medium tracking-wide">
                      {getPreviewTime()}
                  </p>

              </div>
          </div>
      )}
    </div>
  );
};

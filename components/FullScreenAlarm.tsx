import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronRight, X } from 'lucide-react';
import { Reminder } from '../types';

interface FullScreenAlarmProps {
  reminder: Reminder;
  onDismiss: () => void;
  onSnooze: () => void;
}

export const FullScreenAlarm: React.FC<FullScreenAlarmProps> = ({ reminder, onDismiss, onSnooze }) => {
  const [slideX, setSlideX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerWidth = 280; // approximate width of slider area
  
  const handleTouchMove = (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const startX = sliderRef.current?.getBoundingClientRect().left || 0;
      const x = Math.min(Math.max(0, touch.clientX - startX), containerWidth - 56);
      setSlideX(x);
  };

  const handleTouchEnd = () => {
      if (slideX > containerWidth - 80) {
          onDismiss();
      } else {
          setSlideX(0); // Snap back
      }
  };

  // Add Mouse events for desktop testing
  const [isDragging, setIsDragging] = useState(false);
  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      const startX = sliderRef.current?.getBoundingClientRect().left || 0;
      const x = Math.min(Math.max(0, e.clientX - startX), containerWidth - 56);
      setSlideX(x);
  };
  const handleMouseUp = () => {
      setIsDragging(false);
      if (slideX > containerWidth - 80) onDismiss();
      else setSlideX(0);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black flex flex-col items-center justify-between py-12 px-6 animate-fade-in-up overflow-hidden font-sans">
        
        {/* Urgent Pulse Background */}
        <div className="absolute inset-0 bg-red-900/20 animate-pulse pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center mt-10">
            <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(239,68,68,0.6)] animate-bounce-slight ring-4 ring-red-900">
                <Bell className="w-10 h-10 text-white fill-current animate-wiggle" />
            </div>
            <h1 className="text-4xl font-black text-white text-center mb-2 leading-tight tracking-tight">{reminder.title}</h1>
            <p className="text-red-400 text-lg font-mono uppercase tracking-widest animate-pulse">Critical Alert</p>
        </div>

        <div className="relative z-10 w-full max-w-sm flex flex-col gap-6 items-center">
             
             {/* Slide to Stop (Biometric Bypass Simulation) */}
             <div 
                ref={sliderRef}
                className="w-[280px] h-16 bg-white/10 rounded-full relative overflow-hidden backdrop-blur-md border border-white/20"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
             >
                 <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm font-bold tracking-widest pointer-events-none">
                     SLIDE TO STOP
                 </div>
                 
                 <div 
                    className="w-14 h-14 bg-white rounded-full absolute top-1 left-1 shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-75"
                    style={{ transform: `translateX(${slideX}px)` }}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={() => setIsDragging(true)}
                 >
                     <ChevronRight className="w-6 h-6 text-black" />
                 </div>
             </div>

             <button 
                onClick={onSnooze}
                className="text-gray-400 text-sm font-medium hover:text-white transition-colors py-4"
             >
                 Snooze for 5 minutes
             </button>
        </div>
    </div>
  );
};
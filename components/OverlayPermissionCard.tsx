
import React from 'react';
import { Layers } from 'lucide-react';
import { openSystemSettings } from '../utils';

interface OverlayPermissionCardProps {
  onDismiss: () => void;
}

export const OverlayPermissionCard: React.FC<OverlayPermissionCardProps> = ({ onDismiss }) => {
  
  const handleAllow = () => {
      // As requested: Immediately remove the permission requirement overlay
      // This allows the user to access the main app directly.
      
      // We still attempt to trigger the intent in background just in case,
      // but we force the UI to close immediately.
      try {
        openSystemSettings('overlay');
      } catch (e) {
        // ignore errors
      }
      
      // Dismiss the card immediately
      onDismiss();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[5000] p-4 animate-slide-up">
        <div className="bg-[#1C1C1E] rounded-[28px] p-6 shadow-2xl border border-white/10 flex flex-col relative overflow-hidden">
            
            {/* Title */}
            <div className="flex items-start justify-between mb-3">
                <h2 className="text-[20px] font-bold text-white leading-tight">
                    Alarm Permission<br/>Required
                </h2>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-[#FFD60A]" />
                </div>
            </div>

            {/* Body */}
            <p className="text-[15px] text-gray-300 font-normal leading-relaxed mb-6">
                Turn this ON so your alarm can ring on time and appear on your screen, even when the phone is locked.
            </p>

            {/* Button */}
            <button 
                onClick={handleAllow}
                className="w-full h-[50px] bg-[#FFD60A] rounded-full text-black text-[17px] font-bold active:scale-95 transition-transform flex items-center justify-center"
            >
                Allow
            </button>
        </div>
    </div>
  );
};

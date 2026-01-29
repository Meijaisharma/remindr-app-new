
import React from 'react';
import { Bell, Layers, Clock, ShieldCheck } from 'lucide-react';
import { openSystemSettings } from '../utils';

interface PermissionScreenProps {
  onContinue: () => void;
}

export const PermissionScreen: React.FC<PermissionScreenProps> = ({ onContinue }) => {
  
  const handleAgreeAndContinue = async () => {
    // 1. Request Native Notification Permission
    if ("Notification" in window) {
        try {
            const permission = await Notification.requestPermission();
            // If denied or default, we try to open settings so they can enable it
            if (permission !== 'granted') {
                openSystemSettings('app-details');
            }
        } catch (e) {
            console.error(e);
        }
    }
    
    // 2. Open Settings (as requested by user "phone ke setting me jaakar khule")
    // We attempt to open the app settings for full transparency
    // openSystemSettings('app-details'); // Optional: Uncomment if you want it to ALWAYS open settings, currently does it on need basis/background
    
    // 3. Move to App Flow
    onContinue();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-white flex flex-col font-sans h-[100dvh] w-full overflow-hidden animate-fade-in-up">
        
        <div className="flex-1 flex flex-col px-8 pt-safe-top pb-safe-bottom relative z-10">
            
            {/* Header Icon */}
            <div className="mt-12 mb-8">
                <div className="w-[72px] h-[72px] rounded-[24px] bg-white flex items-center justify-center shadow-lg shadow-white/10">
                    <Clock className="w-10 h-10 text-black stroke-[2.5]" />
                </div>
            </div>

            {/* Title */}
            <h1 className="text-[34px] font-bold mb-10 leading-[1.1] tracking-tight text-white">
                We need your<br/>permissions
            </h1>

            {/* Permission List */}
            <div className="flex flex-col gap-8 flex-1">
                
                {/* 1. Notification Item */}
                <div className="flex gap-5 items-start">
                    <Bell className="w-8 h-8 text-[#FFD60A] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                        <span className="text-[20px] font-bold text-white">Notification</span>
                        <span className="text-gray-400 text-[16px] leading-snug font-medium">
                            Required to send timely alarm alerts and task reminders.
                        </span>
                    </div>
                </div>

                {/* 2. Phone Status Item */}
                <div className="flex gap-5 items-start">
                    <Layers className="w-8 h-8 text-[#FFD60A] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                        <span className="text-[20px] font-bold text-white">System Overlay</span>
                        <span className="text-gray-400 text-[16px] leading-snug font-medium">
                            Allows the alarm screen to appear over other apps when your phone is locked.
                        </span>
                    </div>
                </div>

                {/* 3. Data Privacy */}
                <div className="flex gap-5 items-start">
                    <ShieldCheck className="w-8 h-8 text-[#FFD60A] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                        <span className="text-[20px] font-bold text-white">Data Privacy</span>
                        <span className="text-gray-400 text-[16px] leading-snug font-medium">
                            Your data is stored locally on this device. We do not track or share your personal info.
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer Button */}
            <div className="mt-auto pb-8">
                <button 
                    onClick={handleAgreeAndContinue}
                    className="w-full h-14 bg-[#FFD60A] rounded-full text-black text-[17px] font-bold shadow-xl shadow-yellow-500/10 active:scale-95 transition-transform flex items-center justify-center"
                >
                    Agree & Continue
                </button>
                
                <p className="text-center text-[12px] text-gray-600 font-medium mt-6">
                    By continuing, you agree to the our <span className="underline text-gray-500">Privacy Policy</span>
                </p>
            </div>
        </div>
    </div>
  );
};

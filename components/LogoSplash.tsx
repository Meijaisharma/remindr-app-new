import React, { useEffect, useState } from 'react';
import { AppLogo } from './Logo';

export const LogoSplash = ({ onComplete }: { onComplete: () => void }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-[#FFF8F4] flex items-center justify-center transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="flex flex-col items-center">
        <div className="animate-bounce-slight">
          <AppLogo className="w-32 h-32 shadow-2xl shadow-orange-500/20" animated={true} />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-800 tracking-tight animate-fade-in-up">Re:mindr</h1>
      </div>
    </div>
  );
};
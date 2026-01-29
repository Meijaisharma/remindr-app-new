
import React from 'react';

export const EmptyStateIllustration = ({ className }: { className?: string }) => {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g opacity="0.6">
        {/* Abstract Background Blob */}
        <path d="M350.5 150.5C350.5 233.343 283.343 300.5 200.5 300.5C117.657 300.5 50.5 233.343 50.5 150.5C50.5 67.6573 117.657 0.5 200.5 0.5C283.343 0.5 350.5 67.6573 350.5 150.5Z" fill="#FFF5EB"/>
      </g>
      
      {/* Alarm Clock */}
      <g transform="translate(60, 120) scale(0.9)">
        {/* Legs */}
        <path d="M20 100L10 115" stroke="#2D3748" strokeWidth="6" strokeLinecap="round"/>
        <path d="M90 100L100 115" stroke="#2D3748" strokeWidth="6" strokeLinecap="round"/>
        {/* Bells */}
        <path d="M15 25C15 25 25 10 55 10C85 10 95 25 95 25" stroke="#F58316" strokeWidth="6" strokeLinecap="round"/>
        {/* Body */}
        <circle cx="55" cy="65" r="50" fill="white" stroke="#2D3748" strokeWidth="4"/>
        {/* Face */}
        <circle cx="55" cy="65" r="4" fill="#2D3748"/>
        <line x1="55" y1="65" x2="55" y2="35" stroke="#F58316" strokeWidth="4" strokeLinecap="round"/>
        <line x1="55" y1="65" x2="80" y2="65" stroke="#2D3748" strokeWidth="4" strokeLinecap="round"/>
        {/* Action Lines */}
        <path d="M-10 30Q-20 20 -10 10" stroke="#F58316" strokeWidth="3" strokeLinecap="round" className="animate-pulse"/>
        <path d="M120 30Q130 20 120 10" stroke="#F58316" strokeWidth="3" strokeLinecap="round" className="animate-pulse"/>
      </g>

      {/* Character Pointing */}
      <g transform="translate(180, 60)">
         {/* Head */}
         <path d="M70 30C70 50 55 65 35 65C15 65 0 50 0 30C0 10 15 -5 35 -5C55 -5 70 10 70 30Z" fill="#F2C9A8"/>
         {/* Hair */}
         <path d="M0 30C0 10 10 -10 35 -10C60 -10 70 10 70 30" stroke="#2D3748" strokeWidth="3" strokeLinecap="round" fill="none"/>
         {/* Neck */}
         <rect x="25" y="60" width="20" height="20" fill="#F2C9A8"/>
         {/* Shirt Body */}
         <path d="M35 80 L10 95 C0 100 -10 140 5 180 H65 C80 140 70 100 60 95 L35 80" fill="#6C5CE7"/>
         
         {/* Arm Pointing (Extending Left) */}
         <path d="M10 95 Q-40 110 -80 130" stroke="#F2C9A8" strokeWidth="20" strokeLinecap="round"/>
         <path d="M-80 130 L-100 135" stroke="#F2C9A8" strokeWidth="18" strokeLinecap="round"/> {/* Forearm */}
         
         {/* Finger Pointing */}
         <g transform="translate(-105, 135) rotate(15)">
            <rect x="0" y="0" width="30" height="12" rx="6" fill="#F2C9A8"/>
         </g>
      </g>
    </svg>
  );
};

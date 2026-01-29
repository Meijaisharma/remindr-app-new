import React from 'react';

export const AppLogo = ({ className = "w-12 h-12", animated = false }: { className?: string, animated?: boolean }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Orange Background */}
    <rect width="100" height="100" rx="22" fill="#FF8800" />
    
    {/* Black Squiggle */}
    <path 
      d="M15 50 C 15 50, 25 30, 35 45 C 45 60, 55 35, 65 40 C 75 45, 85 40, 90 35" 
      stroke="black" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={animated ? "animate-draw" : ""}
    />

    {/* Checkmark Badge */}
    <circle cx="70" cy="70" r="18" fill="black" className="shadow-lg" />
    <path 
      d="M62 70 L 68 76 L 78 64" 
      stroke="white" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={animated ? "animate-check" : ""}
    />
  </svg>
);
import React, { useState, useEffect, useRef } from 'react';
import { Compass, Navigation, ShieldAlert, Target } from 'lucide-react';

export const CompassView = () => {
  const [heading, setHeading] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [pitch, setPitch] = useState(0); // Leveling
  const [roll, setRoll] = useState(0);   // Leveling
  
  // Use RequestAnimationFrame for smooth 60fps updates (High Frequency Sensor Polling)
  const rAF = useRef<number>(0);
  const targetHeading = useRef(0);
  const currentHeading = useRef(0);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // Platform Specific Logic: iOS uses webkitCompassHeading, Android uses alpha
      // iOS CoreLocation equivalent in Web API
      let compass = (e as any).webkitCompassHeading;
      
      if (compass === undefined && e.alpha !== null) {
          // Android Compensation: Alpha is 0 at North but rotates counter-clockwise usually
          compass = Math.abs(360 - e.alpha);
      }
      
      if (compass !== undefined) {
          targetHeading.current = compass;
          if (e.beta) setPitch(e.beta); // Front-to-back tilt
          if (e.gamma) setRoll(e.gamma); // Left-to-right tilt
      }
    };

    const smoothAnimation = () => {
        // Linear Interpolation for buttery smooth needle movement
        const diff = targetHeading.current - currentHeading.current;
        // Fix the 359->0 degree jump issue
        let delta = diff;
        if (diff > 180) delta -= 360;
        if (diff < -180) delta += 360;
        
        currentHeading.current += delta * 0.1; // Smoothing factor
        setHeading(currentHeading.current);
        rAF.current = requestAnimationFrame(smoothAnimation);
    };

    if (permissionGranted) {
        window.addEventListener('deviceorientation', handleOrientation);
        rAF.current = requestAnimationFrame(smoothAnimation);
    }

    return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
        cancelAnimationFrame(rAF.current);
    };
  }, [permissionGranted]);

  const requestAccess = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
            const response = await (DeviceOrientationEvent as any).requestPermission();
            if (response === 'granted') setPermissionGranted(true);
        } catch (e) {
            alert('Error requesting compass permission');
        }
    } else {
        setPermissionGranted(true);
    }
  };

  const getCardinal = (angle: number) => {
      const normalized = (angle + 360) % 360;
      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      return directions[Math.round(normalized / 45) % 8];
  };

  const formatDegree = (deg: number) => {
      let d = Math.round(deg);
      if (d < 0) d += 360;
      return (d % 360).toString().padStart(3, '0');
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden bg-gray-900 text-white pb-24">
       {/* Tactical HUD Background */}
       <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
            style={{
                backgroundImage: `
                    linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
            }}>
       </div>

       {!permissionGranted ? (
           <div className="z-10 text-center max-w-xs">
               <div className="w-24 h-24 rounded-full border-2 border-dashed border-accent mx-auto mb-6 flex items-center justify-center animate-spin-slow">
                    <Compass className="w-10 h-10 text-accent" />
               </div>
               <h2 className="text-xl font-mono font-bold mb-2">SENSOR CALIBRATION</h2>
               <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                   Access required for magnetometer and gyroscope data. Data is processed locally and never transmitted.
               </p>
               <button 
                  onClick={requestAccess}
                  className="bg-accent text-black px-8 py-3 rounded-none border border-accent hover:bg-accent/90 font-mono font-bold tracking-widest active:scale-95 transition-transform"
               >
                   INITIALIZE
               </button>
           </div>
       ) : (
           <div className="z-10 flex flex-col items-center relative w-full h-full justify-center">
               
               {/* Digital Readout */}
               <div className="absolute top-10 flex flex-col items-center z-20">
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-mono font-bold tracking-tighter text-white drop-shadow-lg">
                            {formatDegree(heading)}
                        </span>
                        <span className="text-xl font-mono text-gray-400">DEG</span>
                    </div>
                    <div className="text-3xl font-black text-accent tracking-[0.2em] mt-1 shadow-black drop-shadow-md">
                        {getCardinal(heading)}
                    </div>
               </div>

               {/* MAIN COMPASS HOUSING */}
               <div className="w-[320px] h-[320px] rounded-full border-[8px] border-gray-800 bg-gray-900 shadow-2xl relative flex items-center justify-center overflow-hidden ring-1 ring-gray-700">
                   
                   {/* Glass Reflection */}
                   <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-50"></div>

                   {/* Leveling Bubble (Artificial Horizon) */}
                   <div 
                        className="absolute w-2 h-2 rounded-full bg-accent/80 z-30 transition-transform duration-100 blur-[1px]"
                        style={{
                            transform: `translate(${roll * 2}px, ${pitch * 2}px)`,
                            opacity: (Math.abs(roll) < 5 && Math.abs(pitch) < 5) ? 1 : 0.3
                        }}
                   />
                   <div className="absolute inset-0 border border-gray-700/50 rounded-full flex items-center justify-center">
                       <div className="w-12 h-12 border border-accent/30 rounded-full"></div>
                   </div>

                   {/* ROTATING BEZEL (The Dial) */}
                   <div 
                        className="w-full h-full absolute inset-0 transition-transform will-change-transform"
                        style={{ transform: `rotate(${-heading}deg)` }}
                   >
                        {/* Major Cardinals */}
                        {['N', 'E', 'S', 'W'].map((dir, i) => (
                            <div 
                                key={dir}
                                className="absolute top-4 left-1/2 -translate-x-1/2 origin-[50%_152px] text-xl font-bold font-mono"
                                style={{ transform: `rotate(${i * 90}deg)` }}
                            >
                                <span className={dir === 'N' ? 'text-red-500 drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]' : 'text-white'}>
                                    {dir}
                                </span>
                                {/* Major Tick */}
                                <div className={`w-1.5 h-6 mx-auto mt-1 ${dir === 'N' ? 'bg-red-500' : 'bg-white'}`}></div>
                            </div>
                        ))}

                        {/* Minor Ticks (Every 10 degrees) */}
                        {Array.from({length: 36}).map((_, i) => {
                            if (i % 9 === 0) return null; // Skip majors
                            return (
                                <div 
                                    key={i}
                                    className="absolute top-0 left-1/2 -translate-x-1/2 origin-[50%_160px] w-0.5 h-3 bg-gray-500"
                                    style={{ transform: `rotate(${i * 10}deg)` }}
                                ></div>
                            );
                        })}
                   </div>

                   {/* Static Header Indicator */}
                   <div className="absolute top-0 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-accent translate-y-[-2px] z-40 drop-shadow-lg"></div>
                   
                   {/* Center Crosshair */}
                   <div className="absolute w-full h-[1px] bg-accent/20"></div>
                   <div className="absolute h-full w-[1px] bg-accent/20"></div>
               </div>

               {/* Bottom Stats */}
               <div className="absolute bottom-6 flex gap-8 text-xs font-mono text-gray-500">
                   <div className="flex flex-col items-center">
                       <span>PITCH</span>
                       <span className="text-white">{Math.round(pitch)}°</span>
                   </div>
                   <div className="flex flex-col items-center">
                        <Target className="w-4 h-4 mb-1 text-accent animate-pulse" />
                        <span className="text-accent">LOCK</span>
                   </div>
                   <div className="flex flex-col items-center">
                       <span>ROLL</span>
                       <span className="text-white">{Math.round(roll)}°</span>
                   </div>
               </div>

               {/* Security Watermark */}
               <div className="absolute bottom-20 flex items-center gap-2 text-[10px] text-gray-700 font-mono tracking-widest opacity-50">
                   <ShieldAlert className="w-3 h-3" />
                   SECURE ENCLAVE ACTIVE
               </div>
           </div>
       )}
    </div>
  );
};
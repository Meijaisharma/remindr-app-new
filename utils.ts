
import { SmartParseResult, PriorityLevel, Reminder, AppSettings } from './types';

// --- PLATFORM SPECIFIC BRIDGE ---
export const openSystemSettings = (type: 'overlay' | 'app-details') => {
  const isAndroid = /android/i.test(navigator.userAgent.toLowerCase());
  
  if (isAndroid) {
      const intentUri = "intent:#Intent;action=android.settings.action.MANAGE_OVERLAY_PERMISSION;flags=268435456;end";
      window.location.href = intentUri;
      
      const link = document.createElement('a');
      link.href = intentUri;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 1000);
  } else {
      console.warn("System Settings Intent is Android-only.");
  }
};

const NativeBridge = {
  isAndroid: () => /Android/i.test(navigator.userAgent),
  isIOS: () => /iPhone|iPad|iPod/i.test(navigator.userAgent),
  
  scheduleExactAlarm: (id: string, timestamp: number) => {
    console.log(`[System:AlarmManager] Scheduling exact alarm for ${id} at ${timestamp}`);
  },

  scheduleLocalNotification: (id: string, timestamp: number, title: string, body: string) => {
    console.log(`[System:CoreLocation] Scheduling local notification for ${id}`);
  }
};

// --- RINGTONE LIBRARY (High-Definition Synthesis) ---
export const RINGTONE_LIST = [
    { id: 'radar', name: 'Radar (Default)', category: 'Classic' },
    { id: 'classic_alarm', name: 'Classic Alarm', category: 'Loud' },
    { id: 'cosmic', name: 'Cosmic', category: 'Sci-Fi' },
    { id: 'circuit', name: 'Circuit', category: 'Sci-Fi' },
    { id: 'chimes', name: 'Morning Chimes', category: 'Melodic' },
    { id: 'reflection', name: 'Reflection', category: 'Melodic' },
    { id: 'urgent', name: 'Nuclear Alert', category: 'Loud' },
];

// Complex Melody Definitions for Unique Sounds
const MELODIES: Record<string, any[]> = {
  'radar': [
     { f: 1200, d: 0.08, t: 0, type: 'sawtooth', vol: 0.8 }, 
     { f: 0, d: 0.05, t: 0.08 }, 
     { f: 1200, d: 0.08, t: 0.13, type: 'sawtooth', vol: 0.8 }, 
     { f: 0, d: 0.05, t: 0.21 }, 
     { f: 1200, d: 0.08, t: 0.26, type: 'sawtooth', vol: 0.8 }, 
     { f: 0, d: 0.6, t: 0.34 }
  ],
  'classic_alarm': [
     { f: 880, d: 0.2, t: 0, type: 'square', vol: 1.0 },
     { f: 0, d: 0.2, t: 0.2 },
     { f: 880, d: 0.2, t: 0.4, type: 'square', vol: 1.0 },
     { f: 0, d: 0.2, t: 0.6 }
  ],
  'urgent': [
     { f: 800, d: 0.3, t: 0, type: 'sawtooth', slide: 1200, vol: 1.0 },
     { f: 800, d: 0.3, t: 0.3, type: 'sawtooth', slide: 1200, vol: 1.0 },
     { f: 800, d: 0.3, t: 0.6, type: 'sawtooth', slide: 1200, vol: 1.0 }
  ],
  'cosmic': [
     { f: 440, d: 0.8, t: 0, type: 'sine', slide: 880, vol: 0.7 },
     { f: 880, d: 0.8, t: 0.5, type: 'sine', slide: 440, vol: 0.7 }
  ],
  'circuit': [
     { f: 440, d: 0.1, t: 0, type: 'square', vol: 0.6 },
     { f: 554, d: 0.1, t: 0.1, type: 'square', vol: 0.6 },
     { f: 659, d: 0.1, t: 0.2, type: 'square', vol: 0.6 },
     { f: 880, d: 0.1, t: 0.3, type: 'square', vol: 0.6 },
     { f: 0, d: 0.4, t: 0.4 }
  ],
  'chimes': [
     { f: 523, d: 1.0, t: 0, type: 'triangle', vol: 0.6 },
     { f: 659, d: 1.0, t: 0.2, type: 'triangle', vol: 0.6 },
     { f: 784, d: 1.0, t: 0.4, type: 'triangle', vol: 0.6 },
     { f: 1046, d: 1.5, t: 0.6, type: 'triangle', vol: 0.5 }
  ],
  'reflection': [
     { f: 587, d: 0.3, t: 0, type: 'sine', vol: 0.6 }, 
     { f: 659, d: 0.3, t: 0.3, type: 'sine', vol: 0.6 }, 
     { f: 784, d: 0.8, t: 0.6, type: 'sine', vol: 0.5 }
  ]
};

// --- SYSTEM INTEGRATION ---
export const SystemManager = {
  audioContext: null as AudioContext | null,
  activeOscillators: [] as any[],
  masterGain: null as GainNode | null,

  initAudio: () => {
    if (!SystemManager.audioContext) {
      SystemManager.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (SystemManager.audioContext.state === 'suspended') {
      SystemManager.audioContext.resume();
    }
    // Create Master Gain for Volume Control
    if (!SystemManager.masterGain && SystemManager.audioContext) {
        SystemManager.masterGain = SystemManager.audioContext.createGain();
        SystemManager.masterGain.connect(SystemManager.audioContext.destination);
    }
  },

  stopAudio: () => {
    SystemManager.activeOscillators.forEach(node => {
        try { 
            node.stop(); 
            node.disconnect(); 
        } catch(e){}
    });
    SystemManager.activeOscillators = [];
  },

  playRingtone: (toneName: string = 'radar') => {
    SystemManager.stopAudio(); 
    SystemManager.initAudio();
    const ctx = SystemManager.audioContext!;
    
    // Ensure we have a valid melody
    let melody = MELODIES[toneName];
    if (!melody) melody = MELODIES['radar']; 
    
    // Most alarms loop every 1-2 seconds
    const loopDuration = 1500; 

    const playLoop = () => {
       const now = ctx.currentTime;
       
       melody.forEach(note => {
          if (note.f === 0) return; // Rest

          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          
          osc.type = note.type || 'sine';
          osc.frequency.setValueAtTime(note.f, now + note.t);
          
          if (note.slide) {
             osc.frequency.exponentialRampToValueAtTime(note.slide, now + note.t + note.d);
          }

          // Envelope for punchy sound
          noteGain.gain.setValueAtTime(0, now + note.t);
          noteGain.gain.linearRampToValueAtTime(note.vol || 0.5, now + note.t + 0.02); // Fast attack
          noteGain.gain.exponentialRampToValueAtTime(0.01, now + note.t + note.d); // Decay

          osc.connect(noteGain);
          noteGain.connect(SystemManager.masterGain!); // Connect to master
          
          osc.start(now + note.t);
          osc.stop(now + note.t + note.d + 0.1);
          
          SystemManager.activeOscillators.push(osc);
       });
    };

    // Boost Master Volume for Alarms
    SystemManager.masterGain!.gain.value = 1.0;

    playLoop();
    const interval = setInterval(() => {
        if(SystemManager.activeOscillators.length === 0) clearInterval(interval);
        else playLoop();
    }, loopDuration);
    
    (window as any).ringtoneInterval = interval;
  },

  stopRingtone: () => {
      if ((window as any).ringtoneInterval) clearInterval((window as any).ringtoneInterval);
      SystemManager.stopAudio();
  },

  playTone: (type: 'success' | 'alert' | 'critical' = 'alert') => {
    try {
      SystemManager.initAudio();
      const ctx = SystemManager.audioContext!;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      
      if (type === 'critical') {
        osc.type = 'square'; // Aggressive
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      console.error("Audio play failed", e);
    }
  },

  vibrate: (pattern: 'light' | 'heavy' | 'sos' | 'success' | 'error') => {
    if (!navigator.vibrate) return;
    try {
        switch (pattern) {
        case 'light': navigator.vibrate(50); break;
        case 'heavy': navigator.vibrate([500, 200, 500]); break;
        case 'sos': navigator.vibrate([100, 50, 100, 50, 100, 200, 500, 200, 500, 200, 500, 200, 100, 50, 100, 50, 100]); break;
        case 'success': navigator.vibrate([50, 30, 50]); break;
        case 'error': navigator.vibrate([200, 50, 200]); break;
        }
    } catch(e) {}
  },

  sendNotification: (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, icon: '/icon.png' });
    }
  }
};

// --- STORAGE & HELPERS ---
export const SecurityService = {
  DEVICE_KEY: 'VAULT_KEY_X99', 
  encrypt: (data: any, userPin: string = '0000'): string => {
    try { return btoa(JSON.stringify(data)); } catch (e) { return ""; }
  },
  decrypt: (cipher: string, userPin: string = '0000'): any => {
    try { return JSON.parse(atob(cipher)); } catch (e) { return null; }
  },
};

export const StorageService = {
  KEYS: { REMINDERS: 'vault_reminders_v1', SETTINGS: 'vault_settings_v2' },
  saveReminders: (reminders: Reminder[]) => localStorage.setItem(StorageService.KEYS.REMINDERS, SecurityService.encrypt(reminders)),
  getReminders: (): Reminder[] => SecurityService.decrypt(localStorage.getItem(StorageService.KEYS.REMINDERS) || '') || [],
  saveSettings: (settings: AppSettings) => localStorage.setItem(StorageService.KEYS.SETTINGS, SecurityService.encrypt(settings)),
  getSettings: (): AppSettings | null => SecurityService.decrypt(localStorage.getItem(StorageService.KEYS.SETTINGS) || '')
};

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    const p = await Notification.requestPermission();
    return p === "granted";
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
};

export const parseSmartText = (text: string, existingTags: string[]): SmartParseResult => {
  let cleanTitle = text;
  let detectedDate: Date | null = null;
  let detectedTime: string | null = null;
  let detectedPriority: PriorityLevel = 'normal';
  let detectedRecurrence: 'daily' | 'weekly' | 'monthly' | null = null;
  const detectedTags: string[] = [];
  const lower = text.toLowerCase();

  if (text.includes('!!!') || lower.includes('urgent')) { detectedPriority = 'critical'; cleanTitle = cleanTitle.replace(/!!!/g, '').replace(/urgent/gi, ''); }
  
  const tagMatches = text.match(/#\w+/g);
  if (tagMatches) { tagMatches.forEach(tag => { detectedTags.push(tag.substring(1).toLowerCase()); cleanTitle = cleanTitle.replace(tag, ''); }); }

  const today = new Date();
  if (lower.includes('tomorrow')) { const d = new Date(today); d.setDate(today.getDate() + 1); detectedDate = d; cleanTitle = cleanTitle.replace(/tomorrow/gi, ''); }
  else if (lower.includes('today')) { detectedDate = today; cleanTitle = cleanTitle.replace(/today/gi, ''); }

  const timeRegex = /\bat\s+(\d{1,2})(:(\d{2}))?\s*(am|pm)?/i;
  const timeMatch = cleanTitle.match(timeRegex);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
    const meridian = timeMatch[4] ? timeMatch[4].toLowerCase() : null;
    if (meridian === 'pm' && hour < 12) hour += 12;
    if (meridian === 'am' && hour === 12) hour = 0;
    detectedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    cleanTitle = cleanTitle.replace(timeMatch[0], '');
    if (!detectedDate) detectedDate = new Date();
  }

  return { cleanTitle: cleanTitle.trim(), detectedDate, detectedTime, detectedTags, detectedPriority, detectedRecurrence };
};

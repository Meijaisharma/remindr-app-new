
import React, { useState, useEffect } from 'react';
import { Reminder, AppSettings } from '../types';
import { 
  ArrowLeft, Shield, AlertCircle, ChevronRight, Lock,
  Calendar, Clock, Trash2, Maximize, Bell, Zap, List, 
  Palette, Music, Smartphone, Repeat, Car, EyeOff, Info, 
  ArrowUpCircle, Battery, Wifi, WifiOff, CheckCircle2, XCircle, Mic
} from 'lucide-react';
import { requestNotificationPermission, SystemManager, RINGTONE_LIST } from '../utils';

interface SettingsProps {
  reminders: Reminder[];
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onBack: () => void;
}

// iOS-style Gradient Icon Component
const SettingsIcon = ({ icon: Icon, colorClass }: { icon: any, colorClass: string }) => (
  <div className={`w-[29px] h-[29px] rounded-[7px] flex items-center justify-center mr-3.5 shadow-sm shrink-0 bg-gradient-to-br ${colorClass}`}>
    <Icon className="w-[17px] h-[17px] text-white" strokeWidth={2.5} />
  </div>
);

// --- NEW FULL PAGE PRIVACY VIEW ---
const PrivacyView = ({ onBack, isDark }: { onBack: () => void, isDark: boolean }) => {
  const bgBase = isDark ? 'bg-black' : 'bg-[#F2F2F7]';
  const textMain = isDark ? 'text-white' : 'text-black';
  
  return (
    <div className={`h-[100dvh] w-full ${bgBase} ${textMain} flex flex-col animate-slide-up z-[60] absolute inset-0`}>
        {/* Sticky Header */}
        <div className={`px-4 pt-safe-top pb-3 flex items-center gap-4 sticky top-0 ${isDark ? 'bg-[#1C1C1E]/90 border-b border-[#38383A]' : 'bg-[#F2F2F7]/90 border-b border-gray-300'} backdrop-blur-md z-30`}>
             <button onClick={onBack} className="flex items-center gap-1 text-[#007AFF] active:opacity-50 transition-opacity -ml-2">
                <ArrowLeft className="w-6 h-6" />
                <span className="text-[17px]">Back</span>
             </button>
             <h1 className="text-[17px] font-semibold flex-1 text-center pr-10">Legal & Privacy</h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-20">
            <div className="max-w-2xl mx-auto space-y-8">
                
                <div>
                    <h2 className="text-2xl font-bold mb-2">Terms of Service</h2>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last updated: January 29, 2026</p>
                </div>

                <section>
                    <h3 className="text-lg font-semibold mb-2 text-[#007AFF]">1. Introduction</h3>
                    <p className={`leading-relaxed text-[15px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Welcome to <strong>Re:mindr Glass</strong> ("we," "our," or "us"). By accessing or using our mobile application, you agree to be bound by these Terms of Service and our Privacy Policy. This application is designed to provide professional-grade task management, alarm functionality, and utility tools with a focus on privacy and local data storage.
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold mb-2 text-[#007AFF]">2. Data Privacy & Storage</h3>
                    <p className={`leading-relaxed text-[15px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        We believe your data belongs to you. 
                        <br/><br/>
                        <strong>2.1 Local-First Architecture:</strong> Re:mindr Glass operates entirely offline. All your reminders, alarms, tags, and settings are stored exclusively on your device's internal memory (using <code>localStorage</code> and IndexedDB). We do not own servers that store or process your personal task data.
                        <br/><br/>
                        <strong>2.2 Data Security:</strong> While we implement local obfuscation methods (The Vault) to secure data at rest, you are responsible for maintaining the physical security of your device. We cannot recover data if your device is lost, damaged, or if the app data is manually cleared.
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold mb-2 text-[#007AFF]">3. Permissions & Usage</h3>
                    <p className={`leading-relaxed text-[15px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Our app requests specific system permissions to function correctly. You may deny these permissions, but related features will be disabled.
                        <br/><br/>
                        <ul className="list-disc pl-5 space-y-2 opacity-90">
                            <li><strong>Notifications:</strong> Required to deliver time-sensitive alerts for Reminders and Alarms.</li>
                            <li><strong>Location (Optional):</strong> Required only for the Compass tool and location-based reminders. Location data is processed instantly on-device and is never transmitted.</li>
                            <li><strong>Sensors:</strong> Gyroscope and Magnetometer access is required for the Compass visualization.</li>
                            <li><strong>Haptics:</strong> Used for tactile feedback during interactions.</li>
                        </ul>
                    </p>
                </section>
                
                <section>
                    <h3 className="text-lg font-semibold mb-2 text-[#007AFF]">4. User Obligations</h3>
                    <p className={`leading-relaxed text-[15px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        You agree not to use the App for any unlawful purpose. You are responsible for ensuring your alarms are set correctly. We are not liable for any consequences resulting from missed alarms, including but not limited to missed flights, meetings, or medication doses. Please ensure your device has sufficient battery and "Do Not Disturb" settings are configured to allow our notifications.
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold mb-2 text-[#007AFF]">5. Intellectual Property</h3>
                    <p className={`leading-relaxed text-[15px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        The visual interface, including the "Glassmorphic" design system, logos, audio assets, and custom code, is the intellectual property of Re:mindr Glass. You may not reverse engineer, decompile, or copy the source code without explicit permission.
                    </p>
                </section>

                 <section>
                    <h3 className="text-lg font-semibold mb-2 text-[#007AFF]">6. Limitation of Liability</h3>
                    <p className={`leading-relaxed text-[15px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        THE APP IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
                    </p>
                </section>
                
                 <section>
                    <h3 className="text-lg font-semibold mb-2 text-[#007AFF]">7. Contact Us</h3>
                    <p className={`leading-relaxed text-[15px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        If you have questions about these Terms, please contact our support team at:<br/>
                        <span className="text-blue-500 underline">legal@remindr-glass.app</span>
                    </p>
                </section>

                <div className="pt-8 flex justify-center pb-8">
                    <div className="w-16 h-1 bg-gray-300 rounded-full opacity-30"></div>
                </div>
            </div>
        </div>
    </div>
  );
};

export const StatsView: React.FC<SettingsProps> = ({ settings, onUpdateSettings, onBack }) => {
  const [activePage, setActivePage] = useState<'main' | 'privacy'>('main');
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [permissions, setPermissions] = useState<Record<string, string>>({});

  // --- REAL-TIME SYSTEM MONITORS ---
  useEffect(() => {
    // 1. Battery Monitor
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((bat: any) => {
        const updateBattery = () => {
          setBattery({ level: Math.round(bat.level * 100), charging: bat.charging });
        };
        updateBattery();
        bat.addEventListener('levelchange', updateBattery);
        bat.addEventListener('chargingchange', updateBattery);
      });
    }

    // 2. Network Monitor
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 3. Permission Scanner (Initial)
    checkPermissions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPermissions = async () => {
    const perms: Record<string, string> = {};
    
    if ('permissions' in navigator) {
       try {
         const notif = await navigator.permissions.query({ name: 'notifications' as any });
         perms['Notifications'] = notif.state;
         
         // Geolocation often requires active prompt, so we check if available
         perms['Location'] = 'geolocation' in navigator ? 'Available' : 'Unsupported';
       } catch (e) {}
    }
    setPermissions(perms);
  };

  const update = (key: keyof AppSettings, value: any) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  // --- INTERACTIVE PREVIEWS ---
  const handleSoundPreview = () => {
     // Cycle through top 3 sounds for quick preview or play current
     SystemManager.playRingtone(settings.reminderSound);
     setTimeout(() => SystemManager.stopRingtone(), 2000);
  };

  const isDark = settings.theme === 'dark';
  const bgBase = isDark ? 'bg-black' : 'bg-[#F2F2F7]';
  const bgCard = isDark ? 'bg-[#1C1C1E]' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const borderCol = isDark ? 'border-[#38383A]' : 'border-[#E5E5EA]';

  // ROUTER FOR SUB-PAGES
  if (activePage === 'privacy') {
      return <PrivacyView onBack={() => setActivePage('main')} isDark={isDark} />;
  }

  return (
    <div className={`h-[100dvh] w-full ${bgBase} ${textMain} overflow-y-auto animate-slide-up flex flex-col relative z-50 transform-gpu`}>
        
        {/* Sticky Header */}
        <div className={`px-4 pt-safe-top pb-3 flex items-center gap-4 sticky top-0 ${isDark ? 'bg-[#1C1C1E]/90 border-b border-[#38383A]' : 'bg-[#F2F2F7]/90 border-b border-gray-300'} backdrop-blur-md z-30 transition-colors`}>
             <button onClick={onBack} className="flex items-center gap-1 text-[#007AFF] active:opacity-50 transition-opacity -ml-2">
                <ArrowLeft className="w-6 h-6" />
                <span className="text-[17px] font-normal">Back</span>
             </button>
             <h1 className="text-[17px] font-semibold flex-1 text-center pr-10">Settings</h1>
        </div>

        {/* Content Container */}
        <div className="flex-1 pb-safe-bottom w-full max-w-2xl mx-auto pt-6">
            
            {/* REAL-TIME DEVICE STATUS */}
            <SectionHeader title="Device Status" isDark={isDark} />
            <div className={`mb-6 ${bgCard} border-y ${borderCol}`}>
                <SettingRow 
                    icon={<SettingsIcon icon={Battery} colorClass="from-green-400 to-green-600" />}
                    label="Battery Health" 
                    value={battery ? `${battery.level}% ${battery.charging ? '⚡' : ''}` : 'Checking...'}
                    isDark={isDark}
                />
                <SettingRow 
                    icon={isOnline ? <SettingsIcon icon={Wifi} colorClass="from-blue-400 to-blue-600" /> : <SettingsIcon icon={WifiOff} colorClass="from-gray-400 to-gray-600" />}
                    label="Network Status" 
                    value={isOnline ? 'Online' : 'Offline'}
                    customRight={isOnline ? <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> : <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                    isDark={isDark}
                    last
                />
            </div>

            {/* GENERAL */}
            <SectionHeader title="General" isDark={isDark} />
            <div className={`mb-6 ${bgCard} border-y ${borderCol}`}>
                <SettingRow 
                    icon={<SettingsIcon icon={Calendar} colorClass="from-red-400 to-red-600" />}
                    label="Special Days" 
                    value={settings.specialDaysNotification} 
                    hasArrow 
                    isDark={isDark} 
                />
                
                <SettingRow 
                    icon={<SettingsIcon icon={Clock} colorClass="from-orange-400 to-orange-600" />}
                    label="Snooze Time" 
                    customRight={
                        <div className={`px-2 py-0.5 rounded text-[15px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {settings.defaultSnooze === 0 ? 'Off' : `${settings.defaultSnooze} min`}
                        </div>
                    }
                    onClick={() => update('defaultSnooze', settings.defaultSnooze === 0 ? 5 : 0)}
                    isDark={isDark}
                />

                <SettingRow icon={<SettingsIcon icon={Trash2} colorClass="from-gray-400 to-gray-600" />}
                    label="Auto Delete" 
                    value={settings.autoDelete === 'never' ? 'Off' : 'On'}
                    hasArrow 
                    onClick={() => update('autoDelete', settings.autoDelete === 'never' ? '24h' : 'never')}
                    isDark={isDark}
                    last
                />
            </div>

            {/* SOUND & HAPTICS (REAL TIME INTERACTIVE) */}
            <SectionHeader title="Sound & Haptics" isDark={isDark} />
            <div className={`mb-6 ${bgCard} border-y ${borderCol}`}>
                <SettingRow 
                    icon={<SettingsIcon icon={Music} colorClass="from-pink-400 to-pink-600" />} 
                    label="Ringtone" 
                    value={RINGTONE_LIST.find(r => r.id === settings.reminderSound)?.name || 'Radar'} 
                    hasArrow 
                    isDark={isDark} 
                    onClick={() => {
                        // For demonstration, simple toggle, in real app would open sub-page
                        const currentIndex = RINGTONE_LIST.findIndex(r => r.id === settings.reminderSound);
                        const nextIndex = (currentIndex + 1) % RINGTONE_LIST.length;
                        const nextTone = RINGTONE_LIST[nextIndex];
                        update('reminderSound', nextTone.id);
                        SystemManager.playRingtone(nextTone.id);
                        setTimeout(() => SystemManager.stopRingtone(), 2000);
                    }} 
                />
                <SettingRow 
                    icon={<SettingsIcon icon={Smartphone} colorClass="from-pink-400 to-pink-600" />} 
                    label="Vibration" 
                    value={settings.reminderBuzzType === 'short' ? 'Short' : 'Pattern'} 
                    hasArrow 
                    isDark={isDark} 
                    onClick={() => {
                        const next = settings.reminderBuzzType === 'short' ? 'pattern' : 'short';
                        update('reminderBuzzType', next);
                        SystemManager.vibrate(next === 'short' ? 'light' : 'sos'); // PREVIEW VIBRATION
                    }}
                    last 
                />
            </div>

            {/* APP PERMISSIONS */}
            <SectionHeader title="Permissions" isDark={isDark} />
            <div className={`mb-6 ${bgCard} border-y ${borderCol}`}>
                <SettingRow 
                    icon={<SettingsIcon icon={Shield} colorClass="from-blue-400 to-blue-600" />}
                    label="Check Status" 
                    value={permissions['Notifications'] === 'granted' ? 'All Good' : 'Review'}
                    customRight={permissions['Notifications'] === 'granted' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-orange-500" />}
                    isDark={isDark}
                    onClick={async () => {
                        await checkPermissions();
                        requestNotificationPermission(); // Real request
                        alert(`Notifications: ${permissions['Notifications'] || 'Unknown'}\nLocation: ${permissions['Location']}`);
                    }}
                />
                <SettingRow 
                    icon={<SettingsIcon icon={Bell} colorClass="from-red-400 to-red-600" />}
                    label="Notifications" 
                    hasArrow
                    onClick={() => { requestNotificationPermission(); update('enableNotifications', true); }}
                    isDark={isDark}
                />
                <SettingRow 
                    icon={<SettingsIcon icon={Zap} colorClass="from-yellow-400 to-yellow-600" />}
                    label="AutoStart" 
                    hasArrow
                    onClick={() => update('autoStart', !settings.autoStart)}
                    isDark={isDark}
                    last
                />
            </div>

            {/* APPEARANCE */}
            <SectionHeader title="Appearance" isDark={isDark} />
            <div className={`mb-6 ${bgCard} border-y ${borderCol}`}>
                <RadioGroup 
                    icon={<SettingsIcon icon={List} colorClass="from-indigo-400 to-indigo-600" />}
                    label="List Style" 
                    options={[
                        { label: 'Standard', value: 'default' }, 
                        { label: 'Expanded', value: 'expandable' }
                    ]}
                    selected={settings.taskListType}
                    onChange={(val) => update('taskListType', val)}
                    isDark={isDark}
                />
                <RadioGroup 
                    icon={<SettingsIcon icon={Palette} colorClass="from-purple-400 to-purple-600" />}
                    label="Theme" 
                    options={[
                        { label: 'Light', value: 'light' }, 
                        { label: 'Dark', value: 'dark' }
                    ]}
                    selected={settings.theme}
                    onChange={(val) => update('theme', val)}
                    isDark={isDark}
                    last
                />
            </div>

            {/* SMART FEATURES */}
            <SectionHeader title="Smart Features" isDark={isDark} />
            <div className={`mb-6 ${bgCard} border-y ${borderCol}`}>
                <ToggleRow 
                    icon={<SettingsIcon icon={Repeat} colorClass="from-orange-400 to-orange-600" />}
                    label="Auto Snooze"
                    checked={settings.autoSnooze}
                    onChange={() => update('autoSnooze', !settings.autoSnooze)}
                    isDark={isDark}
                />
                <ToggleRow 
                    icon={<SettingsIcon icon={ArrowUpCircle} colorClass="from-green-400 to-green-600" />}
                    label="Sticky Notification"
                    checked={settings.stickOnStatusBar}
                    onChange={() => update('stickOnStatusBar', !settings.stickOnStatusBar)}
                    isDark={isDark}
                />
                <ToggleRow 
                    icon={<SettingsIcon icon={Car} colorClass="from-indigo-400 to-indigo-600" />}
                    label="Driving Mode"
                    checked={settings.drivingMode}
                    onChange={() => update('drivingMode', !settings.drivingMode)}
                    isDark={isDark}
                />
                <ToggleRow 
                    icon={<SettingsIcon icon={EyeOff} colorClass="from-gray-400 to-gray-600" />}
                    label="Hide Alarm Icon"
                    checked={settings.hideAlarmIcon}
                    onChange={() => update('hideAlarmIcon', !settings.hideAlarmIcon)}
                    isDark={isDark}
                    last
                />
            </div>

            {/* FOOTER */}
            <SectionHeader title="About" isDark={isDark} />
            <div className={`mb-6 ${bgCard} border-y ${borderCol}`}>
                <SettingRow 
                  icon={<SettingsIcon icon={Shield} colorClass="from-blue-400 to-blue-600" />} 
                  label="Privacy & Terms" 
                  hasArrow 
                  isDark={isDark} 
                  onClick={() => setActivePage('privacy')} 
                />
                <SettingRow 
                  icon={<SettingsIcon icon={Info} colorClass="from-gray-400 to-gray-600" />} 
                  label="Version" 
                  value="2.69.02 (Pro)" 
                  isDark={isDark} 
                  last 
                />
            </div>

             {/* CREDITS SECTION */}
             <div className="flex flex-col items-center justify-center pt-4 pb-12 space-y-1 opacity-60">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Made with <span className="text-red-500 animate-pulse">♥️</span> by Jai Sharma
                </p>
                <p className={`text-[11px] ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                    Copyright © 2026 Re:mindr. All rights reserved.
                </p>
            </div>
            
        </div>
    </div>
  );
};

// --- HELPER COMPONENTS FOR PROFESSIONAL LOOK ---

const SectionHeader = ({ title, isDark }: { title: string, isDark: boolean }) => (
    <div className={`px-4 py-2 text-[13px] font-normal uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {title}
    </div>
);

const SettingRow = ({ icon, label, subLabel, value, customRight, hasArrow, isDark, onClick, last }: any) => (
    <div 
        onClick={onClick}
        className={`
            pl-4 pr-4 py-3 flex items-center justify-between cursor-pointer active:bg-black/5 transition-colors
            ${isDark ? 'active:bg-white/10' : 'active:bg-gray-100'}
        `}
    >
        <div className="flex items-center flex-1 overflow-hidden">
            {icon && icon}
            <div className={`flex-1 pr-4 py-0.5 border-b ${!last ? (isDark ? 'border-[#38383A]' : 'border-[#E5E5EA]') : 'border-transparent'}`}>
                <div className="flex items-center justify-between w-full h-full">
                     <div className="flex flex-col justify-center">
                        <div className="text-[17px] font-normal leading-snug">{label}</div>
                        {subLabel && <div className={`text-[13px] mt-0.5 leading-tight ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{subLabel}</div>}
                     </div>
                     <div className="flex items-center gap-2 pl-2">
                        {value && <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-[17px]`}>{value}</span>}
                        {customRight}
                        {hasArrow && <ChevronRight className={`w-[18px] h-[18px] ${isDark ? 'text-gray-500' : 'text-gray-400'} opacity-50`} />}
                     </div>
                </div>
            </div>
        </div>
    </div>
);

const ToggleRow = ({ icon, label, subLabel, checked, onChange, isDark, last }: any) => (
    <div className={`pl-4 pr-4 py-3 flex items-center justify-between`}>
         <div className="flex items-center flex-1 overflow-hidden">
            {icon && icon}
            <div className={`flex-1 flex items-center justify-between pr-0 py-1 border-b ${!last ? (isDark ? 'border-[#38383A]' : 'border-[#E5E5EA]') : 'border-transparent'}`}>
                <div className="flex flex-col justify-center pr-4">
                    <div className="text-[17px] font-normal leading-snug">{label}</div>
                    {subLabel && <div className={`text-[13px] mt-0.5 leading-tight ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{subLabel}</div>}
                </div>
                
                <button 
                    onClick={onChange}
                    className={`w-[51px] h-[31px] rounded-full p-[2px] transition-all duration-300 ${checked ? 'bg-[#34C759]' : (isDark ? 'bg-[#39393D]' : 'bg-[#E9E9EA]')}`}
                >
                    <div className={`w-[27px] h-[27px] bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                </button>
            </div>
        </div>
    </div>
);

const RadioGroup = ({ icon, label, options, selected, onChange, isDark, last }: any) => (
    <div className={`pl-4 pr-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center flex-1 overflow-hidden">
            {icon && icon}
             <div className={`flex-1 flex items-center justify-between py-1 border-b ${!last ? (isDark ? 'border-[#38383A]' : 'border-[#E5E5EA]') : 'border-transparent'}`}>
                <span className={`text-[17px] ${isDark ? 'text-white' : 'text-black'}`}>{label}</span>
                <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    {options.map((opt: any) => {
                        const isSelected = selected === opt.value;
                        return (
                            <button 
                                key={opt.value} 
                                onClick={() => onChange(opt.value)}
                                className={`
                                    px-3 py-1 rounded-[6px] text-[13px] font-medium transition-all
                                    ${isSelected 
                                        ? (isDark ? 'bg-gray-600 text-white shadow-sm' : 'bg-white text-black shadow-sm') 
                                        : (isDark ? 'text-gray-400' : 'text-gray-500')}
                                `}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
);

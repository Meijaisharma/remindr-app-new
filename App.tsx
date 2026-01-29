
import React, { useState, useEffect, useRef } from 'react';
import { 
  IconHome, 
  IconCalendar, 
  IconSettings,
  IconBell,
  IconTools
} from './components/Icons';
import { SmartInput, type SmartInputData } from './components/SmartInput';
import { ReminderList } from './components/ReminderList';
import { CalendarView } from './components/CalendarView';
import { StatsView } from './components/StatsView';
import { AlarmView } from './components/AlarmView';
import { CalculatorView } from './components/CalculatorView';
import { CompassView } from './components/CompassView';
import { LogoSplash } from './components/LogoSplash';
import { AppLogo } from './components/Logo';
import { FullScreenAlarm } from './components/FullScreenAlarm';
import { PermissionScreen } from './components/PermissionScreen';
import { OverlayPermissionCard } from './components/OverlayPermissionCard'; 
import { EmptyStateIllustration } from './components/EmptyStateIllustration';
import { Reminder, Alarm, ViewMode, Tag, AppSettings } from './types';
import { parseSmartText, StorageService, SystemManager, requestNotificationPermission } from './utils';
import { Lock, ShieldAlert, Plus, MoreHorizontal, Inbox, CheckCircle2 } from 'lucide-react';

const INITIAL_TAGS: Tag[] = [
  { id: 'home', name: 'home', color: 'purple' },
  { id: 'work', name: 'work', color: 'orange' },
  { id: 'shopping', name: 'shopping', color: 'green' }
];

const DEFAULT_SETTINGS: AppSettings = {
    specialDaysNotification: "08:00 AM",
    defaultSnooze: 0,
    dateFormat: "Jan 29, 2026",
    timeFormat: "12h",
    autoDelete: "never",
    fullScreenAlarm: false,
    enableNotifications: false,
    backgroundAccess: false,
    autoStart: false,
    taskListType: "default",
    theme: "light",
    datePicker: "default",
    timePicker: "basic",
    soundMode: "default",
    reminderSound: "radar",
    specialDaysSound: "chimes",
    reminderBuzzType: "pattern",
    alarmBuzzDuration: 5,
    autoSnooze: false,
    autoSnoozeDuration: 5,
    stickOnStatusBar: false,
    lockScreenNotification: true,
    drivingMode: false,
    hideAlarmIcon: false,
    securityPin: null, 
    biometricEnabled: false,
    privacyBlur: false
};

const App = () => {
  const [loading, setLoading] = useState(true);
  
  // Persistent Permission State (Main Screen)
  const [hasConsented, setHasConsented] = useState(() => {
    return localStorage.getItem('app_permission_consent') === 'true';
  });
  
  // Persistent Overlay Permission State (Bottom Sheet)
  const [showOverlayPermission, setShowOverlayPermission] = useState(() => {
    // Only show if NOT previously dismissed
    return localStorage.getItem('overlay_permission_dismissed') !== 'true';
  });

  const [isLocked, setIsLocked] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [tamperDetected, setTamperDetected] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<Reminder | null>(null);
  const [showInput, setShowInput] = useState(false);

  // --- Global State ---
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]); 
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [activeTab, setActiveTab] = useState<ViewMode>(ViewMode.HOME);
  const [activeTool, setActiveTool] = useState<'calc' | 'compass'>('calc');
  const [inputText, setInputText] = useState('');
  
  // --- THEME & APPEARANCE ---
  useEffect(() => {
    if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.style.backgroundColor = '#111827';
    } else {
        document.documentElement.classList.remove('dark');
        document.body.style.backgroundColor = '#FFF8F4';
    }
  }, [settings.theme]);

  // --- LIFECYCLE FOR SETTINGS RETURN ---
  // When user comes back from Phone Settings, we assume they granted permission
  useEffect(() => {
    const handleVisibilityChange = () => {
       if (document.visibilityState === 'visible') {
           if (showOverlayPermission) {
               setTimeout(() => {
                   setShowOverlayPermission(false);
                   localStorage.setItem('overlay_permission_dismissed', 'true');
               }, 500);
           }
           if (settings.privacyBlur) setIsBlurred(false);
       } else {
           if (settings.privacyBlur) setIsBlurred(true);
       }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [showOverlayPermission, settings.privacyBlur]);

  // --- BOOTSTRAP (LOAD DATA) ---
  useEffect(() => {
    const loadVault = async () => {
        setTimeout(() => {
            // Load from persistent local storage
            const savedReminders = StorageService.getReminders();
            const savedSettings = StorageService.getSettings() || DEFAULT_SETTINGS;
            const savedAlarms = JSON.parse(localStorage.getItem('vault_alarms_v1') || '[]');
            
            if (savedReminders.length > 0) setReminders(savedReminders);
            
            setAlarms(savedAlarms);
            setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });

            if (savedSettings.securityPin) setIsLocked(true);
            
            setLoading(false);
        }, 1500); 
    };
    loadVault();
  }, []);

  // --- PERSISTENCE (SAVE DATA) ---
  useEffect(() => {
      if (!loading) {
        // Automatically save whenever state changes
        StorageService.saveReminders(reminders);
        localStorage.setItem('vault_alarms_v1', JSON.stringify(alarms));
        StorageService.saveSettings(settings);
      }
  }, [reminders, alarms, settings, loading]);

  // --- REAL-TIME SYSTEM ENGINE ---
  useEffect(() => {
    if (loading) return;

    const intervalId = setInterval(() => {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();

        // 1. Check Reminders
        if (currentSeconds === 0) { 
            reminders.forEach(reminder => {
                if (reminder.isCompleted) return;
                
                let isMatch = false;
                if (reminder.time) {
                    const [rH, rM] = reminder.time.split(':').map(Number);
                    if (rH === currentHours && rM === currentMinutes) {
                        if (!reminder.date || new Date(reminder.date).toDateString() === now.toDateString()) {
                            isMatch = true;
                        }
                    }
                }

                if (isMatch) {
                   if (settings.drivingMode && reminder.priority !== 'critical') return;
                   
                   if (settings.soundMode !== 'silent') {
                       SystemManager.playRingtone(settings.reminderSound); 
                       SystemManager.vibrate('heavy');
                   }
                   if (settings.fullScreenAlarm) setActiveAlarm(reminder);
                }
            });
        }

        // 2. Check Alarms
        if (currentSeconds === 0) {
            alarms.forEach(alarm => {
                if (alarm.isEnabled) {
                    const [aH, aM] = alarm.time.split(':').map(Number);
                    if (aH === currentHours && aM === currentMinutes) {
                         SystemManager.playRingtone(alarm.ringtone || 'radar');
                         SystemManager.vibrate('sos');
                         setActiveAlarm({
                             id: 'alarm-'+alarm.id,
                             title: alarm.label || 'Alarm',
                             priority: 'critical',
                             isCompleted: false,
                             tags: [],
                             createdAt: new Date()
                         });
                    }
                }
            });
        }

        // 3. Auto Delete Logic
        if (settings.autoDelete !== 'never') {
            const expiryTime = settings.autoDelete === 'immediately' ? 60000 : 86400000; // 1 min or 24 hrs
            setReminders(prev => prev.filter(r => {
                if (!r.isCompleted) return true;
                const completedTime = r.createdAt.getTime(); 
                return (now.getTime() - completedTime) < expiryTime;
            }));
        }

    }, 1000); 

    return () => clearInterval(intervalId);
  }, [reminders, alarms, settings, loading]);

  const handleDismissAlarm = () => {
      SystemManager.stopRingtone(); 
      if (activeAlarm) {
          if (!activeAlarm.id.startsWith('alarm-')) {
              toggleReminder(activeAlarm.id);
          }
      }
      setActiveAlarm(null);
  };

  const handleAddReminder = (data: SmartInputData) => {
    SystemManager.initAudio();
    
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: data.title,
      isCompleted: false,
      date: data.date,
      time: data.time,
      tags: data.tags,
      priority: data.priority,
      recurrence: data.recurrence,
      createdAt: new Date()
    };
    
    if (data.title.toLowerCase().includes('home')) newReminder.location = { name: 'Home', radius: 100 };
    
    setReminders(prev => [newReminder, ...prev]);
    setInputText('');
    setShowInput(false);
    if (settings.soundMode !== 'silent') SystemManager.playTone('success');
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));
  };
  const deleteReminder = (id: string) => setReminders(prev => prev.filter(r => r.id !== id));

  const addAlarm = (time: string, label: string, ringtone: string) => {
      setAlarms(prev => [...prev, {
          id: Date.now().toString(),
          time,
          label,
          isEnabled: true,
          days: [0,1,2,3,4,5,6],
          snoozeCount: 0,
          ringtone
      }]);
  };
  const toggleAlarm = (id: string) => {
      setAlarms(prev => prev.map(a => a.id === id ? { ...a, isEnabled: !a.isEnabled } : a));
  };
  const deleteAlarm = (id: string) => {
      setAlarms(prev => prev.filter(a => a.id !== id));
  };
  
  const handlePermissionContinue = async () => {
      localStorage.setItem('app_permission_consent', 'true');
      setHasConsented(true);
  };

  // Helper to filter tasks
  const activeReminders = reminders.filter(r => !r.isCompleted);
  const completedReminders = reminders.filter(r => r.isCompleted);

  // --- RENDER FLOW ---
  
  if (loading) return <LogoSplash onComplete={() => {}} />;
  if (!hasConsented) return <PermissionScreen onContinue={handlePermissionContinue} />;
  
  if (tamperDetected) return (
      <div className="fixed inset-0 bg-red-900 text-white flex flex-col items-center justify-center p-8 text-center z-[9999]">
          <ShieldAlert className="w-20 h-20 mb-6 animate-pulse" />
          <h1 className="text-3xl font-bold mb-4">SECURITY ALERT</h1>
          <p>System integrity compromised.</p>
      </div>
  );

  if (activeAlarm) return <FullScreenAlarm reminder={activeAlarm} onDismiss={handleDismissAlarm} onSnooze={handleDismissAlarm} />;
  if (isLocked) return <div className="fixed inset-0 bg-[#FFF8F4] flex items-center justify-center p-6"><Lock className="w-8 h-8 mb-4"/><button onClick={() => setIsLocked(false)} className="bg-accent text-white px-6 py-3 rounded-xl">Unlock</button></div>;
  if (activeTab === ViewMode.SETTINGS) return <StatsView reminders={reminders} settings={settings} onUpdateSettings={setSettings} onBack={() => setActiveTab(ViewMode.HOME)} />;

  const isDark = settings.theme === 'dark';

  return (
    <div className={`h-[100dvh] w-full relative font-sans selection:bg-accent/20 transition-all duration-300 overflow-hidden ${isDark ? 'bg-gray-900 text-white' : 'bg-[#FFF8F4] text-gray-900'} ${isBlurred ? 'blur-xl scale-95 opacity-50' : ''}`}>
      
      {isBlurred && <div className="absolute inset-0 z-[1000] bg-black/50 backdrop-blur-md" />}

      {/* Main Flex Column with Safe Area Padding */}
      <div className="relative z-10 w-full h-full flex flex-col pt-safe-top pb-safe-bottom">
        
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 shadow-lg shadow-orange-500/20 rounded-xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
               <AppLogo className="w-full h-full" animated={true} />
             </div>
             <h1 className="text-3xl font-bold tracking-tight">
                {activeTab === ViewMode.HOME ? 'Lists' : 
                 activeTab === ViewMode.CALENDAR ? 'Calendar' : 
                 activeTab === ViewMode.ALARM ? 'Clock' : 
                 activeTab === ViewMode.TOOLS ? 'Tools' : 'Search'}
             </h1>
          </div>
          <button onClick={() => setActiveTab(ViewMode.SETTINGS)} className="glass-card p-2 rounded-full">
             <IconSettings className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </header>

        {/* Content Area */}
        <main className={`flex-1 w-full relative ${activeTab === ViewMode.TOOLS ? 'overflow-hidden px-2' : 'overflow-y-auto no-scrollbar'}`}>
            {activeTab === ViewMode.HOME && (
              <div className="px-6 animate-slide-up pb-32 flex flex-col gap-6">
                 
                 {/* Empty State with Character Illustration */}
                 {activeReminders.length === 0 && (
                     <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
                         <EmptyStateIllustration className="w-64 h-auto mb-6 opacity-90" />
                         <h3 className="text-xl font-bold mb-2">You're all caught up!</h3>
                         <p className="text-sm text-gray-400 leading-relaxed max-w-[200px]">
                            Tap the + button to add a new task or reminder.
                         </p>
                     </div>
                 )}

                 {/* Active List */}
                 {activeReminders.length > 0 && (
                     <ReminderList title="Tasks" reminders={activeReminders} onToggle={toggleReminder} onDelete={deleteReminder} />
                 )}

                 {/* Completed List (Visible if items exist) */}
                 {completedReminders.length > 0 && (
                     <div className="mt-4 opacity-70 hover:opacity-100 transition-opacity">
                        <ReminderList title="Completed" reminders={completedReminders} onToggle={toggleReminder} onDelete={deleteReminder} />
                     </div>
                 )}
              </div>
            )}
            {activeTab === ViewMode.CALENDAR && <CalendarView reminders={reminders} onToggle={toggleReminder} onDelete={deleteReminder} />}
            {activeTab === ViewMode.ALARM && <AlarmView alarms={alarms} onAddAlarm={addAlarm} onToggleAlarm={toggleAlarm} onDeleteAlarm={deleteAlarm} />}
            {activeTab === ViewMode.TOOLS && (
                <div className="h-full flex flex-col">
                    <div className="flex justify-center gap-4 mb-3 flex-shrink-0">
                        <button onClick={() => setActiveTool('calc')} className={`px-5 py-2 rounded-full text-sm font-bold transition-colors shadow-sm ${activeTool === 'calc' ? 'bg-gray-800 text-white' : 'glass-card text-gray-500'}`}>Calculator</button>
                        <button onClick={() => setActiveTool('compass')} className={`px-5 py-2 rounded-full text-sm font-bold transition-colors shadow-sm ${activeTool === 'compass' ? 'bg-gray-800 text-white' : 'glass-card text-gray-500'}`}>Compass</button>
                    </div>
                    <div className="flex-1 overflow-hidden relative rounded-[32px] pb-[100px]">
                         {activeTool === 'calc' ? <CalculatorView /> : <CompassView />}
                    </div>
                </div>
            )}
        </main>

        {/* INPUT MODAL OVERLAY */}
        {showInput && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex flex-col justify-end">
                <div onClick={() => setShowInput(false)} className="flex-1" />
                <div className="p-4 pb-safe-bottom animate-slide-up mb-24">
                    <SmartInput inputValue={inputText} onInputChange={setInputText} onAdd={handleAddReminder} availableTags={INITIAL_TAGS} />
                </div>
            </div>
        )}

        {/* --- BOTTOM SHEET: OVERLAY PERMISSION --- */}
        {hasConsented && showOverlayPermission && (
            <OverlayPermissionCard onDismiss={() => {
                setShowOverlayPermission(false);
                localStorage.setItem('overlay_permission_dismissed', 'true');
            }} />
        )}

        {/* FLOATING NAVIGATION CAPSULE */}
        <div className="absolute bottom-6 w-full flex justify-between items-center px-6 z-40 pointer-events-none pb-safe-bottom">
            
            {/* Left Capsule with Sliding Glass Background */}
            <div className="glass-card h-[64px] rounded-full flex items-center shadow-2xl pointer-events-auto relative px-2">
                
                {/* Active Indicator (Sliding Pill) */}
                <div 
                  className="absolute top-2 bottom-2 bg-black/10 dark:bg-white/20 rounded-full transition-all duration-300 ease-out backdrop-blur-md"
                  style={{
                    left: activeTab === ViewMode.HOME ? '8px' : 
                          activeTab === ViewMode.TOOLS ? 'calc(25% + 6px)' : 
                          activeTab === ViewMode.CALENDAR ? 'calc(50% + 6px)' : 
                          'calc(75% + 4px)',
                    width: 'calc(25% - 8px)'
                  }}
                />

                <NavIcon active={activeTab === ViewMode.HOME} onClick={() => setActiveTab(ViewMode.HOME)} icon={IconHome} />
                <NavIcon active={activeTab === ViewMode.TOOLS} onClick={() => setActiveTab(ViewMode.TOOLS)} icon={IconTools} />
                <NavIcon active={activeTab === ViewMode.CALENDAR} onClick={() => setActiveTab(ViewMode.CALENDAR)} icon={IconCalendar} />
                <NavIcon active={activeTab === ViewMode.ALARM} onClick={() => setActiveTab(ViewMode.ALARM)} icon={IconBell} />
            </div>

            {/* Right Add Button (Large Circle) */}
            <button 
                onClick={() => {
                    if (activeTab === ViewMode.ALARM) {
                        // Alarm View handles its own add
                    } else {
                        setShowInput(true);
                    }
                }}
                className="w-[64px] h-[64px] rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-2xl active:scale-90 transition-transform pointer-events-auto ml-4"
            >
                <Plus className="w-8 h-8 stroke-[3]" />
            </button>
        </div>

      </div>
    </div>
  );
};

const NavIcon = ({ active, onClick, icon: Icon }: any) => (
    <button 
      onClick={onClick} 
      className={`w-[60px] h-full flex items-center justify-center relative z-10 transition-colors ${active ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
    >
        <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
    </button>
);

export default App;

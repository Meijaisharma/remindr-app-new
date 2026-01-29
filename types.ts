
export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type PriorityLevel = 'normal' | 'high' | 'critical';

export interface LocationTrigger {
  name: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in meters
}

export interface Reminder {
  id: string;
  title: string;
  isCompleted: boolean;
  date?: Date | null;
  time?: string | null; // HH:mm format
  tags: string[]; // Tag IDs
  priority: PriorityLevel;
  location?: LocationTrigger; 
  recurrence?: 'daily' | 'weekly' | 'monthly' | null;
  externalSource?: 'google' | 'slack' | 'notion';
  createdAt: Date;
}

export interface Alarm {
  id: string;
  time: string; // HH:mm
  label: string;
  isEnabled: boolean;
  days: number[]; // 0-6 (Sun-Sat)
  snoozeCount: number;
  ringtone: string; // New field
}

export enum ViewMode {
  HOME = 'home',
  CALENDAR = 'calendar',
  SEARCH = 'search',
  SETTINGS = 'settings',
  ALARM = 'alarm',
  TOOLS = 'tools' // Container for Calculator & Compass
}

export interface SmartParseResult {
  cleanTitle: string;
  detectedDate: Date | null;
  detectedTime: string | null;
  detectedTags: string[];
  detectedPriority: PriorityLevel;
  detectedRecurrence: 'daily' | 'weekly' | 'monthly' | null;
}

export interface AppSettings {
  // General
  specialDaysNotification: string;
  defaultSnooze: number; // minutes, 0 for OFF
  dateFormat: string;
  timeFormat: '12h' | '24h';
  autoDelete: 'never' | 'immediately' | '24h';
  
  // Permissions
  fullScreenAlarm: boolean;
  enableNotifications: boolean;
  backgroundAccess: boolean;
  autoStart: boolean;

  // Appearance
  taskListType: 'default' | 'expandable';
  theme: 'light' | 'dark';
  datePicker: 'default' | 'calendar';
  timePicker: 'basic' | 'analog';

  // Sound
  soundMode: 'default' | 'silent';
  reminderSound: string;
  specialDaysSound: string;
  reminderBuzzType: 'short' | 'long' | 'pattern';
  alarmBuzzDuration: number; // minutes
  
  // Snooze & Others
  autoSnooze: boolean; // Snooze Un-attended Reminder
  autoSnoozeDuration: number; // minutes
  stickOnStatusBar: boolean;
  lockScreenNotification: boolean;
  drivingMode: boolean;
  hideAlarmIcon: boolean;

  // Security (Vault)
  securityPin: string | null;
  biometricEnabled: boolean;
  privacyBlur: boolean;
}


import React, { useState, useEffect, useRef } from 'react';
import { Reminder } from '../types';
import { ReminderList } from './ReminderList';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, 
  Flag, Sun, Moon, Sparkles, MapPin, Info, Award
} from 'lucide-react';

interface CalendarViewProps {
  reminders: Reminder[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

// --- DATA: INDIAN HOLIDAYS & FESTIVALS (GOVT + CULTURAL) ---
// Format: MM-DD
interface HolidayData {
  name: string;
  hindiName?: string;
  type: 'gazetted' | 'restricted' | 'festival' | 'observance';
  icon: string;
  color: string;
  tithi?: string;
}

const INDIAN_HOLIDAYS: Record<string, HolidayData> = {
  // --- JANUARY ---
  '01-01': { name: 'New Year\'s Day', hindiName: 'नव वर्ष', type: 'observance', icon: '🎉', color: 'purple' },
  '01-13': { name: 'Lohri', hindiName: 'लोहड़ी', type: 'festival', icon: '🔥', color: 'orange', tithi: 'Pausa Shukla' },
  '01-14': { name: 'Makar Sankranti', hindiName: 'मकर संक्रांति', type: 'restricted', icon: '🪁', color: 'orange', tithi: 'Magha Krishna' },
  '01-15': { name: 'Pongal / Army Day', hindiName: 'पोंगल / सेना दिवस', type: 'observance', icon: '🌾', color: 'green' },
  '01-26': { name: 'Republic Day', hindiName: 'गणतंत्र दिवस', type: 'gazetted', icon: '🇮🇳', color: 'tricolor', tithi: 'National Holiday' },

  // --- FEBRUARY ---
  '02-14': { name: 'Vasant Panchami', hindiName: 'वसंत पंचमी', type: 'restricted', icon: '🌼', color: 'yellow', tithi: 'Magha Shukla 5' },
  '02-19': { name: 'Chhatrapati Shivaji Maharaj Jayanti', hindiName: 'शिवाजी जयंती', type: 'restricted', icon: '🚩', color: 'orange' },

  // --- MARCH ---
  '03-08': { name: 'Maha Shivratri', hindiName: 'महाशिवरात्रि', type: 'gazetted', icon: '🕉️', color: 'blue', tithi: 'Phalguna Krishna 14' },
  '03-25': { name: 'Holi', hindiName: 'होली', type: 'gazetted', icon: '🎨', color: 'pink', tithi: 'Phalguna Purnima' },
  '03-29': { name: 'Good Friday', hindiName: 'गुड फ्राइडे', type: 'gazetted', icon: '✝️', color: 'gray' },

  // --- APRIL ---
  '04-09': { name: 'Ugadi / Gudi Padwa', hindiName: 'गुड़ी पड़वा', type: 'restricted', icon: '🎋', color: 'green', tithi: 'Chaitra Shukla 1' },
  '04-11': { name: 'Eid-ul-Fitr', hindiName: 'ईद-उल-फितर', type: 'gazetted', icon: '🌙', color: 'green', tithi: 'Shawwal 1' },
  '04-14': { name: 'Ambedkar Jayanti', hindiName: 'अम्बेडकर जयंती', type: 'gazetted', icon: '⚖️', color: 'blue' },
  '04-17': { name: 'Ram Navami', hindiName: 'राम नवमी', type: 'gazetted', icon: '🏹', color: 'orange', tithi: 'Chaitra Shukla 9' },
  '04-21': { name: 'Mahavir Jayanti', hindiName: 'महावीर जयंती', type: 'gazetted', icon: '🪷', color: 'orange' },

  // --- MAY ---
  '05-01': { name: 'Labour Day', hindiName: 'मजदूर दिवस', type: 'observance', icon: '🛠️', color: 'red' },
  '05-23': { name: 'Buddha Purnima', hindiName: 'बुद्ध पूर्णिमा', type: 'gazetted', icon: '☸️', color: 'gold', tithi: 'Vaishakha Purnima' },

  // --- JUNE ---
  '06-17': { name: 'Bakrid / Eid al-Adha', hindiName: 'बकरीद', type: 'gazetted', icon: '🐐', color: 'green' },
  '06-21': { name: 'Intl. Yoga Day', hindiName: 'योग दिवस', type: 'observance', icon: '🧘', color: 'green' },

  // --- JULY ---
  '07-17': { name: 'Muharram', hindiName: 'मुहर्रम', type: 'gazetted', icon: '🕌', color: 'gray' },

  // --- AUGUST ---
  '08-15': { name: 'Independence Day', hindiName: 'स्वतंत्रता दिवस', type: 'gazetted', icon: '🇮🇳', color: 'tricolor', tithi: 'National Holiday' },
  '08-19': { name: 'Raksha Bandhan', hindiName: 'रक्षाबंधन', type: 'restricted', icon: '🧵', color: 'pink', tithi: 'Shravana Purnima' },
  '08-26': { name: 'Janmashtami', hindiName: 'जन्माष्टमी', type: 'restricted', icon: '🦚', color: 'blue', tithi: 'Bhadrapada Krishna 8' },

  // --- SEPTEMBER ---
  '09-07': { name: 'Ganesh Chaturthi', hindiName: 'गणेश चतुर्थी', type: 'restricted', icon: '🐘', color: 'orange', tithi: 'Bhadrapada Shukla 4' },
  '09-16': { name: 'Eid-e-Milad', hindiName: 'ईद-ए-मिलाद', type: 'gazetted', icon: '☪️', color: 'green' },

  // --- OCTOBER ---
  '10-02': { name: 'Gandhi Jayanti', hindiName: 'गांधी जयंती', type: 'gazetted', icon: '🕊️', color: 'tricolor' },
  '10-12': { name: 'Dussehra', hindiName: 'दशहरा', type: 'gazetted', icon: '🏹', color: 'orange', tithi: 'Ashvina Shukla 10' },
  '10-31': { name: 'Diwali', hindiName: 'दीपावली', type: 'gazetted', icon: '🪔', color: 'gold', tithi: 'Kartika Amavasya' },

  // --- NOVEMBER ---
  '11-15': { name: 'Guru Nanak Jayanti', hindiName: 'गुरु नानक जयंती', type: 'gazetted', icon: 'gurudwara', color: 'orange', tithi: 'Kartika Purnima' },
  '11-14': { name: 'Children\'s Day', hindiName: 'बाल दिवस', type: 'observance', icon: '👶', color: 'blue' },

  // --- DECEMBER ---
  '12-25': { name: 'Christmas', hindiName: 'क्रिसमस', type: 'gazetted', icon: '🎄', color: 'red' }
};

const HINDI_MONTHS = [
  "Chaitra", "Vaisakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadra", 
  "Ashvina", "Kartika", "Agrahayana", "Pausa", "Magha", "Phalguna"
];

const WEEKDAYS_HINDI = ["Ravivar", "Somwar", "Mangalwar", "Budhwar", "Guruwar", "Shukrawar", "Shaniwar"];
const WEEKDAYS_HINDI_SCRIPT = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];

export const CalendarView: React.FC<CalendarViewProps> = ({ reminders, onToggle, onDelete }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);

  // --- HELPERS ---
  const getHindiMonth = (date: Date) => {
      // Very approximate mapping for display purposes
      const monthIndex = date.getMonth(); 
      // Example: Jan is roughly Pausa/Magha. 
      // Offset by -2 to align roughly with Gregorian for display (This is illustrative, not astronomical)
      const hindiIndex = (monthIndex + 9) % 12;
      return `${HINDI_MONTHS[hindiIndex]} / ${HINDI_MONTHS[(hindiIndex + 1) % 12]}`;
  };

  const changeMonth = (delta: number) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + delta);
      setCurrentDate(newDate);
  };

  const jumpToYear = (year: number) => {
      const newDate = new Date(currentDate);
      newDate.setFullYear(year);
      setCurrentDate(newDate);
      setShowYearPicker(false);
  };

  // --- DATA GENERATION ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(new Date(year, month, i));

  // --- SELECTED DATE LOGIC ---
  const selectedDayKey = `${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
  const holiday = INDIAN_HOLIDAYS[selectedDayKey];
  
  const remindersOnDate = reminders.filter(r => 
      r.date && new Date(r.date).toDateString() === selectedDate.toDateString()
  );

  const yearsList = Array.from({length: 12}, (_, i) => new Date().getFullYear() - 2 + i);

  // --- THEME GENERATOR ---
  const getDayStyle = (hol: HolidayData | undefined, isSelected: boolean, isToday: boolean) => {
      if (hol?.color === 'tricolor') {
          return isSelected 
            ? 'bg-gradient-to-br from-orange-400 via-white to-green-400 text-black border-none shadow-lg scale-105' 
            : 'bg-gradient-to-br from-orange-50 via-white to-green-50 text-gray-800 border-orange-200';
      }
      if (hol?.color === 'gold') {
          return isSelected
            ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-black shadow-lg scale-105'
            : 'bg-yellow-50 text-yellow-800 border-yellow-200';
      }
      if (isSelected) return 'bg-black dark:bg-white text-white dark:text-black shadow-lg scale-105';
      if (isToday) return 'text-accent font-bold bg-accent/10 border border-accent/20';
      
      // Default holiday styling
      if (hol) {
          if (hol.type === 'gazetted') return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-100 dark:border-red-900/30';
          if (hol.type === 'festival') return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-100';
          return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      }

      return 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300';
  };

  return (
    <div className="h-full flex flex-col relative animate-slide-up overflow-hidden bg-white dark:bg-[#111] transition-colors">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] bg-orange-400/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* 1. HEADER (Month & Hindi Month) */}
      <div className="px-6 py-4 flex flex-col z-10">
         <div className="flex items-center justify-between mb-2">
             <button 
                onClick={() => setShowYearPicker(!showYearPicker)}
                className="text-gray-500 dark:text-gray-400 font-medium text-sm flex items-center gap-1 active:opacity-60 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full"
             >
                 {year} <ChevronRight className="w-3 h-3" />
             </button>
             
             <div className="flex items-center gap-1">
                 <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                     <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                 </button>
                 <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                     <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                 </button>
             </div>
         </div>
         
         <div>
             <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-none">
                 {currentDate.toLocaleString('default', { month: 'long' })}
             </h2>
             <p className="text-sm font-medium text-accent mt-1 tracking-wide flex items-center gap-2">
                 <Sun className="w-3.5 h-3.5" />
                 {getHindiMonth(currentDate)} (Vikram Samvat {year + 57})
             </p>
         </div>
      </div>

      {/* 2. GRID AREA */}
      <div className="flex-1 overflow-hidden flex flex-col z-10 px-2">
          
          {/* Weekday Header */}
          <div className="grid grid-cols-7 mb-2 border-b border-gray-100 dark:border-white/5 pb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <div key={i} className="flex flex-col items-center">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${i === 0 ? 'text-red-500' : 'text-gray-400'}`}>{d}</span>
                </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-y-2 gap-x-1 flex-1 overflow-y-auto no-scrollbar content-start">
            {calendarDays.map((day, idx) => {
                if (!day) return <div key={idx} className="h-14" />;

                const isSelected = day.toDateString() === selectedDate.toDateString();
                const isToday = day.toDateString() === new Date().toDateString();
                const dayKey = `${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`;
                const hol = INDIAN_HOLIDAYS[dayKey];
                
                // Indicators
                const hasReminder = reminders.some(r => r.date && new Date(r.date).toDateString() === day.toDateString());
                const dayStyle = getDayStyle(hol, isSelected, isToday);

                return (
                    <button
                        key={idx}
                        onClick={() => setSelectedDate(day)}
                        className={`
                            h-14 w-full flex flex-col items-center justify-start pt-1.5 relative rounded-[14px] transition-all duration-300 border border-transparent
                            ${dayStyle}
                        `}
                    >
                        <span className="text-[15px] font-semibold leading-none">{day.getDate()}</span>
                        
                        {/* Holiday Icon */}
                        {hol && (
                            <span className="text-[14px] mt-0.5 animate-bounce-slight" style={{ animationDuration: '3s' }}>
                                {hol.icon}
                            </span>
                        )}

                        {/* Reminder Dot */}
                        {hasReminder && !hol && (
                             <div className={`w-1 h-1 rounded-full mt-2 ${isSelected ? 'bg-white' : 'bg-accent'}`}></div>
                        )}
                    </button>
                );
            })}
          </div>
      </div>
      
      {/* 3. AGENDA / PANCHANG VIEW (Bottom Sheet) */}
      <div className={`mt-2 flex-shrink-0 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 rounded-t-[36px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col ${remindersOnDate.length > 2 ? 'h-[45%]' : 'h-[38%]'}`}>
            
            {/* Handle Bar */}
            <div className="w-full flex justify-center pt-3 pb-1">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full opacity-50"></div>
            </div>

            {/* Date Header */}
            <div className="px-8 pt-2 pb-4 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[28px] font-bold text-gray-900 dark:text-white leading-none">
                            {selectedDate.getDate()}
                        </h3>
                        <div className="flex flex-col leading-none">
                            <span className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">
                                {selectedDate.toLocaleString('default', { month: 'long' })}
                            </span>
                            <span className="text-[13px] text-gray-400">
                                {selectedDate.getFullYear()}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-accent font-medium text-sm">
                        <span>{WEEKDAYS_HINDI[selectedDate.getDay()]}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                        <span className="font-hindi">{WEEKDAYS_HINDI_SCRIPT[selectedDate.getDay()]}</span>
                    </div>
                </div>

                {holiday ? (
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${holiday.color === 'tricolor' ? 'bg-orange-100 border-2 border-orange-200' : 'bg-gray-100 dark:bg-white/10'}`}>
                        {holiday.icon}
                    </div>
                ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24">
                 
                 {/* 1. HOLIDAY CARD (If Applicable) */}
                 {holiday && (
                    <div className={`mb-6 p-5 rounded-[24px] relative overflow-hidden group ${
                        holiday.color === 'tricolor' ? 'bg-gradient-to-r from-[#FF9933]/10 via-white/50 to-[#138808]/10 border border-orange-200' :
                        holiday.color === 'gold' ? 'bg-gradient-to-br from-yellow-50 to-amber-100 border border-amber-200' :
                        'bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10'
                    }`}>
                        {/* Background Decor */}
                        <div className="absolute right-[-20px] top-[-20px] text-[100px] opacity-10 rotate-12 pointer-events-none grayscale">
                            {holiday.icon}
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                {holiday.type === 'gazetted' && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">GAZETTED HOLIDAY</span>}
                                {holiday.type === 'restricted' && <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">RESTRICTED HOLIDAY</span>}
                                {holiday.type === 'festival' && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">FESTIVAL</span>}
                            </div>
                            
                            <h2 className={`text-xl font-bold mb-1 ${holiday.color === 'tricolor' ? 'text-gray-900' : 'text-gray-900 dark:text-white'}`}>
                                {holiday.name}
                            </h2>
                            {holiday.hindiName && (
                                <h3 className="text-lg font-hindi text-gray-600 dark:text-gray-400 font-medium">
                                    {holiday.hindiName}
                                </h3>
                            )}
                            
                            {holiday.tithi && (
                                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 font-medium">
                                    <Moon className="w-4 h-4 text-purple-500" />
                                    <span>{holiday.tithi}</span>
                                </div>
                            )}
                        </div>
                    </div>
                 )}

                 {/* 2. TIMELINE OF TASKS */}
                 <div className="relative border-l-2 border-gray-100 dark:border-white/10 ml-3 space-y-6 py-2">
                     {remindersOnDate.length > 0 ? (
                         remindersOnDate.map((r, i) => (
                             <div key={r.id} className="relative pl-6 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                                 {/* Timeline Dot */}
                                 <div className={`
                                    absolute -left-[5px] top-3 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#1C1C1E]
                                    ${r.isCompleted ? 'bg-gray-300' : r.priority === 'critical' ? 'bg-red-500' : 'bg-accent'}
                                 `}></div>
                                 
                                 <div className="glass-card p-3 rounded-2xl border-0 shadow-sm bg-white dark:bg-[#2C2C2E] flex items-center justify-between">
                                     <div className="min-w-0">
                                         <h4 className={`text-[15px] font-medium truncate ${r.isCompleted ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                             {r.title}
                                         </h4>
                                         {r.time && (
                                             <div className="flex items-center gap-1.5 mt-1">
                                                 <Clock className="w-3 h-3 text-gray-400" />
                                                 <span className="text-xs font-bold text-gray-500">{r.time}</span>
                                             </div>
                                         )}
                                     </div>
                                     {r.location && <MapPin className="w-4 h-4 text-blue-500 shrink-0" />}
                                 </div>
                             </div>
                         ))
                     ) : (
                         !holiday && (
                            <div className="pl-6 pt-2 opacity-50">
                                <p className="text-gray-400 text-sm font-medium">No personal events.</p>
                                <p className="text-xs text-gray-300 mt-1">Shubh Din! ✨</p>
                            </div>
                         )
                     )}
                 </div>
            </div>
      </div>

      {/* Year Picker Modal */}
      {showYearPicker && (
          <div className="absolute inset-0 z-50 bg-[#FFF8F4] dark:bg-black flex flex-col animate-fade-in-up">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white/50 backdrop-blur-md">
                  <h3 className="text-lg font-bold dark:text-white">Select Year</h3>
                  <button onClick={() => setShowYearPicker(false)} className="text-accent font-medium">Done</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-4">
                  {yearsList.map(y => (
                      <button
                        key={y}
                        onClick={() => jumpToYear(y)}
                        className={`py-4 rounded-2xl text-xl font-bold transition-all ${y === year ? 'bg-accent text-white shadow-lg' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'}`}
                      >
                          {y}
                      </button>
                  ))}
              </div>
          </div>
      )}

    </div>
  );
};

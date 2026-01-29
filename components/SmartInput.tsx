
import React, { useState, useEffect, useRef } from 'react';
import { parseSmartText } from '../utils';
import { IconArrowUp } from './Icons';
import { Tag, PriorityLevel } from '../types';
import { Pin, Calendar as CalendarIcon, Clock as ClockIcon } from 'lucide-react';

export interface SmartInputData {
    title: string;
    date: Date | null;
    time: string | null;
    tags: string[];
    priority: PriorityLevel;
    recurrence: 'daily' | 'weekly' | 'monthly' | null;
}

interface SmartInputProps {
  inputValue: string;
  onInputChange: (val: string) => void;
  onAdd: (data: SmartInputData) => void;
  availableTags: Tag[];
}

export const SmartInput: React.FC<SmartInputProps> = ({ inputValue, onInputChange, onAdd, availableTags }) => {
  const [highlightedHTML, setHighlightedHTML] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  // --- MANUAL OVERRIDES ---
  const [overrideDate, setOverrideDate] = useState<string>(''); // YYYY-MM-DD
  const [overrideTime, setOverrideTime] = useState<string>(''); // HH:MM
  const [overridePriority, setOverridePriority] = useState<PriorityLevel | null>(null);

  // --- PARSED DATA FROM TEXT ---
  const [parsedData, setParsedData] = useState<{
    date: Date | null;
    time: string | null;
    tags: string[];
    priority: PriorityLevel;
    recurrence: 'daily' | 'weekly' | 'monthly' | null;
    cleanTitle: string;
  }>({ date: null, time: null, tags: [], priority: 'normal', recurrence: null, cleanTitle: '' });

  useEffect(() => {
    // Reset overrides when input clears (new task)
    if (inputValue.trim() === '') {
        setOverrideDate('');
        setOverrideTime('');
        setOverridePriority(null);
    }

    // 1. Parse Logic
    const result = parseSmartText(inputValue, availableTags.map(t => t.name));
    setParsedData({
      date: result.detectedDate,
      time: result.detectedTime,
      tags: result.detectedTags,
      priority: result.detectedPriority,
      recurrence: result.detectedRecurrence,
      cleanTitle: result.cleanTitle
    });

    // 2. Highlight Logic
    let html = inputValue
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Highlight Tags
    html = html.replace(/(#\w+)/g, '<span class="text-purple font-medium">$1</span>');

    // Highlight Keywords
    const keywords = ['tomorrow', 'tonight', 'today', 'after work', 'urgent', '!!!', 'every day', 'weekly'];
    const regex = new RegExp(`\\b(${keywords.join('|')})\\b|!!!`, 'gi');
    
    html = html.replace(regex, (match) => {
        if (match.toLowerCase().includes('urgent') || match.includes('!!!')) return `<span class="text-red-500 font-bold">${match}</span>`;
        return `<span class="text-accent font-bold">${match}</span>`;
    });

    html = html.replace(/\n/g, '<br/>');
    setHighlightedHTML(html);
  }, [inputValue, availableTags]);

  // --- EFFECTIVE DATA CALCULATION ---
  const effectiveDate = overrideDate ? new Date(overrideDate) : parsedData.date;
  const effectiveTime = overrideTime ? overrideTime : parsedData.time;
  const effectivePriority = overridePriority !== null ? overridePriority : parsedData.priority;

  const hasContent = inputValue.trim().length > 0;

  const getDateLabel = () => {
      if (effectiveDate) {
        return effectiveDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      }
      return 'Today';
  };

  const getTimeLabel = () => {
      if (effectiveTime) return effectiveTime;
      return '09:00'; // Default placeholder
  };

  const handleManualAdd = () => {
      if (!hasContent) return;
      
      onAdd({
          title: parsedData.cleanTitle || inputValue, // Use clean title if parsed, else raw
          date: effectiveDate,
          time: effectiveTime,
          tags: parsedData.tags,
          priority: effectivePriority,
          recurrence: parsedData.recurrence
      });
      
      // Clear overrides after send
      setOverrideDate('');
      setOverrideTime('');
      setOverridePriority(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleManualAdd();
    }
  };

  const togglePin = () => {
      if (effectivePriority === 'critical') setOverridePriority('normal');
      else setOverridePriority('critical');
  };

  // Safe Picker Trigger
  const openPicker = (ref: React.RefObject<HTMLInputElement>) => {
      try {
          if (ref.current && 'showPicker' in ref.current) {
              ref.current.showPicker();
          } else {
              ref.current?.click(); // Fallback for older browsers
          }
      } catch (e) {
          console.warn('Picker failed to open', e);
      }
  };

  return (
    <div className={`w-full glass-card-input rounded-[24px] p-4 flex flex-col gap-3 shadow-float transition-all duration-300 ${effectivePriority === 'critical' ? 'border-red-400 ring-2 ring-red-100 bg-red-50/50' : 'bg-white/80'}`}>
      
      {/* Hidden Inputs for Native Pickers (Opacity 0 instead of display:none to prevent showPicker crash) */}
      <input 
        type="date" 
        ref={dateInputRef} 
        className="absolute w-0 h-0 opacity-0 bottom-0 left-0 pointer-events-none" 
        onChange={(e) => setOverrideDate(e.target.value)} 
      />
      <input 
        type="time" 
        ref={timeInputRef} 
        className="absolute w-0 h-0 opacity-0 bottom-0 left-0 pointer-events-none" 
        onChange={(e) => setOverrideTime(e.target.value)} 
      />

      {/* Stacked Input Area */}
      <div className="relative min-h-[50px]">
          <label className="text-xs text-gray-400 font-medium mb-1 pl-1 absolute -top-4 left-0 uppercase tracking-wider">
              {effectivePriority === 'critical' ? 'Pinned Reminder' : 'Remind me to'}
          </label>
          
          {/* Highlight Layer */}
          <div 
            className="absolute inset-0 text-[18px] leading-relaxed text-transparent whitespace-pre-wrap font-sans pointer-events-none z-0 px-0.5"
            aria-hidden="true"
          >
             <span dangerouslySetInnerHTML={{ __html: highlightedHTML }} />
          </div>

          {/* Actual Input */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={inputValue ? "" : "Buy milk tomorrow at 5pm..."}
            className="w-full h-full bg-transparent text-[18px] leading-relaxed text-gray-800 placeholder-gray-300 outline-none resize-none font-sans z-10 relative"
            style={{ color: '#1f2937' }}
            rows={1}
          />
      </div>

      {/* Toolbar & Chips */}
      <div className="flex items-center justify-between mt-2">
          
          <div className="flex items-center gap-2">
              {/* Date Button */}
              <button 
                onClick={() => openPicker(dateInputRef)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${effectiveDate || overrideDate ? 'bg-accent text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                  <CalendarIcon className="w-4 h-4" />
                  <span>{getDateLabel()}</span>
              </button>

              {/* Time Button */}
              <button 
                onClick={() => openPicker(timeInputRef)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${effectiveTime || overrideTime ? 'bg-accent text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                  <ClockIcon className="w-4 h-4" />
                  <span>{getTimeLabel()}</span>
              </button>

              {/* Pin Button */}
              <button 
                onClick={togglePin}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${effectivePriority === 'critical' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
              >
                  <Pin className={`w-4 h-4 ${effectivePriority === 'critical' ? 'fill-current' : ''}`} />
              </button>
          </div>

          {/* Send Button */}
          <button 
                onClick={handleManualAdd}
                disabled={!hasContent}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    hasContent 
                    ? effectivePriority === 'critical' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-black dark:bg-white text-white dark:text-black shadow-lg scale-100' 
                    : 'bg-gray-200 text-gray-400 scale-90'
                }`}
            >
                <IconArrowUp className="w-6 h-6 stroke-[3]" />
            </button>
      </div>
    </div>
  );
};

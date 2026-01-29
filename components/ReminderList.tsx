import React, { memo } from 'react';
import { Reminder } from '../types';
import { IconCheck, IconCircle, IconTrash, IconTag, IconRepeat } from './Icons';
import { formatDate } from '../utils';
import { AlertTriangle, MapPin } from 'lucide-react';

interface ReminderListProps {
  reminders: Reminder[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  title?: string;
}

// Optimized List Item Component
const ReminderItem = memo(({ reminder, onToggle, onDelete }: { reminder: Reminder, onToggle: (id: string) => void, onDelete: (id: string) => void }) => (
    <div 
        className={`
            group relative overflow-hidden flex items-center gap-3
            glass-card rounded-2xl p-4 transition-all duration-300
            ${reminder.isCompleted ? 'opacity-50 bg-gray-50' : 'opacity-100'}
            ${reminder.priority === 'critical' && !reminder.isCompleted ? 'border-l-4 border-l-red-500 bg-red-50/30' : ''}
        `}
        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 80px' }} // HIGH PERFORMANCE TRICK
    >
        <button 
            onClick={() => onToggle(reminder.id)}
            className="flex-shrink-0"
        >
            {reminder.isCompleted ? (
                <IconCheck className="w-6 h-6 text-accent fill-accent/10" />
            ) : reminder.priority === 'critical' ? (
                <div className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center animate-pulse">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
            ) : (
                <IconCircle className="w-6 h-6 text-gray-300 hover:text-accent transition-colors" />
            )}
        </button>

        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <h3 className={`font-medium text-[17px] truncate ${reminder.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {reminder.title}
                </h3>
                {reminder.priority === 'critical' && !reminder.isCompleted && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-1">
                {(reminder.date || reminder.time) && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                        reminder.date && reminder.date < new Date() && !reminder.isCompleted 
                        ? 'text-red-500' 
                        : 'text-gray-500'
                    }`}>
                        {reminder.date && <span className="flex items-center gap-1">{formatDate(new Date(reminder.date))}</span>}
                        {reminder.time && <span className="flex items-center gap-1">{reminder.time}</span>}
                    </div>
                )}

                {reminder.recurrence && (
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                            <IconRepeat className="w-3 h-3" />
                            <span className="capitalize">{reminder.recurrence}</span>
                        </div>
                )}

                {reminder.location && (
                        <div className="flex items-center gap-1 text-xs font-medium text-blue-500">
                            <MapPin className="w-3 h-3" />
                            <span>{reminder.location.name}</span>
                        </div>
                )}
                
                {reminder.tags.map(tagId => (
                    <span key={tagId} className="text-xs font-semibold text-purple bg-purple-light px-2 py-0.5 rounded-full flex items-center gap-1">
                        <IconTag className="w-3 h-3" /> {tagId}
                    </span>
                ))}
            </div>
        </div>

        <button 
            onClick={() => onDelete(reminder.id)}
            className="p-2 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
            <IconTrash className="w-4 h-4" />
        </button>
    </div>
));

export const ReminderList: React.FC<ReminderListProps> = memo(({ 
  reminders, 
  onToggle, 
  onDelete,
  title
}) => {
  if (reminders.length === 0) return null;

  return (
    <div className="w-full mb-6">
      {title && <h3 className="text-sm font-semibold text-gray-400 mb-3 px-1 uppercase tracking-wider">{title}</h3>}
      <div className="flex flex-col gap-3">
        {reminders.map((reminder) => (
            <ReminderItem 
                key={reminder.id} 
                reminder={reminder} 
                onToggle={onToggle} 
                onDelete={onDelete} 
            />
        ))}
      </div>
    </div>
  );
});
import React, { useState, useEffect } from 'react';
import { ArrowUp, Delete, CornerDownLeft, Smile, Keyboard as KeyboardIcon } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  isVisible: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ 
  onKeyPress, 
  onDelete, 
  onSubmit, 
  isVisible 
}) => {
  const [isCaps, setIsCaps] = useState(false);
  const [view, setView] = useState<'ABC' | '123' | 'EMOJI'>('ABC');
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isVisible) {
      setActiveKey(null);
      setView('ABC');
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const rowsABC = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 
    ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
    ['123', 'emoji', 'space', 'return']
  ];

  const rows123 = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
    ['#+=', '.', ',', '?', '!', "'", 'backspace'],
    ['ABC', 'emoji', 'space', 'return']
  ];

  const currentLayout = view === 'ABC' || view === 'EMOJI' ? rowsABC : rows123;

  const handleTouchStart = (key: string) => {
    setActiveKey(key);
    if (navigator.vibrate) navigator.vibrate(5);
  };

  const handleTouchEnd = (key: string, e?: React.TouchEvent | React.MouseEvent) => {
    if (e) e.preventDefault(); 
    setActiveKey(null);
    handleKeyClick(key);
  };

  const handleKeyClick = (key: string) => {
    if (key === 'shift') {
      setIsCaps(!isCaps);
    } else if (key === 'backspace') {
      onDelete();
    } else if (key === '123') {
      setView('123');
    } else if (key === 'ABC') {
      setView('ABC');
    } else if (key === 'emoji') {
       setView(prev => prev === 'EMOJI' ? 'ABC' : 'EMOJI');
    } else if (key === 'space') {
      onKeyPress(' ');
    } else if (key === 'return') {
      onSubmit();
    } else {
      onKeyPress(isCaps ? key.toUpperCase() : key);
      if (isCaps) setIsCaps(false); 
    }
  };

  // If Emoji View is active, we render the EmojiPicker INSTEAD of the keys
  if (view === 'EMOJI') {
      return (
        <div className={`fixed bottom-0 left-0 w-full z-50 transition-transform duration-300 ease-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
             <div className="glass-keyboard shadow-2xl relative pb-8">
                 <EmojiPicker onSelect={(emoji) => onKeyPress(emoji)} />
                 
                 {/* Bottom Bar to Switch Back */}
                 <div className="bg-white/40 backdrop-blur-md p-2 flex items-center justify-between border-t border-white/20">
                     <button onClick={() => setView('ABC')} className="p-2 rounded-xl bg-white/70 shadow-sm text-sm font-semibold px-4 flex items-center gap-2 active:scale-95 transition-transform text-gray-700">
                         <KeyboardIcon className="w-4 h-4" /> ABC
                     </button>
                     <button onClick={onDelete} className="p-2 rounded-xl bg-white/70 shadow-sm text-gray-800 px-6 active:scale-95 transition-transform">
                         <Delete className="w-5 h-5" />
                     </button>
                 </div>
             </div>
        </div>
      );
  }

  return (
    <div className={`fixed bottom-0 left-0 w-full z-50 transition-transform duration-300 ease-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      
      {/* Keyboard Container */}
      <div className="glass-keyboard shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-8 pt-3 relative select-none">
          
          <div className="max-w-md mx-auto flex flex-col gap-3 px-1.5">
            {currentLayout.map((row, rowIndex) => (
              <div key={rowIndex} className={`flex justify-center w-full ${rowIndex === 1 ? 'px-5' : 'gap-1.5'}`}>
                
                {row.map((key) => {
                  const isSpecial = ['shift', 'backspace', '123', 'ABC', '#+=', 'return', 'emoji', 'space'].includes(key);
                  const isPressed = activeKey === key;
                  
                  // Width Calc
                  let widthClass = 'flex-1';
                  if (key === 'space') widthClass = 'flex-[5]'; 
                  else if (['shift', 'backspace', '123', 'ABC', '#+=', 'return', 'emoji'].includes(key)) widthClass = 'flex-[1.5]';

                  let content: React.ReactNode = isCaps && !isSpecial ? key.toUpperCase() : key;
                  
                  // Icons
                  if (key === 'shift') content = <ArrowUp className={`w-5 h-5 ${isCaps ? 'fill-black text-black' : 'text-gray-800'}`} />;
                  if (key === 'backspace') content = <Delete className="w-6 h-6 fill-gray-800 text-gray-800" />;
                  if (key === 'return') content = <CornerDownLeft className="w-5 h-5" />;
                  if (key === 'emoji') content = <Smile className="w-6 h-6 text-gray-600" />;
                  if (key === '123' || key === 'ABC') content = <span className="text-[15px] font-semibold tracking-wide text-gray-700">{key}</span>;
                  if (key === 'space') content = ' ';

                  // Key Background Styles (Glassmorphic)
                  const keyBaseStyle = "backdrop-blur-sm transition-all duration-100 shadow-key border-b border-white/20";
                  const keyDefault = "bg-white/80 hover:bg-white text-gray-900";
                  const keySpecial = "bg-gray-200/50 hover:bg-gray-200/70 text-gray-800";
                  const keyAction = "bg-[#007AFF]/90 hover:bg-[#007AFF] text-white";
                  const keyPressed = "bg-white scale-95 shadow-none";

                  let styleClass = keyDefault;
                  if (key === 'return') styleClass = keyAction;
                  else if (isSpecial && key !== 'space') styleClass = keySpecial;
                  
                  if (isPressed) styleClass = keyPressed;

                  return (
                    <div key={key} className={`${widthClass} relative flex justify-center`}>
                        {/* THE POP-UP BUBBLE ANIMATION (iOS Style) */}
                        {isPressed && !isSpecial && (
                            <div className="absolute bottom-[45px] left-1/2 -translate-x-1/2 w-[62px] h-[72px] pointer-events-none z-[100] animate-bounce-slight">
                                <div className="w-full h-full relative">
                                    <div className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg flex items-center justify-center -mb-2 pb-2 border border-white/50">
                                        <span className="text-[34px] font-normal text-black">{content}</span>
                                    </div>
                                    <svg className="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-[62px] h-[30px]" viewBox="0 0 62 30" fill="rgba(255,255,255,0.9)">
                                        <path d="M16,0 Q16,20 31,25 Q46,20 46,0 Z" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        <button
                        onMouseDown={() => handleTouchStart(key)}
                        onMouseUp={(e) => handleTouchEnd(key, e)}
                        onMouseLeave={() => setActiveKey(null)}
                        onTouchStart={(e) => { e.preventDefault(); handleTouchStart(key); }}
                        onTouchEnd={(e) => { handleTouchEnd(key, e); }}
                        className={`
                            w-full h-[46px] rounded-[8px] flex items-center justify-center text-[22px] font-normal
                            font-sans select-none ${keyBaseStyle} ${styleClass}
                            ${rowIndex === 1 ? 'mx-[3px]' : ''}
                        `}
                        >
                        {content}
                        </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

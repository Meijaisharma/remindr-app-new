
import React, { useState } from 'react';
import { Delete, History, Equal, Divide, X, Minus, Plus, Percent } from 'lucide-react';

export const CalculatorView = () => {
  const [current, setCurrent] = useState('0');
  const [equation, setEquation] = useState('');
  const [shouldReset, setShouldReset] = useState(false);
  const [activeOp, setActiveOp] = useState<string | null>(null);

  const format = (num: string) => {
    if (num === 'Error') return 'Error';
    if (!num) return '0';
    // Split decimal to format integer part only
    const [int, dec] = num.split('.');
    const formattedInt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return dec !== undefined ? `${formattedInt}.${dec}` : formattedInt;
  };

  const handleNum = (num: string) => {
    if (shouldReset) {
      setCurrent(num);
      setShouldReset(false);
      setActiveOp(null);
    } else {
      if (num === '.' && current.includes('.')) return;
      const newVal = current === '0' && num !== '.' ? num : current + num;
      if (newVal.length > 12) return; // Limit length
      setCurrent(newVal);
    }
  };

  const handleOp = (op: string) => {
    if (activeOp && !shouldReset) {
      // Chaining operators (e.g. 5 + 5 + ...)
      calculate(op);
    } else {
      setEquation(`${current} ${op}`);
      setShouldReset(true);
    }
    setActiveOp(op);
  };

  const calculate = (nextOp: string | null = null) => {
    if (!equation && !activeOp) return;
    
    // Parse equation "123 +"
    const parts = equation.split(' ');
    const prev = parseFloat(parts[0]);
    const curr = parseFloat(current);
    const op = parts[1]; // The operator

    if (isNaN(prev) || isNaN(curr)) return;

    let res = 0;
    switch (op) {
      case '+': res = prev + curr; break;
      case '-': res = prev - curr; break;
      case '×': res = prev * curr; break;
      case '÷': res = curr === 0 ? NaN : prev / curr; break;
      default: return;
    }

    const resStr = isNaN(res) || !isFinite(res) ? 'Error' : String(Number(res.toPrecision(10)));
    setCurrent(resStr);
    
    if (nextOp) {
      setEquation(`${resStr} ${nextOp}`);
      setActiveOp(nextOp);
      setShouldReset(true);
    } else {
      setEquation(''); // Clear equation on equals
      setActiveOp(null);
      setShouldReset(true);
    }
  };

  const handleClear = () => {
    setCurrent('0');
    setEquation('');
    setActiveOp(null);
    setShouldReset(false);
  };

  const handleSign = () => {
    setCurrent(String(parseFloat(current) * -1));
  };

  const handlePercent = () => {
    setCurrent(String(parseFloat(current) / 100));
  };

  // Button Component
  const Btn = ({ label, type = 'num', onClick, isActive }: any) => {
    // Styles
    const baseStyle = "h-16 sm:h-20 w-full rounded-[20px] text-2xl font-medium flex items-center justify-center transition-all duration-100 active:scale-95 shadow-sm border border-white/5";
    
    let colorStyle = "bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"; // num
    if (type === 'op') colorStyle = isActive ? "bg-accent text-white ring-2 ring-accent ring-offset-2 dark:ring-offset-gray-900" : "bg-accent/10 dark:bg-accent/20 text-accent hover:bg-accent/20";
    if (type === 'top') colorStyle = "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white";
    if (type === 'eq') colorStyle = "bg-accent text-white shadow-lg shadow-accent/40";
    
    return (
      <button onClick={onClick} className={`${baseStyle} ${colorStyle}`}>
        {label}
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col px-4 pb-4 max-w-lg mx-auto w-full">
       
       {/* DISPLAY SCREEN */}
       <div className="flex-1 flex flex-col justify-end items-end p-6 mb-4 rounded-[32px] bg-gray-50 dark:bg-gray-800/80 shadow-inner border border-gray-100 dark:border-gray-700 transition-colors">
          
          {/* Top Line: Equation History */}
          <div className="h-8 text-gray-400 dark:text-gray-500 font-medium text-lg tracking-wide flex items-center gap-2 mb-1">
             {equation}
          </div>

          {/* Main Line: Current Input/Result */}
          <div className="text-6xl font-light tracking-tight text-gray-900 dark:text-white transition-all break-all text-right leading-none">
             {format(current)}
          </div>

       </div>

       {/* KEYPAD */}
       <div className="grid grid-cols-4 gap-3 sm:gap-4">
          <Btn label="AC" type="top" onClick={handleClear} />
          <Btn label="±" type="top" onClick={handleSign} />
          <Btn label="%" type="top" onClick={handlePercent} />
          <Btn label={<Divide className="w-6 h-6"/>} type="op" isActive={activeOp === '÷'} onClick={() => handleOp('÷')} />

          <Btn label="7" onClick={() => handleNum('7')} />
          <Btn label="8" onClick={() => handleNum('8')} />
          <Btn label="9" onClick={() => handleNum('9')} />
          <Btn label={<X className="w-6 h-6"/>} type="op" isActive={activeOp === '×'} onClick={() => handleOp('×')} />

          <Btn label="4" onClick={() => handleNum('4')} />
          <Btn label="5" onClick={() => handleNum('5')} />
          <Btn label="6" onClick={() => handleNum('6')} />
          <Btn label={<Minus className="w-6 h-6"/>} type="op" isActive={activeOp === '-'} onClick={() => handleOp('-')} />

          <Btn label="1" onClick={() => handleNum('1')} />
          <Btn label="2" onClick={() => handleNum('2')} />
          <Btn label="3" onClick={() => handleNum('3')} />
          <Btn label={<Plus className="w-6 h-6"/>} type="op" isActive={activeOp === '+'} onClick={() => handleOp('+')} />

          <Btn label="0" onClick={() => handleNum('0')} /> {/* Expanded 0 removed to keep grid uniform, usually 0 spans 2 cols but grid-cols-4 makes it hard without span class. Let's keep uniform for consistency or add span */}
          <Btn label="." onClick={() => handleNum('.')} />
          <Btn label={<Delete className="w-6 h-6"/>} onClick={() => setCurrent(current.length > 1 ? current.slice(0, -1) : '0')} />
          <Btn label={<Equal className="w-7 h-7"/>} type="eq" onClick={() => calculate()} />
       </div>
    </div>
  );
};

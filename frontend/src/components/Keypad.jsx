import { useState } from 'react';

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['Clear', '0', 'Enter'],
];

export default function Keypad({ value, onChange, onSubmit, disabled }) {
  const [pressed, setPressed] = useState(null);

  const handleKey = (k) => {
    if (k === 'Clear') {
      onChange('');
      return;
    }
    if (k === 'Enter') {
      onSubmit?.();
      return;
    }
    onChange(value + k);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.flat().map((k) => (
        <button
          key={k}
          type="button"
          disabled={disabled && k !== 'Clear'}
          onMouseDown={() => setPressed(k)}
          onMouseUp={() => setPressed(null)}
          onMouseLeave={() => setPressed(null)}
          onClick={() => handleKey(k)}
          className={`
            py-4 rounded-xl font-orbitron font-semibold text-lg
            transition-all duration-100 select-none
            ${k === 'Clear'
              ? 'bg-amber-600/80 hover:bg-amber-600 text-white shadow-keypad'
              : k === 'Enter'
              ? 'bg-atm-neon hover:bg-atm-neon-dim text-atm-dark shadow-keypad'
              : 'bg-slate-700 hover:bg-slate-600 text-white shadow-keypad'
            }
            ${pressed === k ? 'scale-95 shadow-inner' : 'hover:scale-[1.02]'}
          `}
        >
          {k}
        </button>
      ))}
    </div>
  );
}

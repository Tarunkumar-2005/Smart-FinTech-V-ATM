import { useState } from 'react';

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['Clear', '0', 'Enter'],
];

const keyBase =
  'aspect-square min-w-[52px] md:min-w-[64px] rounded-lg font-mono text-lg md:text-xl font-semibold ' +
  'transition-transform duration-75 select-none shadow-[0_4px_0_0_rgba(0,0,0,0.3)] active:scale-95';

export default function ATMKeypad({
  value,
  onChange,
  onSubmit,
  masked = false,
  maxLength = 10,
  disabled = false,
}) {
  const [pressed, setPressed] = useState(null);

  const handleKey = (k) => {
    if (disabled) return;
    if (k === 'Clear') {
      onChange('');
      return;
    }
    if (k === 'Enter') {
      onSubmit?.();
      return;
    }
    const next = (value || '') + k;
    if (next.length <= maxLength) onChange(next);
  };

  const displayValue = masked && value ? '*'.repeat(value.length) : (value || '');

  const getKeyClass = (k) => {
    if (k === 'Clear') return `${keyBase} bg-red-600 hover:bg-red-500 text-white`;
    if (k === 'Enter') return `${keyBase} bg-emerald-600 hover:bg-emerald-500 text-white`;
    return `${keyBase} bg-slate-500 hover:bg-slate-400 text-white`;
  };

  const keys = KEYS.flat();

  return (
    <div className="space-y-3">
      <div className="bg-slate-800 rounded-lg px-4 py-3 font-mono text-xl text-emerald-200 min-h-[48px] flex items-center justify-end">
        {displayValue || '\u00A0'}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            disabled={disabled && k !== 'Clear' && k !== 'Cancel'}
            onMouseDown={() => setPressed(k)}
            onMouseUp={() => setPressed(null)}
            onMouseLeave={() => setPressed(null)}
            onClick={() => handleKey(k)}
            className={`${getKeyClass(k)} ${pressed === k ? 'scale-95' : ''}`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

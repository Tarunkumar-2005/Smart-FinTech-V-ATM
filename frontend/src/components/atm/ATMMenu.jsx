const btnBase =
  'w-full py-3 px-3 rounded-lg font-mono text-sm font-semibold transition-all duration-100 ' +
  'shadow-[0_4px_0_0_rgba(0,0,0,0.25)] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.25)] hover:translate-y-0.5 ' +
  'active:shadow-none active:translate-y-1 disabled:opacity-50';

export default function ATMMenu({ options, onSelect, disabled }) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(opt.id)}
          className={`${btnBase} ${opt.primary ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-500 hover:bg-slate-400 text-white'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

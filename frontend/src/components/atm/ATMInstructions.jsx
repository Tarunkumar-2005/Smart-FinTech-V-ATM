const STEPS = [
  { step: 1, text: 'Insert card to start ATM session.' },
  { step: 2, text: 'Enter your secure 4-digit PIN.' },
  { step: 3, text: 'Choose the transaction you want.' },
  { step: 4, text: 'Follow on-screen instructions.' },
];

const TIPS = [
  'Never share your PIN with anyone.',
  'Always collect your card after use.',
  'Check balance after withdrawal.',
];

export default function ATMInstructions({ visible, onClose }) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 rounded-xl p-4">
      <div className="bg-slate-800 rounded-xl border-2 border-emerald-700 max-w-sm w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-emerald-400 font-mono font-semibold text-lg">Guided Training</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <p className="text-slate-400 text-sm mb-4">Steps to use the ATM:</p>
        <ol className="space-y-2 mb-6">
          {STEPS.map((s) => (
            <li key={s.step} className="flex gap-2 text-emerald-100 text-sm">
              <span className="text-emerald-500 font-mono font-bold">Step {s.step}:</span>
              <span>{s.text}</span>
            </li>
          ))}
        </ol>
        <p className="text-slate-400 text-sm mb-2">Safety tips:</p>
        <ul className="space-y-1 mb-6 text-slate-300 text-sm list-disc list-inside">
          {TIPS.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-sm"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

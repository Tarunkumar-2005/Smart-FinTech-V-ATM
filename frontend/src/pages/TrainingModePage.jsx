import { Link } from 'react-router-dom';

const STEPS = [
  { step: 1, title: 'Insert card', text: 'Insert card to start ATM session.' },
  { step: 2, title: 'Enter PIN', text: 'Enter your secure 4-digit PIN.' },
  { step: 3, title: 'Choose transaction', text: 'Choose the transaction you want.' },
  { step: 4, title: 'Follow instructions', text: 'Follow on-screen instructions.' },
];

const TIPS = [
  'Never share your PIN with anyone.',
  'Always collect your card after use.',
  'Check balance after withdrawal.',
];

const SECTIONS = [
  { title: 'What is an ATM?', content: 'ATM (Automated Teller Machine) is an electronic banking terminal that allows you to perform financial transactions without visiting a bank branch. You can withdraw cash, deposit money, check your balance 24/7 using your card and PIN.' },
  { title: 'What is a PIN?', content: 'PIN (Personal Identification Number) is a 4-digit secret code. Never share your PIN with anyone. Memorize it and never write it on your card.' },
  { title: 'Daily Withdrawal Limit', content: 'Banks set a daily limit (e.g., ₹10,000) on how much you can withdraw per day. This protects you if your card is lost or stolen.' },
  { title: 'Digital Banking Safety', content: ['Never share PIN, OTP, or card details.', 'Use ATMs in well-lit, secure locations.', 'Cover the keypad when entering PIN.', 'Enable transaction alerts.'] },
];

export default function TrainingModePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-4 flex justify-between items-center">
        <h1 className="text-emerald-400 font-mono font-semibold text-xl">Guided Training Mode</h1>
        <Link to="/login" className="text-slate-400 hover:text-emerald-400 text-sm font-mono transition">
          ← Back to Login
        </Link>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-8 pb-12">
        <p className="text-slate-500 text-center font-mono text-sm">
          Learn the basics of ATMs and use the simulator with confidence
        </p>

        <div className="rounded-xl bg-slate-800 border border-emerald-800 p-6">
          <h2 className="text-emerald-400 font-mono font-semibold text-lg mb-4">Steps to use the ATM</h2>
          <ol className="space-y-3">
            {STEPS.map((s) => (
              <li key={s.step} className="flex gap-3 text-slate-300 text-sm">
                <span className="text-emerald-500 font-mono font-bold shrink-0">Step {s.step}:</span>
                <span><strong className="text-slate-200">{s.title}</strong> — {s.text}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl bg-slate-800 border border-amber-800 p-6">
          <h2 className="text-amber-400 font-mono font-semibold text-lg mb-3">Safety tips</h2>
          <ul className="space-y-2 text-slate-300 text-sm list-disc list-inside">
            {TIPS.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>

        {SECTIONS.map((s, i) => (
          <div key={i} className="rounded-xl bg-slate-800 border border-slate-700 p-6">
            <h2 className="text-emerald-400 font-mono font-semibold text-lg mb-3">{s.title}</h2>
            {Array.isArray(s.content) ? (
              <ul className="space-y-2 text-slate-300 text-sm list-disc list-inside">
                {s.content.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed">{s.content}</p>
            )}
          </div>
        ))}

        <div className="text-center">
          <Link
            to="/atm"
            className="inline-block py-3 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-semibold transition"
          >
            Try ATM Simulator →
          </Link>
        </div>
      </main>
    </div>
  );
}

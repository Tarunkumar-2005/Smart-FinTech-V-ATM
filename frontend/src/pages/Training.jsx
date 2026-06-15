import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'What is an ATM?',
    content:
      'ATM (Automated Teller Machine) is an electronic banking terminal that allows you to perform financial transactions without visiting a bank branch. You can withdraw cash, deposit money, check your balance, and transfer funds 24/7 using your debit card and PIN.',
  },
  {
    title: 'What is a PIN?',
    content:
      'PIN (Personal Identification Number) is a 4-digit secret code that identifies you as the rightful owner of your bank account. Never share your PIN with anyone—not even bank staff. Memorize it and never write it on your card or store it in your phone.',
  },
  {
    title: 'What is the Daily Withdrawal Limit?',
    content:
      'Banks set a daily limit (e.g., ₹10,000) on how much cash you can withdraw from an ATM per day. This protects you from large unauthorized transactions if your card is lost or stolen. The limit resets at midnight.',
  },
  {
    title: 'Importance of Saving',
    content:
      'Saving money helps you build a financial safety net for emergencies, achieve life goals (education, home, retirement), and avoid debt. Start with small amounts—even 10% of your income—and increase over time. "Pay yourself first" by saving before spending.',
  },
  {
    title: 'Digital Banking Safety Tips',
    content: [
      'Never share your PIN, OTP, or card details with anyone.',
      'Use ATMs in well-lit, secure locations.',
      'Cover the keypad when entering your PIN.',
      'Check for skimming devices before inserting your card.',
      'Enable transaction alerts and monitor your account regularly.',
      'Use strong, unique passwords for online banking.',
      'Avoid using public Wi-Fi for banking transactions.',
      'Log out of banking apps when finished.',
    ],
  },
];

export default function Training() {
  return (
    <div className="min-h-screen bg-atm-dark text-slate-200">
      <header className="bg-atm-panel border-b border-slate-700 px-4 py-4 flex justify-between items-center">
        <h1 className="text-atm-neon font-orbitron font-semibold text-xl">
          Financial Literacy Training
        </h1>
        <Link
          to="/login"
          className="text-slate-400 hover:text-atm-neon text-sm transition"
        >
          ← Back to Login
        </Link>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-8 pb-12">
        <p className="text-slate-500 text-center">
          Learn the basics of ATMs and digital banking safety
        </p>

        {sections.map((s, i) => (
          <div
            key={i}
            className="rounded-xl bg-atm-panel border border-slate-700 p-6 shadow-lg"
          >
            <h2 className="text-atm-neon font-orbitron font-semibold text-lg mb-3">
              {s.title}
            </h2>
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
      </main>
    </div>
  );
}

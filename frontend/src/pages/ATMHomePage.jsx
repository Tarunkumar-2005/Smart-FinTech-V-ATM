import { useState } from 'react';
import { Link } from 'react-router-dom';
import ATMFrame from '../components/atm/ATMFrame';
import ATMTransactionFlow from '../components/atm/ATMTransactionFlow';
import ATMInstructions from '../components/atm/ATMInstructions';
import { ATMStateProvider } from '../context/ATMStateContext';

export default function ATMHomePage() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <ATMStateProvider>
      <ATMFrame>
        <div className="relative p-4 md:p-6 bg-slate-800/80">
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={() => setShowHelp(true)}
              className="text-slate-400 hover:text-emerald-400 text-sm font-mono transition"
            >
              Need help?
            </button>
            <Link
              to="/login"
              className="text-slate-400 hover:text-white text-sm font-mono transition"
            >
              ← Back to Login
            </Link>
          </div>
          <div className="relative">
            <ATMTransactionFlow />
            <ATMInstructions visible={showHelp} onClose={() => setShowHelp(false)} />
          </div>
        </div>
      </ATMFrame>
    </ATMStateProvider>
  );
}

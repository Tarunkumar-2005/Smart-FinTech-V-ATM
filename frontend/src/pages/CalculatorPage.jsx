import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Calculator, Percent, IndianRupee, Clock, ChevronRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import UserSettingsMenu from '../components/UserSettingsMenu';

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState('fd'); // 'fd' | 'loan'

  // FD State
  const [fdPrincipal, setFdPrincipal] = useState('');
  const [fdRate, setFdRate] = useState('');
  const [fdTime, setFdTime] = useState('');
  const [fdFrequency, setFdFrequency] = useState('1'); // n (compounding times per year)
  const [fdResult, setFdResult] = useState(null);

  // Loan State
  const [loanPrincipal, setLoanPrincipal] = useState('');
  const [loanRate, setLoanRate] = useState('');
  const [loanDuration, setLoanDuration] = useState('');
  const [loanResult, setLoanResult] = useState(null);

  // Calculate FD
  useEffect(() => {
    const P = parseFloat(fdPrincipal);
    const r = parseFloat(fdRate) / 100; // annual rate in decimal
    const t = parseFloat(fdTime);
    const n = parseFloat(fdFrequency);

    if (P > 0 && r >= 0 && t > 0 && n > 0) {
      // M = P × (1 + r/n)^(n × t)
      const amount = P * Math.pow(1 + r / n, n * t);
      setFdResult(amount);
    } else {
      setFdResult(null);
    }
  }, [fdPrincipal, fdRate, fdTime, fdFrequency]);

  // Calculate EMI
  useEffect(() => {
    const P = parseFloat(loanPrincipal);
    const annualRate = parseFloat(loanRate);
    const N = parseFloat(loanDuration); // in months

    if (P > 0 && annualRate >= 0 && N > 0) {
      if (annualRate === 0) {
        setLoanResult(P / N);
      } else {
        const R = annualRate / 12 / 100; // monthly interest rate
        // EMI = [P × R × (1 + R)^N] / [(1 + R)^N – 1]
        const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
        setLoanResult(emi);
      }
    } else {
      setLoanResult(null);
    }
  }, [loanPrincipal, loanRate, loanDuration]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-950 transition-colors duration-300 flex flex-col">
      {/* ── Top Nav ── */}
      <header className="bg-white dark:bg-slate-900 border-b border-blue-100 dark:border-slate-800 shadow-sm sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              <Home size={16} /> <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <ChevronRight size={14} className="text-gray-400" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                <Calculator size={14} className="text-white" />
              </div>
              <span className="font-bold text-gray-800 dark:text-white tracking-wide">
                Financial Calculators
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserSettingsMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-blue-50 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-6 sm:p-8 text-white">
            <h1 className="text-2xl sm:text-3xl font-black mb-2 flex items-center gap-3">
              <Calculator size={28} />
              Plan Your Finances
            </h1>
            <p className="text-blue-100 text-sm">
              Estimate your fixed deposit returns and loan monthly payments using standard banking formulas.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('fd')}
              className={`flex-1 py-4 font-semibold text-sm transition-colors ${
                activeTab === 'fd'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'
              }`}
            >
              Fixed Deposit (FD)
            </button>
            <button
              onClick={() => setActiveTab('loan')}
              className={`flex-1 py-4 font-semibold text-sm transition-colors ${
                activeTab === 'loan'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'
              }`}
            >
              Loan EMI
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'fd' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Principal */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Principal Amount (P)
                    </label>
                    <div className="relative">
                      <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={fdPrincipal}
                        onChange={(e) => setFdPrincipal(e.target.value)}
                        placeholder="e.g. 50000"
                        min="0"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Annual Interest Rate (r)
                    </label>
                    <div className="relative">
                      <Percent size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={fdRate}
                        onChange={(e) => setFdRate(e.target.value)}
                        placeholder="e.g. 6.5"
                        min="0"
                        step="0.1"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Time in Years (t)
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={fdTime}
                        onChange={(e) => setFdTime(e.target.value)}
                        placeholder="e.g. 5"
                        min="0"
                        step="0.5"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Compounding Frequency */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Compounding (n)
                    </label>
                    <select
                      value={fdFrequency}
                      onChange={(e) => setFdFrequency(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all outline-none appearance-none"
                    >
                      <option value="1">Yearly (n=1)</option>
                      <option value="2">Half-Yearly (n=2)</option>
                      <option value="4">Quarterly (n=4)</option>
                      <option value="12">Monthly (n=12)</option>
                    </select>
                  </div>
                </div>

                {/* Formula display */}
                <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-700 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">Formula: M = P × (1 + r/n)<sup className="-top-1 relative">(n×t)</sup></p>
                </div>

                {/* Result */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl p-6 text-center shadow-inner">
                  <p className="text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-wider mb-2">
                    Maturity Amount
                  </p>
                  <p className="text-4xl font-black text-green-600 dark:text-green-500 tracking-tight">
                    {fdResult !== null ? `₹${fdResult.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '₹0'}
                  </p>
                  {fdResult !== null && (
                    <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-2">
                      Interest Earned: ₹{(fdResult - parseFloat(fdPrincipal)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'loan' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Loan Amount */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Loan Amount (P)
                    </label>
                    <div className="relative">
                      <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={loanPrincipal}
                        onChange={(e) => setLoanPrincipal(e.target.value)}
                        placeholder="e.g. 500000"
                        min="0"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Annual Interest Rate (%)
                    </label>
                    <div className="relative">
                      <Percent size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={loanRate}
                        onChange={(e) => setLoanRate(e.target.value)}
                        placeholder="e.g. 9.5"
                        min="0"
                        step="0.1"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Duration in Months (n)
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={loanDuration}
                        onChange={(e) => setLoanDuration(e.target.value)}
                        placeholder="e.g. 60"
                        min="0"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Formula display */}
                <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-700 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">Formula: EMI = [P × r × (1 + r)<sup className="-top-1 relative">n</sup>] / [(1 + r)<sup className="-top-1 relative">n</sup> - 1]</p>
                </div>

                {/* Result */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-6 text-center shadow-inner">
                  <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2">
                    Monthly EMI
                  </p>
                  <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                    {loanResult !== null ? `₹${loanResult.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '₹0'}
                  </p>
                  {loanResult !== null && (
                    <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-2">
                      Total Payable: ₹{(loanResult * parseFloat(loanDuration)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

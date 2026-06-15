import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(accountNumber)) return toast.error('Account number must be 10 digits');
    if (!/^\d{4}$/.test(pin)) return toast.error('PIN must be exactly 4 digits');
    setLoading(true);
    try {
      const { data } = await login(accountNumber, pin);
      toast.success(data.message);
      const path = data.data?.role === 'admin' ? '/admin' : '/dashboard';
      setTimeout(() => navigate(path), 0);
    } catch (err) {
      const msg = err.response?.data?.message
        || (err.code === 'ERR_NETWORK' ? 'Cannot reach backend. Run: cd backend && npm run dev' : 'Login failed');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-atm-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-atm-panel shadow-atm border border-slate-700 p-8">
        <h1 className="text-2xl font-orbitron font-semibold text-atm-neon text-center mb-2">
          Smart ATM
        </h1>
        <p className="text-slate-500 text-center text-sm mb-6">Enter your credentials</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-sm mb-1">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full bg-atm-dark border border-slate-600 rounded-lg px-4 py-3 text-white font-mono focus:border-atm-neon focus:ring-1 focus:ring-atm-neon outline-none"
              placeholder="10-digit account number"
              maxLength={10}
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">4-Digit PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full bg-atm-dark border border-slate-600 rounded-lg px-4 py-3 text-white font-mono focus:border-atm-neon focus:ring-1 focus:ring-atm-neon outline-none"
              placeholder="••••"
              maxLength={4}
              inputMode="numeric"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-atm-neon hover:bg-atm-neon-dim text-atm-dark font-semibold transition hover:shadow-atm-glow disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
        <p className="text-slate-500 text-center mt-6 text-sm">
          New user?{' '}
          <Link to="/register" className="text-atm-neon hover:underline">Register</Link>
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-3 text-sm">
          <Link to="/atm" className="text-slate-500 hover:text-atm-neon transition">
            Use ATM Simulator →
          </Link>
          <Link to="/training" className="text-slate-500 hover:text-atm-neon transition">
            Financial Literacy →
          </Link>
          <Link to="/training-mode" className="text-slate-500 hover:text-atm-neon transition">
            Guided Training →
          </Link>
        </div>
      </div>
    </div>
  );
}

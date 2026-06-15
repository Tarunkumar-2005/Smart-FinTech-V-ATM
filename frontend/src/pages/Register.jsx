import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');
    if (!/^\d{4}$/.test(pin)) return toast.error('PIN must be exactly 4 digits');
    setLoading(true);
    try {
      const { data } = await register(name.trim(), pin);
      toast.success(data.message);
      const path = data.data?.role === 'admin' ? '/admin' : '/atm';
      setTimeout(() => navigate(path), 0);
    } catch (err) {
      const msg = err.response?.data?.message
        || (err.code === 'ERR_NETWORK' ? 'Cannot reach backend. Run: cd backend && npm run dev' : 'Registration failed');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-atm-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-atm-panel shadow-atm border border-slate-700 p-8">
        <h1 className="text-2xl font-orbitron font-semibold text-atm-neon text-center mb-6">
          Create Account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-sm mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-atm-dark border border-slate-600 rounded-lg px-4 py-3 text-white font-mono focus:border-atm-neon focus:ring-1 focus:ring-atm-neon outline-none transition"
              placeholder="Enter your name"
              maxLength={50}
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
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>
        <p className="text-slate-500 text-center mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-atm-neon hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

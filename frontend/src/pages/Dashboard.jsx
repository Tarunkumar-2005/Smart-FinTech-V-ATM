import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import ProgressTracker from '../components/ProgressTracker';
import DashboardCard from '../components/DashboardCard';
import {
  CreditCard, ArrowRightCircle, Eye, EyeOff, KeyRound,
  Receipt, LogOut, RefreshCw, ShieldCheck, Lightbulb,
  Smartphone, AlertTriangle, BarChart3, User, Copy,
  CheckCheck, X, Lock, Hash, Phone, UserPlus, ChevronRight,
  Banknote, TrendingUp, PiggyBank, BookOpen, Calculator, ShieldAlert
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import UserSettingsMenu from '../components/UserSettingsMenu';
import Confetti from 'react-confetti';

// ─── Financial Tips ───────────────────────────────────────────────────────────
const TIPS = [
  {
    icon: ShieldCheck,
    title: 'Keep your PIN safe',
    body: 'Never share your PIN with anyone — not even bank employees. Memorise it, never write it down.',
    color: 'from-blue-500 to-blue-400',
  },
  {
    icon: AlertTriangle,
    title: 'Beware shoulder-surfers',
    body: 'At the ATM, shield the keypad with your hand when entering your PIN. Always be aware of your surroundings.',
    color: 'from-amber-500 to-orange-400',
  },
  {
    icon: Smartphone,
    title: 'Enable SMS alerts',
    body: 'Register your mobile number with your bank to receive instant transaction alerts and detect fraud quickly.',
    color: 'from-green-500 to-emerald-400',
  },
  {
    icon: BarChart3,
    title: 'Track your spending',
    body: 'Review your mini statement regularly. Spotting unknown transactions early can prevent financial loss.',
    color: 'from-violet-500 to-purple-400',
  },
];

// ─── Masked account number helper ─────────────────────────────────────────────
const maskAccount = (acc) => {
  if (!acc) return '••••••••••';
  return '••••' + acc.slice(-4);
};

// ─── Copy to clipboard helper ─────────────────────────────────────────────────
function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return [copied, copy];
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRATION MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function RegisterModal({ onClose, onLoginSuccess }) {
  const { register } = useAuth();
  const [name, setName]     = useState('');
  const [phone, setPhone]   = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(null); // { accountNumber, name }
  const [copiedAcc, copyAcc]    = useCopyToClipboard();

  // Trap focus / close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim())             return toast.error('Name is required');
    if (phone && !/^\d{10}$/.test(phone.replace(/\D/g, '')))
      return toast.error('Phone must be 10 digits if provided');

    setLoading(true);
    try {
      const data = await register(name.trim(), phone, address);
      const accNum = data.data?.accountNumber;
      setSuccess({ accountNumber: accNum, name: name.trim() });
      toast.success('Account created successfully! 🎉 Please visit ATM to set your PIN.', { duration: 5000 });
    } catch (err) {
      const msg = err.response?.data?.message
        || (err.code === 'ERR_NETWORK'
          ? 'Cannot reach backend — make sure the server is running.'
          : 'Registration failed');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <UserPlus size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Create Account</h2>
              <p className="text-blue-200 text-xs">Smart ATM Banking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {!success ? (
            /* ── Registration Form ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1.5">
                  Full Name <span className="text-blue-600">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    placeholder="Enter your full name"
                    maxLength={50}
                    autoFocus
                  />
                </div>
              </div>

              {/* Phone (optional) */}
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1.5">
                  Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="reg-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* Address (optional) */}
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1.5">
                  Address <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <BookOpen size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <textarea
                    id="reg-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none h-24"
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              <button
                id="reg-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-200 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account…
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Create Account
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ── Success Screen ── */
            <div className="text-center space-y-5">
              {/* Checkmark */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCheck size={32} className="text-green-600" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800">Account Created Successfully!</h3>
                <p className="text-gray-500 text-sm mt-1">Welcome to Smart ATM, {success.name}!</p>
              </div>

              {/* Account Number Display */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">
                  Your Account Number
                </p>
                <p
                  id="new-account-number"
                  className="text-3xl font-black font-mono text-blue-800 tracking-widest mb-4"
                >
                  {success.accountNumber}
                </p>
                <button
                  id="copy-account-number-btn"
                  onClick={() => {
                    copyAcc(success.accountNumber);
                    toast.success('Account number copied!');
                  }}
                  className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all hover:shadow-md"
                >
                  {copiedAcc ? <CheckCheck size={15} /> : <Copy size={15} />}
                  {copiedAcc ? 'Copied!' : 'Copy Account Number'}
                </button>
                <p className="text-[11px] text-blue-400 mt-3">
                  Save this number — you'll need it to log in.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all hover:shadow-md"
                >
                  Go to Dashboard →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GUEST VIEW  (login + register entry)
// ═══════════════════════════════════════════════════════════════════════════════
function GuestView() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin]                     = useState('');
  const [isNewUserLogin, setIsNewUserLogin] = useState(false);
  const [fullName, setFullName]           = useState('');
  const [loading, setLoading]             = useState(false);
  const [showRegister, setShowRegister]   = useState(false);
  const [showPin, setShowPin]             = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(accountNumber)) return toast.error('Account number must be 10 digits');
    if (!isNewUserLogin && !/^\d{4}$/.test(pin)) return toast.error('PIN must be exactly 4 digits');
    if (isNewUserLogin && !fullName.trim()) return toast.error('Full name is required for new user login');
    setLoading(true);
    try {
      const data = await login(accountNumber, isNewUserLogin ? '' : pin, isNewUserLogin ? fullName : '');
      toast.success(data.message || 'Login successful!');
      const path = data.data?.role === 'admin' ? '/admin' : '/dashboard';
      setTimeout(() => navigate(path, { replace: true }), 0);
    } catch (err) {
      const msg = err.response?.data?.message
        || (err.code === 'ERR_NETWORK'
          ? 'Cannot reach backend — make sure the server is running.'
          : 'Login failed');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Brand */}
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <img src="/logo.png" alt="Smart ATM Logo" className="h-16 w-auto object-contain bg-white/10 p-2 rounded-2xl shadow-xl backdrop-blur-md" />
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Smart ATM</h1>
          <p className="text-blue-300 text-sm mt-1">Secure Banking Platform</p>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Welcome back</h2>
            <p className="text-blue-300 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Account Number */}
            <div>
              <label className="block text-blue-200 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                Account Number
              </label>
              <div className="relative">
                <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300" />
                <input
                  id="login-account"
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-10 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/60 font-mono text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 outline-none transition"
                  placeholder="10-digit account number"
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Toggle PIN / Full Name */}
            {isNewUserLogin ? (
              <div>
                <label className="block text-blue-200 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                  Full Name <span className="text-blue-300 font-normal lowercase">(PIN not set)</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300" />
                  <input
                    id="login-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/60 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 outline-none transition"
                    placeholder="Enter full name"
                    autoComplete="name"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-blue-200 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                  4-Digit PIN
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300" />
                  <input
                    id="login-pin"
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full pl-10 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/60 font-mono text-sm tracking-widest focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 outline-none transition"
                    placeholder="••••"
                    maxLength={4}
                    inputMode="numeric"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition"
                    tabIndex={-1}
                  >
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
               <button
                 type="button"
                 onClick={() => setIsNewUserLogin(v => !v)}
                 className="text-xs text-blue-300 hover:text-white transition"
               >
                 {isNewUserLogin ? 'I have a PIN' : 'First time login? (No PIN yet)'}
               </button>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-300 text-white font-bold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying…
                </>
              ) : (
                <>Sign In <ChevronRight size={16} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-blue-300/60 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Register CTA */}
          <button
            id="open-register-modal"
            onClick={() => setShowRegister(true)}
            className="w-full py-3.5 rounded-xl border border-white/20 hover:border-blue-400/60 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            <UserPlus size={16} className="text-blue-300" />
            New User? Create Account
          </button>

          {/* Footer links */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-5 text-xs text-blue-300/60">
            <Link to="/atm"           className="hover:text-blue-300 transition">ATM Simulator →</Link>
            <Link to="/training"      className="hover:text-blue-300 transition">Financial Literacy →</Link>
            <Link to="/training-mode" className="hover:text-blue-300 transition">Guided Training →</Link>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex justify-center gap-3 mt-5 flex-wrap">
          {['🔒 Secure', '⚡ Instant', '🏦 Trusted'].map((feat) => (
            <span key={feat} className="bg-white/10 text-blue-200 text-xs px-3 py-1 rounded-full border border-white/10">
              {feat}
            </span>
          ))}
        </div>
      </div>

      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onLoginSuccess={() => setShowRegister(false)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATED DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function AuthenticatedDashboard() {
  const { user, logout, updateBalance } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance]         = useState(user?.balance ?? 0);
  const [showBalance, setShowBalance] = useState(false);
  const [loadingBal, setLoadingBal]   = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const [showFullAcct, setShowFullAcct] = useState(false);
  const [copiedAcct, copyAcct]          = useCopyToClipboard();
  const idleTimer = useRef(null);

  // ── Celebration Logic ───────────────────────────────────────────────────────
  useEffect(() => {
    if (progressPercent === 100 && !hasCelebrated) {
      const storageKey = `hasCelebrated_${user?.accountNumber || 'default'}`;
      if (!localStorage.getItem(storageKey)) {
        setShowCelebration(true);
        localStorage.setItem(storageKey, 'true');
      }
      setHasCelebrated(true);
    }
  }, [progressPercent, hasCelebrated, user]);

  // ── Session timeout: auto-logout after 10 min inactivity ──────────────────
  useEffect(() => {
    const reset = () => {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        toast('Session expired — you have been logged out.', { icon: '⏱️' });
        logout();
        navigate('/dashboard');
      }, 10 * 60 * 1000);
    };
    const events = ['mousemove', 'keydown', 'click', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      clearTimeout(idleTimer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [logout, navigate]);

  // Sync balance from auth context
  useEffect(() => {
    if (user?.balance !== undefined) setBalance(user.balance);
  }, [user]);

  const handleRefreshBalance = async () => {
    setLoadingBal(true);
    try {
      const { data } = await API.get('/account/balance');
      const b = data.data.balance;
      setBalance(b);
      updateBalance(b);
      setProgressKey((k) => k + 1);
      toast.success('Balance refreshed!');
    } catch {
      toast.error('Failed to fetch balance');
    } finally {
      setLoadingBal(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/dashboard');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-950 transition-colors duration-300">

      {/* ── Top Nav ─────────────────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-slate-900 border-b border-blue-100 dark:border-slate-800 shadow-sm sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Smart ATM Logo" className="h-8 md:h-10 w-auto object-contain rounded-md" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }} />
            <div className="hidden w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 items-center justify-center shadow-sm">
              <CreditCard size={16} className="text-white" />
            </div>
            <span className="font-extrabold bg-gradient-to-r from-blue-700 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent text-lg tracking-wide hidden sm:block">
              Smart ATM
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserSettingsMenu />
          </div>
        </div>
      </header>

      {/* ── Celebration Modal ── */}
      {showCelebration && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden border border-gray-100 dark:border-slate-700">
            <button onClick={() => setShowCelebration(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
              <X size={20} />
            </button>
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
              <CheckCheck size={40} className="text-white" />
            </div>
            <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
              ATM Master
            </span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Congratulations!</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              You have successfully completed the entire ATM Learning Journey! You are now fully equipped with essential banking knowledge.
            </p>
            <button 
              onClick={() => setShowCelebration(false)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md transition-all"
            >
              Continue Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ── Hero Strip ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-md relative overflow-hidden">
        {/* Background glow lines */}
        <div className="absolute top-0 right-0 p-32 bg-blue-400 opacity-20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 p-32 bg-indigo-400 opacity-20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Welcome back 👋</p>
            <h1 className="text-3xl font-black tracking-tight">{user.name}</h1>
          </div>
          
          <div className="w-full md:max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-lg glow-border hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-white tracking-wide">Learning Journey</span>
              <span className="text-sm font-bold text-blue-200 bg-black/20 px-2 py-0.5 rounded-full">{progressPercent}% Complete</span>
            </div>
            
            {/* Markers on top of bar */}
            <div className="relative w-full h-10 mb-1 flex justify-between items-end px-1">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-blue-200 uppercase font-bold mb-1 opacity-80">Beginner</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${progressPercent >= 0 ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.6)] text-white scale-110' : 'bg-white/20 text-white/50'}`}>
                  <CheckCheck size={12} />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-blue-200 uppercase font-bold mb-1 opacity-80">Pro</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${progressPercent >= 50 ? 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.6)] text-white scale-110' : 'bg-white/20 text-white/50'}`}>
                  <TrendingUp size={12} />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-blue-200 uppercase font-bold mb-1 opacity-80">Master</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${progressPercent >= 100 ? 'bg-gradient-to-br from-orange-400 to-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)] text-white scale-110' : 'bg-white/20 text-white/50'}`}>
                  <ShieldCheck size={12} />
                </div>
              </div>
            </div>

            {/* The Bar */}
            <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden shadow-inner relative z-0">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 ${progressPercent === 100 ? 'shadow-[0_0_15px_rgba(236,72,153,0.8)]' : ''}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Row 1: User Info + Balance + Quick Actions ────────────────────── */}

        {user.pinSet === false && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg shrink-0">
              <AlertTriangle className="text-amber-600 w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-amber-800 font-bold mb-1">Your PIN is not set</h3>
              <p className="text-amber-700 text-sm">Please visit the ATM Simulator to complete setup. Normal operations are locked until you set a secure PIN.</p>
            </div>
            <Link to="/atm" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-sm shrink-0 shadow-sm transition">
              Setup PIN Now
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* User Info Card */}
          <DashboardCard className="lg:col-span-1 dark:bg-slate-800 dark:border-slate-700/50 transition-colors duration-300">
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4">
              Account Details
            </p>

            {/* Name */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-400">Account Holder</p>
              </div>
            </div>

            {/* Account number row */}
            <div className="bg-blue-50 dark:bg-slate-900 rounded-xl p-3 mb-3 border dark:border-slate-700">
              <p className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-1">
                Account Number
              </p>
              <div className="flex items-center justify-between gap-2">
                <p
                  id="dashboard-account-number"
                  className="font-mono font-bold text-blue-800 dark:text-blue-300 text-sm tracking-wider"
                >
                  {showFullAcct ? user.accountNumber : maskAccount(user.accountNumber)}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowFullAcct((v) => !v)}
                    className="text-blue-400 hover:text-blue-600 transition p-1 rounded"
                    title={showFullAcct ? 'Hide' : 'Show full number'}
                  >
                    {showFullAcct ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    id="copy-acct-dashboard"
                    onClick={() => {
                      copyAcct(user.accountNumber);
                      toast.success('Account number copied!');
                    }}
                    className="text-blue-400 hover:text-blue-600 transition p-1 rounded"
                    title="Copy account number"
                  >
                    {copiedAcct ? <CheckCheck size={13} className="text-green-500" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider">
                  Current Balance
                </p>
                <button
                  onClick={() => setShowBalance((v) => !v)}
                  className="text-blue-300 hover:text-white transition p-0.5 rounded"
                  title={showBalance ? 'Hide balance' : 'Show balance'}
                >
                  {showBalance ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              <p className="text-2xl font-black text-white mb-2">
                {showBalance ? `₹${Number(balance).toLocaleString('en-IN')}` : '₹ ••••••'}
              </p>
              <button
                id="refresh-balance-btn"
                onClick={handleRefreshBalance}
                disabled={loadingBal}
                className="flex items-center gap-1 text-[11px] text-blue-200 hover:text-white font-medium disabled:opacity-50 transition"
              >
                <RefreshCw size={11} className={loadingBal ? 'animate-spin' : ''} />
                {loadingBal ? 'Refreshing…' : 'Refresh balance'}
              </button>
            </div>
          </DashboardCard>

          {/* Quick Actions */}
          <DashboardCard className="lg:col-span-2 dark:bg-slate-800 dark:border-slate-700/50 transition-colors duration-300">
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4">Quick Actions</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: user.pinSet === false ? 'Setup PIN' : 'Use ATM',
                  desc: 'Launch ATM simulator',
                  icon: CreditCard,
                  to: '/atm',
                  color: 'bg-blue-600 hover:bg-blue-700',
                  disabled: false,
                },
                {
                  label: 'Transactions',
                  desc: 'View full history',
                  icon: Receipt,
                  to: '/transactions',
                  color: 'bg-indigo-600 hover:bg-indigo-700',
                  disabled: !user.pinSet,
                },
                {
                  label: 'Change PIN',
                  desc: 'Update your PIN',
                  icon: KeyRound,
                  to: '/atm',
                  color: 'bg-violet-600 hover:bg-violet-700',
                  disabled: !user.pinSet,
                },
                {
                  label: 'Take Quiz',
                  desc: 'Test your knowledge',
                  icon: BarChart3,
                  to: '/quiz',
                  color: 'bg-purple-600 hover:bg-purple-700',
                  disabled: false,
                },
              ].map((action) => action.disabled ? (
                <div
                  key={action.label}
                  className="bg-gray-200 dark:bg-slate-800/80 opacity-60 text-gray-600 dark:text-gray-400 rounded-xl p-3.5 flex flex-col gap-1.5 cursor-not-allowed group relative border dark:border-slate-700"
                  title="Please set your PIN first"
                >
                  <action.icon size={20} className="opacity-50" />
                  <div>
                    <p className="text-sm font-bold leading-tight flex items-center gap-2">
                       {action.label} <Lock size={12} className="opacity-60" />
                    </p>
                    <p className="text-[11px] opacity-70 leading-tight">{action.desc}</p>
                  </div>
                </div>
              ) : (
                <Link
                  key={action.label}
                  to={action.to}
                  className={`${action.color} text-white rounded-xl p-3.5 flex flex-col gap-1.5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group`}
                >
                  <action.icon size={20} className="group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-sm font-bold leading-tight">{action.label}</p>
                    <p className="text-[11px] text-white/70 leading-tight">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Second row mini-actions */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/50 flex flex-wrap gap-2">
              {[
                { label: 'ATM Simulator', icon: Banknote, to: '/atm', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400' },
                { label: 'Calculators', icon: Calculator, to: '/calculator', color: 'text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 dark:text-orange-400' },
                { label: 'Financial Tips', icon: TrendingUp, to: '/training', color: 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-400' },
                { label: 'Fraud Awareness', icon: ShieldAlert, to: '/fraud-awareness', color: 'text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400' },
              ].map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className={`${a.color} flex-1 min-w-[140px] rounded-xl p-2.5 flex items-center gap-2 text-xs font-semibold transition-colors`}
                >
                  <a.icon size={14} />
                  {a.label}
                </Link>
              ))}
            </div>
          </DashboardCard>
        </div>

        {/* ── Row 2: Progress Tracker ──────────────────────────────────────── */}
        <DashboardCard className="dark:bg-slate-800 dark:border-slate-700/50">
          <div className="flex items-center gap-2 mb-5">
            <ArrowRightCircle size={18} className="text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-gray-800 dark:text-white">Learning Progress</h2>
          </div>
          <ProgressTracker refreshKey={progressKey} onProgressUpdate={setProgressPercent} />
        </DashboardCard>

        {/* ── Row 3: Financial Tips ────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-amber-500" />
            <h2 className="font-bold text-gray-800 dark:text-white">Financial Literacy Tips</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIPS.map((tip) => (
              <div
                key={tip.title}
                className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow duration-200"
              >
                <div className={`bg-gradient-to-r ${tip.color} h-1.5`} />
                <div className="p-4">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tip.color} flex items-center justify-center mb-3 shadow-sm`}>
                    <tip.icon size={17} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-1">{tip.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT — unified entry point
// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/80 text-sm font-medium">Loading Smart ATM…</p>
        </div>
      </div>
    );
  }

  return user ? <AuthenticatedDashboard /> : <GuestView />;
}

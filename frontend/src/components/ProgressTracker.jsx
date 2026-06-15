import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import {
  UserPlus, ShieldCheck, CreditCard, KeyRound,
  CreditCard as CardIcon, Lock, ArrowLeftRight, Banknote,
  Eye, FileText, RefreshCw, BookOpen, MessageSquare,
  CheckCircle2, LockKeyhole, ChevronRight, RefreshCcw, Info
} from 'lucide-react';

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEP_GROUPS = [
  {
    id: 'setup',
    title: 'Account Setup',
    subtitle: 'Getting started with your account',
    gradient: 'from-blue-600 to-blue-400',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    steps: [
      { key: 'accountRegistered', label: 'Account Registered',   desc: 'Your account has been created',       icon: UserPlus, help: 'Automatically completed when you register an account.' },
      { key: 'accountVerified',   label: 'Account Verified',     desc: 'Identity verification complete',      icon: ShieldCheck, help: 'Automatically completed at registration.' },
      { key: 'atmCardGenerated',  label: 'ATM Card Generated',   desc: 'Your virtual ATM card is ready',      icon: CreditCard, help: 'Automatically generated when your account is created.' },
      { key: 'pinSet',            label: 'PIN Set',              desc: 'Your secure 4-digit PIN configured',  icon: KeyRound, help: 'Go to the ATM Simulator, insert your card, and set your initial 4-digit PIN.' },
    ],
  },
  {
    id: 'usage',
    title: 'ATM Usage',
    subtitle: 'Practice real ATM operations',
    gradient: 'from-indigo-600 to-violet-500',
    lightBg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    steps: [
      { key: 'cardInserted',              label: 'Card Inserted',           desc: 'Drag your ATM card into the slot',    icon: CardIcon, help: 'Navigate to the ATM simulator page and drag your virtual ATM card over the card slot.' },
      { key: 'pinAuthenticated',          label: 'PIN Authenticated',       desc: 'Successfully logged in at ATM',       icon: Lock, help: 'Enter your 4-digit PIN correctly using the keypad at the ATM simulator.' },
      { key: 'firstTransactionCompleted', label: 'First Transaction',       desc: 'Completed your first transaction',    icon: ArrowLeftRight, help: 'Perform any successful transaction like a withdrawal or balance check.' },
      { key: 'withdrawCompleted',         label: 'Withdrawal Done',         desc: 'Successfully withdrew cash',          icon: Banknote, help: 'Withdraw a valid amount (multiple of ₹500) from the ATM.' },
      { key: 'balanceChecked',            label: 'Balance Checked',         desc: 'Checked your account balance',        icon: Eye, help: 'Use the "Balance Inquiry" option at the ATM simulator.' },
      { key: 'miniStatementViewed',       label: 'Mini Statement Viewed',   desc: 'Viewed your transaction history',     icon: FileText, help: 'Use the "Mini Statement" option at the ATM or view your Transactions page.' },
      { key: 'pinChanged',                label: 'PIN Changed',             desc: 'Updated your security PIN',           icon: RefreshCw, help: 'Use the "Change PIN" option in the ATM simulator.' },
    ],
  },
  {
    id: 'learning',
    title: 'Learning',
    subtitle: 'Master financial literacy',
    gradient: 'from-purple-600 to-pink-500',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    steps: [
      { key: 'quizCompleted', label: 'Quiz Completed',  desc: 'Passed the financial literacy quiz',   icon: BookOpen, help: 'Complete the Financial Literacy Quiz from the Dashboard.' },
      { key: 'aiHelpUsed',    label: 'AI Help Used',    desc: 'Consulted the AI banking assistant',   icon: MessageSquare, help: 'Open the floating AI Assistant chat icon in the bottom right corner and send a message.' },
    ],
  },
];

// Full sequential order for locking logic
const ALL_STEP_KEYS = STEP_GROUPS.flatMap((g) => g.steps.map((s) => s.key));

// ─── Step status helpers ──────────────────────────────────────────────────────
const getStepStatus = (stepKey, progress) => {
  if (!progress) return 'locked';
  if (progress[stepKey]) return 'completed';

  const idx = ALL_STEP_KEYS.indexOf(stepKey);
  // First step is never locked
  if (idx === 0) return 'active';
  // Previous step must be completed to unlock this one
  const prevKey = ALL_STEP_KEYS[idx - 1];
  return progress[prevKey] ? 'active' : 'locked';
};

const getCompletionPercent = (progress) => {
  if (!progress) return 0;
  const done = ALL_STEP_KEYS.filter((k) => progress[k]).length;
  return Math.round((done / ALL_STEP_KEYS.length) * 100);
};

// ─── Individual step row ──────────────────────────────────────────────────────
function StepRow({ step, status, isLast, groupGradient }) {
  const Icon = step.icon;
  const [showTooltip, setShowTooltip] = useState(false);

  const circleClass =
    status === 'completed'
      ? `bg-gradient-to-br ${groupGradient} text-white shadow-md`
      : status === 'active'
      ? 'bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-500 shadow-blue-200 dark:shadow-none shadow-md'
      : 'bg-gray-100 dark:bg-slate-800/50 border-2 border-gray-200 dark:border-slate-700 text-gray-300 dark:text-slate-600';

  const labelClass =
    status === 'completed'
      ? 'text-gray-800 dark:text-gray-100 font-semibold'
      : status === 'active'
      ? 'text-blue-700 dark:text-blue-400 font-semibold'
      : 'text-gray-400 dark:text-slate-500';

  const descClass =
    status === 'locked' ? 'text-gray-300 dark:text-slate-600' : 'text-gray-500 dark:text-gray-400';

  return (
    <div className="flex items-start gap-3 relative">
      {/* Connector line */}
      {!isLast && (
        <div
          className={`absolute left-4 top-9 w-0.5 h-full -mb-2 ${
            status === 'completed' ? 'opacity-100' : 'opacity-20'
          }`}
          style={{
            background:
              status === 'completed'
                ? 'linear-gradient(to bottom, #3b82f6, #8b5cf6)'
                : '#9ca3af',
          }}
        />
      )}

      {/* Icon circle */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${circleClass}`}
      >
        {status === 'completed' ? (
          <CheckCircle2 size={16} />
        ) : status === 'locked' ? (
          <LockKeyhole size={14} />
        ) : (
          <Icon size={15} />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 pb-5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap relative">
          <p className={`text-sm transition-colors duration-300 ${labelClass}`}>
            {step.label}
          </p>

          <div
            className="flex items-center justify-center cursor-help"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Info size={14} className="text-gray-400 hover:text-blue-500 transition-colors" />
            {showTooltip && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-52 bg-gray-900 border border-gray-700 text-white text-[11px] p-2.5 rounded-lg shadow-xl z-50 text-center font-medium leading-relaxed animate-in fade-in zoom-in-95 duration-200">
                {step.help}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>

          {status === 'completed' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-600 font-medium leading-none">
              Done
            </span>
          )}
          {status === 'active' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium leading-none animate-pulse">
              Current
            </span>
          )}
        </div>
        <p className={`text-xs mt-0.5 ${descClass}`}>{step.desc}</p>
      </div>
    </div>
  );
}

// ─── Group card ───────────────────────────────────────────────────────────────
function GroupCard({ group, progress }) {
  const completedCount = group.steps.filter((s) => progress?.[s.key]).length;
  const totalCount = group.steps.length;
  const allDone = completedCount === totalCount;
  const noneStarted = completedCount === 0;

  return (
    <div
      className={`rounded-2xl border ${group.border} dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${
        noneStarted ? 'opacity-60 dark:opacity-40' : ''
      }`}
    >
      {/* Group header */}
      <div className={`bg-gradient-to-r ${group.gradient} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm tracking-wide">{group.title}</h3>
            <p className="text-white/75 text-xs mt-0.5">{group.subtitle}</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-black">{completedCount}</span>
            <span className="text-white/70 text-sm">/{totalCount}</span>
          </div>
        </div>
        {/* Mini progress bar inside header */}
        <div className="mt-2.5 h-1.5 rounded-full bg-white/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-700 ease-out"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps list */}
      <div className="p-4 flex-1">
        {group.steps.map((step, idx) => (
          <StepRow
            key={step.key}
            step={step}
            status={getStepStatus(step.key, progress)}
            isLast={idx === group.steps.length - 1}
            groupGradient={group.gradient}
          />
        ))}
      </div>

      {/* Footer badge */}
      {allDone && (
        <div className="px-4 py-2 border-t border-green-100 dark:border-green-900/30 bg-green-50 dark:bg-green-500/10 flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-green-500" />
          <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Section Complete!</span>
        </div>
      )}
    </div>
  );
}

// ─── Main ProgressTracker component ──────────────────────────────────────────
export default function ProgressTracker({ refreshKey = 0, onProgressUpdate }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await API.get('/account/progress');
      setProgress(data.data);
    } catch (e) {
      setError('Could not load progress. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress, refreshKey]);

  const percent = getCompletionPercent(progress);
  const completedSteps = progress
    ? ALL_STEP_KEYS.filter((k) => progress[k]).length
    : 0;

  useEffect(() => {
    if (onProgressUpdate && percent >= 0) {
      onProgressUpdate(percent);
    }
  }, [percent, onProgressUpdate]);

  return (
    <div className="w-full">
      {/* ── Overall header ── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Your ATM Learning Journey</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {completedSteps} of {ALL_STEP_KEYS.length} steps completed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{percent}%</span>
            <button
              onClick={fetchProgress}
              className="p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              title="Refresh progress"
            >
              <RefreshCcw size={14} />
            </button>
          </div>
        </div>

        {/* Master progress bar */}
        <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-gray-200 dark:border-slate-700">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${percent}%`,
              background: 'linear-gradient(to right, #2563eb, #7c3aed, #db2777)',
            }}
          />
        </div>

        {/* Milestone labels */}
        <div className="flex justify-between mt-1 text-[10px] text-gray-400 px-0.5">
          <span>Beginner</span>
          <span>Intermediate</span>
          <span>Expert</span>
        </div>
      </div>

      {/* ── Loading / Error states ── */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="ml-3 text-sm text-gray-500">Loading progress...</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
          <span>{error}</span>
          <button
            onClick={fetchProgress}
            className="ml-auto text-xs underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Group cards ── */}
      {!loading && !error && progress && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEP_GROUPS.map((group) => (
            <GroupCard key={group.id} group={group} progress={progress} />
          ))}
        </div>
      )}

      {/* ── Completion celebration ── */}
      {percent === 100 && !loading && (
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-400 text-white p-4 flex items-center gap-3 shadow-lg">
          <CheckCircle2 size={28} className="flex-shrink-0" />
          <div>
            <p className="font-bold">🎉 Journey Complete!</p>
            <p className="text-sm text-green-100">You've mastered all ATM operations and banking basics.</p>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, List, Phone, RefreshCw, AlertTriangle, ShieldCheck, Volume2 } from 'lucide-react';

const iconMap = {
  'credit-card': CreditCard,
  'lock': Lock,
  'list': List,
  'phone': Phone,
  'refresh': RefreshCw,
  'alert-triangle': AlertTriangle,
  'shield-check': ShieldCheck,
};

const typeStyles = {
  danger: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400',
  safe: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400',
  normal: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400',
};

const iconStyles = {
  danger: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  safe: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
  normal: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
};

export default function FlowStep({ step, index, isActive, isPast, onClick, onPlayVoice }) {
  const Icon = iconMap[step.icon] || AlertTriangle;
  const style = typeStyles[step.type] || typeStyles.normal;
  const iStyle = iconStyles[step.type] || iconStyles.normal;

  return (
    <motion.div
      className={`relative flex-shrink-0 w-full md:w-56 p-4 rounded-2xl border bg-gradient-to-br transition-all cursor-pointer ${
        isActive
          ? `ring-4 ring-offset-2 dark:ring-offset-slate-900 shadow-xl ${step.type === 'danger' ? 'ring-red-400' : step.type === 'safe' ? 'ring-green-400' : 'ring-blue-400'} md:scale-105 z-10 ${style}`
          : isPast
          ? `opacity-70 grayscale-[30%] ${style}`
          : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:scale-105'
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={!isActive ? { scale: 1.02 } : {}}
      onClick={onClick}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isActive || isPast ? iStyle : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>
        <Icon size={20} />
      </div>

      <h3 className={`font-bold text-sm mb-1 ${isActive || isPast ? '' : 'text-gray-700 dark:text-gray-300'}`}>
        {step.title}
      </h3>
      <p className="text-xs opacity-80 leading-snug mb-4 h-8">
        {step.description}
      </p>

      {/* Voice Controls */}
      <div className="flex items-center gap-2 pt-3 border-t border-black/5 dark:border-white/5">
        <button
          onClick={(e) => { e.stopPropagation(); onPlayVoice(step, 'en-US'); }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 text-[10px] font-bold uppercase transition-colors"
          title="Play Audio"
        >
          <Volume2 size={12} /> LISTEN
        </button>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-current rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
    </motion.div>
  );
}

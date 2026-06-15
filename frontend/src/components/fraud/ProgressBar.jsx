import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({ current, total }) {
  const percentage = Math.round((current / total) * 100) || 0;

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
          Progress
        </span>
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
          Step {current} of {total}
        </span>
      </div>
      <div className="h-2 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

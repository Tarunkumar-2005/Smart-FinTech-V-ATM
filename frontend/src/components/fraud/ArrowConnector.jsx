import React from 'react';
import { motion } from 'framer-motion';

export default function ArrowConnector({ active }) {
  return (
    <div className="flex-shrink-0 flex flex-col md:flex-row items-center justify-center w-8 h-8 md:w-16 md:h-auto my-1 md:my-0">
      <motion.div
        className={`w-1 h-full md:h-1 md:w-full md:flex-1 rounded-full relative overflow-hidden ${
          active ? 'bg-blue-200 dark:bg-blue-900/40' : 'bg-gray-200 dark:bg-slate-700'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {active && (
          <motion.div
            className="absolute inset-0 bg-blue-500 dark:bg-blue-400"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
            }}
          />
        )}
      </motion.div>
      <motion.svg
        className={`w-4 h-4 -mt-1 md:-mt-0 md:-ml-1 rotate-90 md:rotate-0 ${active ? 'text-blue-500 dark:text-blue-400' : 'text-gray-300 dark:text-slate-600'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
        initial={{ scale: 0.8 }}
        animate={{ scale: active ? [1, 1.2, 1] : 1 }}
        transition={{ repeat: active ? Infinity : 0, duration: 1.5 }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </motion.svg>
    </div>
  );
}

import React, { useRef, useEffect } from 'react';
import FlowStep from './FlowStep';
import ArrowConnector from './ArrowConnector';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function FlowChart({ scenario, currentStepIndex, onStepClick, onNext, onPrev, onPlayVoice }) {
  const containerRef = useRef(null);

  // Auto-scroll to current step
  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.children[currentStepIndex * 2]; // *2 because of arrows
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentStepIndex]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-blue-50 dark:border-slate-700 relative overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-800 dark:text-white">{scenario.title}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Follow the steps to secure your account</p>
        </div>
      </div>

      {/* Flow Container */}
      <div 
        ref={containerRef}
        className="flex-1 flex flex-col items-center md:flex-row md:items-center overflow-y-auto overflow-x-hidden md:overflow-y-hidden md:overflow-x-auto pb-8 pt-4 px-4 scroll-smooth"
      >
        {scenario.steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="shrink-0 w-full md:w-auto flex justify-center">
              <FlowStep
                step={step}
                index={idx}
                isActive={idx === currentStepIndex}
                isPast={idx < currentStepIndex}
                onClick={() => onStepClick(idx)}
                onPlayVoice={onPlayVoice}
              />
            </div>
            {idx < scenario.steps.length - 1 && (
              <ArrowConnector active={idx < currentStepIndex} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
        <button
          onClick={onPrev}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200"
        >
          <ChevronLeft size={16} /> Previous Step
        </button>
        <button
          onClick={onNext}
          disabled={currentStepIndex === scenario.steps.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
        >
          Next Step <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

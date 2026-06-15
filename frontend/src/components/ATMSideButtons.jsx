import React from 'react';

const ATMSideButtons = ({ side, onAction }) => {
  // Define 3 buttons for Left, 2 for Right mapping to actual menu options
  const leftButtons = [{ id: 'L1' }, { id: 'L2' }, { id: 'L3' }];
  const rightButtons = [{ id: 'R1' }, { id: 'none', blank: true }, { id: 'R2' }];

  const buttons = side === 'left' ? leftButtons : rightButtons;

  return (
    <div className={`flex flex-col justify-between h-[230px] pt-1 pb-1 z-[20]
      ${side === 'left' ? 'pr-2 items-end' : 'pl-2 items-start'}
    `}>
      {buttons.map((btn, idx) => (
        <button
          key={btn.id || idx}
          onClick={() => !btn.blank && onAction(btn.id)}
          disabled={btn.blank}
          className={`
            w-12 sm:w-16 h-12 rounded-sm relative flex-shrink-0 transition-all duration-150
            ${btn.blank ? 'invisible' : 'bg-gradient-to-br from-gray-500 to-gray-700 cursor-pointer shadow-[2px_3px_5px_rgba(0,0,0,0.4),inset_1px_1px_2px_rgba(255,255,255,0.3)] border border-gray-600 hover:brightness-110 active:scale-95 active:shadow-[1px_1px_2px_rgba(0,0,0,0.6),inset_2px_2px_4px_rgba(0,0,0,0.5)]'}
          `}
        >
          {!btn.blank && <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 h-0.5 bg-gray-900/40 rounded-full blur-[0.5px]"></div>}
        </button>
      ))}
    </div>
  );
};

export default ATMSideButtons;

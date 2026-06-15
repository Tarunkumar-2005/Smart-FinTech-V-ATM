import React from 'react';

const ATMKeypad = ({ onKeyClick, onActionClick }) => {
  const numberKeys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '', '0', ''
  ];

  return (
    <div className="bg-gray-400 p-5 rounded-2xl shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] border-4 border-gray-500 w-full max-w-[340px]">
      <div className="grid grid-cols-3 gap-3 mb-3">
        {numberKeys.map((key, index) => (
          key !== '' ? (
            <button
              key={index}
              onClick={() => onKeyClick(key)}
              className="
                h-[55px] bg-[#374151] text-white text-xl font-bold
                rounded-md shadow-[0_4px_0_#1f2937] transition-all
                active:translate-y-1 active:shadow-none active:scale-95
                flex items-center justify-center
              "
            >
              {key}
            </button>
          ) : (
            <div key={index} className="h-[55px]"></div>
          )
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onActionClick('CANCEL')}
          className="
            h-[55px] bg-[#ef4444] text-white font-bold text-sm
            rounded-md shadow-[0_4px_0_#991b1b] transition-all
            active:translate-y-1 active:shadow-none active:scale-95
            flex items-center justify-center
          "
        >
          Cancel
        </button>
        <button
          onClick={() => onActionClick('CLEAR')}
          className="
            h-[55px] bg-[#facc15] text-gray-900 font-bold text-sm
            rounded-md shadow-[0_4px_0_#a16207] transition-all
            active:translate-y-1 active:shadow-none active:scale-95
            flex items-center justify-center
          "
        >
          Clear
        </button>
        <button
          onClick={() => onActionClick('ENTER')}
          className="
            h-[55px] bg-[#22c55e] text-white font-bold text-sm
            rounded-md shadow-[0_4px_0_#166534] transition-all
            active:translate-y-1 active:shadow-none active:scale-95
            flex items-center justify-center
          "
        >
          Enter
        </button>
      </div>
    </div>
  );
};

export default ATMKeypad;

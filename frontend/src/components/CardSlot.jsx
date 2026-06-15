import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';

const CardSlot = ({ onCardDrop, isCardInserted }) => {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'ATM_CARD',
    drop: () => onCardDrop(),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const indicatorColor = isCardInserted 
    ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' 
    : (pulse ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-green-900 shadow-none');

  return (
    <div className="relative flex flex-col items-center mt-12 w-48" ref={dropRef}>
      {isCardInserted && (
         <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-32 h-[120px] overflow-hidden z-[20] pointer-events-none">
            <div className="w-full h-40 bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-900 rounded-md border border-white/20 flex flex-col pt-3 items-center shadow-lg"
                 style={{ animation: 'slideCardDown 1.5s forwards ease-in-out' }}>
                <div className="w-8 h-6 bg-gradient-to-br from-yellow-100 to-yellow-500 rounded-sm border border-yellow-600/50 shadow-inner self-start ml-4"></div>
                <div className="font-mono text-xs opacity-60 text-white mt-auto mb-2 text-center w-full">**** 4532</div>
                <style>{`
                  @keyframes slideCardDown {
                    0% { transform: translateY(-40px); opacity: 0.5; }
                    5% { transform: translateY(-40px); opacity: 1; }
                    100% { transform: translateY(120px); opacity: 1; }
                  }
                `}</style>
            </div>
         </div>
      )}

      <div className={`relative w-48 h-8 rounded-md bg-gradient-to-b from-gray-700 to-gray-800 border-2 border-gray-600 shadow-xl flex items-center justify-center z-[30] transition-all duration-300 ${isOver && !isCardInserted ? 'ring-2 ring-blue-400 scale-105' : ''}`}>
        <div className={`absolute top-1 right-2 w-1.5 h-1.5 rounded-full z-[40] transition-colors duration-300 ${indicatorColor}`} />
        <div className="w-[90%] h-2.5 bg-black rounded shadow-[inset_0_3px_5px_rgba(0,0,0,1)] z-[30] flex items-center justify-center">
            <div className="w-[85%] h-1 bg-gray-900 rounded-sm"></div>
        </div>
      </div>
      <div className="text-xs text-gray-400 font-bold tracking-wider text-center mt-3 drop-shadow-sm uppercase">Card Reader</div>
    </div>
  );
};

export default CardSlot;

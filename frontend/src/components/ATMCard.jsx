import React from 'react';
import { useDrag } from 'react-dnd';

const ATMCard = ({ user }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'ATM_CARD',
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  if (isDragging) {
    return <div ref={dragRef} className="w-64 h-40 bg-gray-500 rounded-xl opacity-30 cursor-grabbing shadow-lg" />;
  }

  // Fallback to placeholder info if no user model present (e.g., unauthorized dev loads)
  const displayName = user?.name ? user.name : 'JOHN DOE';
  const displayAccount = user?.accountNumber 
      ? `•••• •••• ••${user.accountNumber.slice(-2)}` 
      : '•••• •••• •••• 4532';

  return (
    <div
      ref={dragRef}
      className={`relative w-64 h-40 rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.6)] cursor-grab p-5 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-900 text-white transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 border border-white/20 z-[100] group hover:shadow-[0_20px_40px_rgba(59,130,246,0.3)] hover:border-blue-300/50`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
      
      <div className="flex justify-between items-start z-10 relative">
        <div className="font-bold text-xl tracking-wider italic text-gray-100 drop-shadow-md">SMART BANK</div>
        <div className="text-xs opacity-70 tracking-widest mt-1 font-semibold flex items-center uppercase">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            Debit
        </div>
      </div>
      
      {/* Chip and tap icon */}
      <div className="flex justify-between items-center z-10 relative mt-1">
          <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-100 to-yellow-500 border border-yellow-600/50 relative overflow-hidden shadow-inner">
             <div className="absolute w-full h-[1px] bg-yellow-600/30 top-1/2"></div>
             <div className="absolute w-[1px] h-full bg-yellow-600/30 left-1/3"></div>
             <div className="absolute w-[1px] h-full bg-yellow-600/30 right-1/3"></div>
          </div>
          <svg className="w-5 h-5 text-gray-300/80 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 011.026-8.38A5.5 5.5 0 0117 8m-6 3a3.5 3.5 0 011.026-5.38" />
          </svg>
      </div>

      <div className="font-mono text-xl tracking-widest drop-shadow-md mt-auto mb-1 opacity-90 z-10 relative flex">
        {user?.accountNumber ? `XXXX XXXX ${user.accountNumber.slice(-4)}` : 'XXXX XXXX 4587'}
      </div>
      
      <div className="flex justify-between items-end text-xs font-mono opacity-80 mt-auto z-10 relative uppercase">
        <div className="leading-tight">Valid Thru<br/><span className="text-sm font-semibold tracking-wide">12/28</span></div>
        <div className="text-base tracking-widest font-semibold drop-shadow truncate w-36 text-right capitalize">{displayName}</div>
      </div>
    </div>
  );
};

export default ATMCard;

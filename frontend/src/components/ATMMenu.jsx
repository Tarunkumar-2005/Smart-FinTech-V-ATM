import React from 'react';

const ATMMenu = ({ onScreenAction }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative z-[10]">
      <h1 className="text-xl font-bold mb-4 border-b pb-2 border-green-800/50 w-3/4 text-center">Select Transaction</h1>
      <div className="flex w-full justify-between items-center px-1 h-full text-lg mt-2 relative">
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-green-900/30 -translate-x-1/2 rounded-full"></div>
        
        <div className="flex flex-col justify-between h-full py-2 text-left space-y-4 flex-1 pr-2">
          <div className="cursor-pointer hover:bg-[#bbf7d0] hover:text-[#064e3b] px-3 py-1.5 rounded transition-all duration-200 shadow-sm active:scale-95 flex items-center group font-semibold" onClick={() => onScreenAction('L1')}>
              <span className="opacity-50 mr-2 group-hover:opacity-100">&lt;</span> Withdraw
          </div>
          <div className="cursor-pointer hover:bg-[#bbf7d0] hover:text-[#064e3b] px-3 py-1.5 rounded transition-all duration-200 shadow-sm active:scale-95 flex items-center group font-semibold" onClick={() => onScreenAction('L2')}>
              <span className="opacity-50 mr-2 group-hover:opacity-100">&lt;</span> Statement
          </div>
          <div className="cursor-pointer hover:bg-[#bbf7d0] hover:text-[#064e3b] px-3 py-1.5 rounded transition-all duration-200 shadow-sm active:scale-95 flex items-center group font-semibold" onClick={() => onScreenAction('L3')}>
              <span className="opacity-50 mr-2 group-hover:opacity-100">&lt;</span> PIN Change
          </div>
        </div>
        
        <div className="flex flex-col justify-between h-full py-2 text-right space-y-4 flex-1 pl-2">
          <div className="cursor-pointer hover:bg-[#bbf7d0] hover:text-[#064e3b] px-3 py-1.5 rounded transition-all duration-200 shadow-sm active:scale-95 flex items-center justify-end group font-semibold" onClick={() => onScreenAction('R1')}>
              Balance <span className="opacity-50 ml-2 group-hover:opacity-100">&gt;</span>
          </div>
          <div className="mt-auto"></div>
          <div className="cursor-pointer hover:bg-red-200 hover:text-red-900 px-3 py-1.5 rounded transition-all duration-200 shadow-sm active:scale-95 flex items-center justify-end group font-bold border border-transparent hover:border-red-400 text-red-100" onClick={() => onScreenAction('R2')}>
              Eject Card <span className="opacity-50 ml-2 group-hover:opacity-100">&gt;</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATMMenu;

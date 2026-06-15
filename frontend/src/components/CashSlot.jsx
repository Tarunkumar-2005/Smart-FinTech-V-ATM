import React from 'react';
import CashAnimation from './CashAnimation';

const CashSlot = ({ isDispensing, amount, showCash }) => {
  return (
    <div className="relative flex flex-col items-center mt-6 w-64">
      
      {/* Container acting as the masking slot the cash drops from strictly underneath */}
      <div className="relative w-full flex flex-col items-center z-[30] pb-20"> 
        
        {/* The glowing indicator above the slot */}
        <div className={`absolute -top-3 right-6 w-2 h-2 rounded-full z-[40] transition-colors duration-500 shadow-lg ${(isDispensing || showCash) ? 'bg-green-400 shadow-[0_0_10px_#4ade80] animate-pulse' : 'bg-red-900 shadow-none'}`} />
        
        {/* The metallic slot structure itself */}
        <div className="w-56 h-10 rounded-md bg-gradient-to-b from-gray-600 to-gray-800 border-[3px] border-gray-500 shadow-[0_15px_20px_rgba(0,0,0,0.6)] flex items-center justify-center z-[30] relative overflow-hidden">
            <div className="w-[95%] h-3 bg-black rounded shadow-[inset_0_5px_8px_rgba(0,0,0,1)] z-[30] flex items-center justify-center relative">
                <div className="w-[98%] h-1 bg-gray-900 rounded-sm"></div>
            </div>
        </div>
        
        {/* Render Animation physically dropping OUT of the bottom of the slot container z-index logic */}
        {(isDispensing || showCash) && (
            <div className="absolute top-[38px] z-[20]">
                <CashAnimation amount={amount} />
            </div>
        )}
      </div>

      <div className="absolute bottom-0 text-xs text-gray-500 font-bold tracking-widest text-center drop-shadow-sm uppercase">Cash Dispenser</div>
    </div>
  );
};

export default CashSlot;

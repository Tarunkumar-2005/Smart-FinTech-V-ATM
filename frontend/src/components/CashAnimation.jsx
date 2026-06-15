import React from 'react';

const CashAnimation = ({ amount }) => {
  // Only dispense in multiples of 500, calculate number of notes.
  // Limit max visible notes to 20 for UI perf/rendering.
  const numNotes = Math.min(Math.max(1, Math.floor(amount / 500)), 20);

  return (
    <div className="relative flex flex-col items-center z-[10] w-[200px]" style={{ perspective: '800px' }}>
        
        {/* Layered Cash Notes */}
        <div className="relative flex justify-center w-[184px]" style={{ animation: 'dispenseCash 1.5s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            
            {Array.from({ length: numNotes }).map((_, i) => {
              const isFront = i === numNotes - 1;
              const yOffset = i * -2; // stack them upwards slightly
              return (
                <div 
                  key={i}
                  className={`absolute w-[184px] h-[85px] rounded-md shadow-md transform -rotate-1 origin-top bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] flex flex-col justify-between py-1 px-3 border transition-transform`}
                  style={{
                    top: `${yOffset}px`,
                    zIndex: i + 10,
                    // Colors resembling Indian 500 Rupee note (Stone grey/green)
                    backgroundColor: isFront ? '#e4e2d3' : '#dbd9ca',
                    borderColor: '#9ca3af',
                    boxShadow: isFront ? '0 5px 15px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                >
                   {/* Top Left/Right Corner values */}
                   <div className="flex justify-between w-full">
                       <span className="text-gray-700 font-bold font-sans text-sm tracking-widest">500</span>
                       <span className="text-gray-800/80 font-bold font-sans text-[8px] uppercase tracking-wider">RESERVE BANK OF INDIA</span>
                       <span className="text-gray-700 font-bold font-sans text-sm tracking-widest">500</span>
                   </div>
                   
                   {/* Center Circle with Rupee Symbol */}
                   <div className="self-center w-12 h-12 rounded-full border-[2px] border-gray-400 bg-gray-100 flex items-center justify-center -mt-2 shadow-inner">
                       <div className="text-gray-700 text-xl font-sans font-bold">₹</div>
                   </div>
                   
                   {/* Bottom Left/Right Corner values */}
                   <div className="flex justify-between w-full">
                       <span className="text-gray-700 font-bold font-sans text-sm tracking-widest">500</span>
                       <span className="text-gray-700 font-bold text-[8px] font-sans pt-1">₹500</span>
                       <span className="text-gray-700 font-bold font-sans text-sm tracking-widest">500</span>
                   </div>
                </div>
              );
            })}
        </div>

        <style>{`
            @keyframes dispenseCash {
                0% { 
                    transform: translateY(-80px) scale(0.9); 
                    opacity: 0;
                    filter: brightness(0.2);
                }
                30% {
                    opacity: 1;
                    filter: brightness(1);
                }
                60% { 
                    transform: translateY(12px) scale(1); 
                }
                80% { 
                    transform: translateY(-2px); 
                }
                100% { 
                    transform: translateY(0px) scale(1); 
                    opacity: 1;
                }
            }
        `}</style>
    </div>
  );
};

export default CashAnimation;

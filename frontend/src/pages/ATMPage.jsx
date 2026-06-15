import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ATMFrame from '../components/ATMFrame';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ATMCard from '../components/ATMCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Home } from 'lucide-react';
import UserSettingsMenu from '../components/UserSettingsMenu';

export default function ATMPage() {
  const [isCardInserted, setIsCardInserted] = useState(false);
  const { user } = useAuth(); // Retrieve active user context
  const hasToasted = useRef(false);
  const navigate = useNavigate();

  // 5. Welcome Popup Message
  useEffect(() => {
    if (user?.name && !hasToasted.current) {
       toast.success(`Welcome, ${user.name}!`, { id: 'welcome-toast' });
       hasToasted.current = true;
    }
  }, [user]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-gradient-to-br from-gray-900 to-black h-screen w-full overflow-hidden flex flex-col items-center justify-center relative shadow-inner">
        
        {/* Top Navbar Overlay */}
        <div className="absolute top-0 w-full p-4 flex justify-between items-center z-50">
          <div></div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white font-semibold rounded-xl text-sm transition-all shadow-lg hover:shadow-blue-500/30 border border-blue-500/50 backdrop-blur-sm"
            >
               <Home size={16} /> Go to Dashboard
            </button>
            <UserSettingsMenu />
          </div>
        </div>

        <div className="w-full h-full flex flex-col items-center justify-center p-4 mt-8">
             <ATMFrame 
                user={user}
                isCardInserted={isCardInserted} 
                onCardInsert={() => setIsCardInserted(true)} 
                onCardEject={() => setIsCardInserted(false)}
             />
        </div>

        {/* The user's wallet space where the card sits initially, now aligned Right side */}
        {!isCardInserted && (
          <div className="absolute right-4 sm:right-[10%] xl:right-[15%] bottom-4 sm:bottom-16 z-[100] animate-[bounce_3s_infinite] drop-shadow-2xl flex flex-col items-center">
            <ATMCard user={user} />
            <div className="text-center text-white/60 text-xs mt-6 uppercase tracking-widest pointer-events-none drop-shadow-md font-bold bg-black/40 py-1.5 px-3 rounded-full border border-white/10 backdrop-blur-sm shadow-xl">
                Drag card to ATM slot to begin
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

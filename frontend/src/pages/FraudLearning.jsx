import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Home, ShieldAlert, ChevronRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import UserSettingsMenu from '../components/UserSettingsMenu';
import ProgressBar from '../components/fraud/ProgressBar';
import FlowChart from '../components/fraud/FlowChart';

const scenarios = [
  {
    title: "1. Lost ATM Card",
    steps: [
      { title: "Lost Card", type: "danger", description: "You realized your ATM card is lost.", icon: "credit-card" },
      { title: "Block Card", type: "safe", description: "Block your card immediately.", icon: "lock" },
      { title: "File FIR", type: "normal", description: "File a report at nearest Police Station.", icon: "shield-check" },
      { title: "Inform Bank", type: "safe", description: "Notify your bank about the lost card.", icon: "phone" },
      { title: "Check Transactions", type: "normal", description: "Review recent activity.", icon: "list" },
      { title: "Apply New Card", type: "safe", description: "Request a replacement.", icon: "refresh" }
    ]
  },
  {
    title: "2. Stolen ATM Card",
    steps: [
      { title: "Card Stolen", type: "danger", description: "Your card was stolen.", icon: "credit-card" },
      { title: "Block Card", type: "safe", description: "Block card immediately to prevent misuse.", icon: "lock" },
      { title: "File FIR", type: "normal", description: "File a Police FIR.", icon: "shield-check" },
      { title: "Submit FIR to Bank", type: "normal", description: "Provide FIR copy to your bank.", icon: "list" },
      { title: "Raise Complaint", type: "safe", description: "Log a formal complaint.", icon: "phone" },
      { title: "Refund Process", type: "safe", description: "Wait for resolution/refund.", icon: "refresh" }
    ]
  },
  {
    title: "3. Unauthorized Withdrawal",
    steps: [
      { title: "Fraud Alert", type: "danger", description: "Unknown withdrawal detected.", icon: "alert-triangle" },
      { title: "Block Card", type: "safe", description: "Block card immediately.", icon: "lock" },
      { title: "Check Statement", type: "normal", description: "Review the exact transaction.", icon: "list" },
      { title: "Report Within 24 Hrs", type: "safe", description: "Report to bank within 24 hours.", icon: "phone" },
      { title: "Submit Complaint", type: "normal", description: "File formal dispute form.", icon: "shield-check" },
      { title: "Resolution", type: "safe", description: "Wait for the bank to reverse charges.", icon: "refresh" }
    ]
  },
  {
    title: "4. ATM Skimming / Cloning",
    steps: [
      { title: "Use ATM", type: "normal", description: "You used a compromised ATM.", icon: "credit-card" },
      { title: "Suspicious Activity", type: "danger", description: "Cloned card usage detected.", icon: "alert-triangle" },
      { title: "Block Card", type: "safe", description: "Block the original card.", icon: "lock" },
      { title: "Change PIN", type: "safe", description: "Reset your banking passwords.", icon: "refresh" },
      { title: "Inform Bank", type: "normal", description: "Report the skimming incident.", icon: "phone" },
      { title: "Enable Alerts", type: "safe", description: "Turn on SMS/Email alerts.", icon: "shield-check" }
    ]
  },
  {
    title: "5. Card Captured by ATM",
    steps: [
      { title: "Insert Card", type: "normal", description: "You inserted card into the machine.", icon: "credit-card" },
      { title: "Card Not Returned", type: "danger", description: "Machine failed to eject the card.", icon: "alert-triangle" },
      { title: "Note ATM Location", type: "normal", description: "Note down ATM ID and address.", icon: "list" },
      { title: "Call Bank", type: "safe", description: "Call customer care immediately.", icon: "phone" },
      { title: "Visit Branch", type: "normal", description: "Visit the bank branch if nearby.", icon: "shield-check" },
      { title: "Get New Card", type: "safe", description: "Apply for a replacement card.", icon: "refresh" }
    ]
  }
];

export default function FraudLearning() {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const synthRef = useRef(window.speechSynthesis);

  const scenario = scenarios[currentScenarioIndex];

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handlePlayVoice = (step, lang) => {
    if (!synthRef.current) return;
    
    // Stop any ongoing speech
    synthRef.current.cancel();

    // Construct text to speak
    const textToSpeak = `Step: ${step.title}. ${step.description}`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang; // 'en-US' or 'hi-IN'
    
    // Attempt to find a native voice for the selected language
    const voices = synthRef.current.getVoices();
    const targetVoice = voices.find(v => v.lang.includes(lang.split('-')[0]));
    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    
    synthRef.current.speak(utterance);
  };

  const handleNext = () => {
    if (currentStepIndex < scenario.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleStepClick = (index) => {
    setCurrentStepIndex(index);
  };

  const handleScenarioChange = (e) => {
    setCurrentScenarioIndex(Number(e.target.value));
    setCurrentStepIndex(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col">
      {/* ── Top Nav ── */}
      <header className="bg-white dark:bg-slate-900 border-b border-blue-100 dark:border-slate-800 shadow-sm sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              <Home size={16} /> <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <ChevronRight size={14} className="text-gray-400" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center shadow-sm">
                <ShieldAlert size={14} className="text-white" />
              </div>
              <span className="font-bold text-gray-800 dark:text-white tracking-wide">
                Fraud Awareness
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserSettingsMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        
        {/* Top Header & Progress */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              ATM Fraud Scenarios & Safety Actions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mb-4">
              Learn how to identify and respond to common ATM fraud situations through an interactive simulation.
            </p>
            
            <div className="inline-flex flex-col sm:flex-row sm:items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <label className="text-sm font-bold text-gray-500 dark:text-slate-400 px-2 uppercase tracking-wider">
                Select Scenario:
              </label>
              <select 
                value={currentScenarioIndex}
                onChange={handleScenarioChange}
                className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto p-2.5 outline-none cursor-pointer font-semibold"
              >
                {scenarios.map((s, idx) => (
                  <option key={idx} value={idx}>{s.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="md:min-w-[300px]">
             <ProgressBar current={currentStepIndex + 1} total={scenario.steps.length} />
          </div>
        </div>

        {/* Flowchart Layout */}
        <div className="flex-1 min-h-[500px]">
          <div className="h-full">
            <FlowChart 
              scenario={scenario} 
              currentStepIndex={currentStepIndex} 
              onStepClick={handleStepClick}
              onNext={handleNext}
              onPrev={handlePrev}
              onPlayVoice={handlePlayVoice}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

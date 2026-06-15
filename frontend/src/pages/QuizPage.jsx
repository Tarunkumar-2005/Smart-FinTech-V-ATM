import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Trophy, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';
import Confetti from 'react-confetti';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Never share your ATM PIN with anyone. True or False?",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation: "Your PIN is your secret key to your account. Bank staff will never ask for your PIN."
  },
  {
    id: 2,
    question: "When entering your PIN at an ATM, what is the safest practice?",
    options: [
      "Say it out loud so you don't forget",
      "Shield the keypad with your free hand",
      "Ask a stranger for help entering it",
      "Write it on the back of your card"
    ],
    correctAnswer: 1,
    explanation: "Always shield the keypad to prevent \"shoulder surfing\" or hidden cameras from capturing your PIN."
  },
  {
    id: 3,
    question: "What should you do if an ATM eats your card?",
    options: [
      "Walk away and try again tomorrow",
      "Ask the person behind you for help",
      "Immediately contact your bank branch or customer service",
      "Try to pry open the card slot"
    ],
    correctAnswer: 2,
    explanation: "Contact your bank immediately to block the card, as thieves might retrieve it after you leave."
  },
  {
    id: 4,
    question: "Which of these PINs is considered STOLEN easily by scammers?",
    options: ["9472", "1234", "8251", "5690"],
    correctAnswer: 1,
    explanation: "Avoid predictable PINs like 1234, 0000, or your birth year. Opt for random combinations."
  },
  {
    id: 5,
    question: "If the ATM dispenses less cash than requested, you should:",
    options: [
      "Keep the cash and take the loss",
      "Kick the ATM machine to get the rest",
      "Check your mini statement and notify your bank if money was deducted",
      "Call the police immediately"
    ],
    correctAnswer: 2,
    explanation: "Usually, ATMs rectify cash jams automatically, but always notify your bank with the transaction receipt."
  }
];

export default function QuizPage() {
  const navigate = useNavigate();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentQIndex];

  const handleSelect = (index) => {
    if (hasAnswered) return;
    setSelectedOpt(index);
    setHasAnswered(true);

    if (index === currentQ.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = async () => {
    if (currentQIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setSelectedOpt(null);
      setHasAnswered(false);
    } else {
      setIsFinished(true);
      // Mark quiz complete progress
      try {
        await API.post('/account/progress', { step: 'quizCompleted' });
        toast.success("Quiz progress saved!");
      } catch (e) {
        // Silent block
      }
    }
  };

  const retryQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOpt(null);
    setHasAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/10 dark:to-slate-900 transition-colors duration-500 flex flex-col relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 opacity-10 dark:opacity-5 blur-3xl rounded-full pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400 opacity-10 dark:opacity-5 blur-3xl rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-purple-100 dark:border-slate-800 shadow-sm sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-bold text-slate-800 dark:text-white text-lg">Financial Quiz</h1>
          </div>
          {!isFinished && (
            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Q {currentQIndex + 1} / {QUIZ_QUESTIONS.length}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10 w-full">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border items-center border-white/50 dark:border-slate-700/50 shadow-2xl shadow-purple-500/10 rounded-3xl w-full max-w-2xl p-6 md:p-10 transition-all duration-300 relative">
          
          {/* Progress Bar inside Card */}
          {!isFinished && (
            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-t-3xl overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${(currentQIndex / QUIZ_QUESTIONS.length) * 100}%` }}
              ></div>
            </div>
          )}

          {!isFinished ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-black text-lg shadow-lg shadow-pink-500/30">
                  {currentQIndex + 1}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                  {currentQ.question}
                </h2>
              </div>

              <div className="space-y-4">
                {currentQ.options.map((opt, idx) => {
                  const isCorrectAnswer = hasAnswered && idx === currentQ.correctAnswer;
                  const isWrongSelection = hasAnswered && idx === selectedOpt && selectedOpt !== currentQ.correctAnswer;
                  
                  let optStyle = "border-slate-200 dark:border-slate-600 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer";
                  
                  if (hasAnswered) {
                    optStyle = "cursor-default opacity-80 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900";
                    if (isCorrectAnswer) {
                      optStyle = "border-transparent bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-[1.02] z-10 font-bold opacity-100";
                    } else if (isWrongSelection) {
                      optStyle = "border-transparent bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-lg opacity-100";
                    } else {
                       optStyle = "cursor-default opacity-50 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 scale-95";
                    }
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`w-full px-5 py-4 border-2 rounded-2xl transition-all duration-300 flex justify-between items-center group relative overflow-hidden ${optStyle}`}
                    >
                      <span className="relative z-10 text-[15px]">{opt}</span>
                      {hasAnswered && isCorrectAnswer && <CheckCircle2 className="text-white relative z-10 animate-in zoom-in" size={24} />}
                      {hasAnswered && isWrongSelection && <XCircle className="text-white relative z-10 animate-in zoom-in" size={24} />}
                      
                      {/* Active click ripple effect */}
                      {!hasAnswered && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      )}
                    </div>
                  );
                })}
              </div>

              {hasAnswered && (
                <div className="mt-6 p-5 border border-purple-100 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl animate-in slide-in-from-bottom-4 duration-500 shadow-inner">
                  <span className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2 mb-1">
                     <Star size={16} className="text-purple-500" /> Explanation
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{currentQ.explanation}</span>
                </div>
              )}

              {hasAnswered && (
                <button
                  onClick={handleNext}
                  className="mt-8 w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-black text-lg transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] active:scale-95 group flex items-center justify-center gap-2"
                >
                  {currentQIndex < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'View Results'}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-center animate-in fade-in zoom-in duration-500 py-6">
               {score === QUIZ_QUESTIONS.length && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}
               
               <div className="relative inline-flex justify-center items-center w-32 h-32 rounded-full mb-6 shadow-[0_0_40px_rgba(168,85,247,0.4)] bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border-4 border-white dark:border-slate-800 z-10">
                  {score === QUIZ_QUESTIONS.length ? (
                    <Trophy size={50} className="text-yellow-500 animate-bounce" />
                  ) : (
                    <span className="text-5xl font-black bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {score}/{QUIZ_QUESTIONS.length}
                    </span>
                  )}
               </div>
               
               <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3">
                 {score === QUIZ_QUESTIONS.length ? 'Perfect Score!' : 'Quiz Completed!'}
               </h2>
               <p className="text-slate-600 dark:text-slate-300 mb-10 text-lg">
                 {score === QUIZ_QUESTIONS.length 
                   ? "Absolutely flawless! You're an expert at ATM safety. 🏆" 
                   : score > QUIZ_QUESTIONS.length / 2 
                     ? "Great job! You know your way around an ATM. 👍" 
                     : "Good try! Review the safety tips to stay protected. 💡"}
               </p>

               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button
                   onClick={retryQuiz}
                   className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-purple-200 dark:border-purple-900/50 hover:border-purple-400 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
                 >
                   <RotateCcw size={20} /> Retry Quiz
                 </button>
                 <button
                   onClick={() => navigate('/dashboard')}
                   className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                 >
                   Return to Dashboard
                 </button>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

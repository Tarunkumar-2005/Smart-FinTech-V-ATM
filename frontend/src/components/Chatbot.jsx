import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const API_KEY = "AIzaSyB80aPG67N3ct08ek9SlTlwD560diEbUW8";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

const PREDEFINED_QUESTIONS = [
  "What is my full name?",
  "What is my account number?",
  "What is my cur balance?",
  "Show my latest transaction",
  "What is my PIN?"
];

// System instructions to keep responses focused and short.
const SYSTEM_PROMPT = "You are a helpful banking assistant for a Smart ATM Simulator. Keep your answers brief, beginner-friendly, and no longer than 3 sentences.";

export default function Chatbot() {
  const { user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hi there! I'm your Smart ATM assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend) => {
    const text = typeof textToSend === 'string' ? textToSend : input;
    if (!text.trim()) return;

    const userMessage = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Silently mark AI Help Used progress
    API.post('/account/progress', { step: 'aiHelpUsed' }).catch(() => {});

    try {
      const q = text.toLowerCase();

      // ── Security Blocker ──
      if (/\b(pin|password)\b/i.test(q)) {
        setMessages(prev => [...prev, { role: 'model', text: "For security reasons, your PIN cannot be displayed. Please use ATM to change your PIN if needed." }]);
        setLoading(false);
        return;
      }

      // ── Personalization Intercepters ──
      if (/\bname\b/i.test(q)) {
        setMessages(prev => [...prev, { role: 'model', text: `Your registered name is ${user.name}.` }]);
        setLoading(false);
        return;
      }
      
      if (/\baccount number\b/i.test(q) || /\bacc number\b/i.test(q) || /\baccount no\b/i.test(q)) {
        const masked = '••••' + user.accountNumber.slice(-4);
        setMessages(prev => [...prev, { role: 'model', text: `Your account number is ${masked}.` }]);
        setLoading(false);
        return;
      }
      
      if (/\bbalance\b/i.test(q)) {
        const { data } = await API.get('/account/balance');
        setMessages(prev => [...prev, { role: 'model', text: `Your current balance is ₹${Number(data.data.balance).toLocaleString('en-IN')}.` }]);
        setLoading(false);
        return;
      }
      
      if (/\b(last|latest|recent)\s+transaction\b/i.test(q)) {
        const { data } = await API.get('/account/transactions?limit=1');
        const txs = data.data || [];
        if (txs.length > 0) {
           const tx = txs[0];
           const typeStr = tx.type === 'deposit' ? 'deposit' : 'withdrawal';
           const amt = `₹${Number(tx.amount).toLocaleString('en-IN')}`;
           const dateStr = new Date(tx.createdAt).toLocaleDateString();
           setMessages(prev => [...prev, { role: 'model', text: `Your last transaction was a ${typeStr} of ${amt} on ${dateStr}.` }]);
        } else {
           setMessages(prev => [...prev, { role: 'model', text: "You have no previous transactions on this account." }]);
        }
        setLoading(false);
        return;
      }

      // ── Gemini General Help Fallback ──
      const contextualPrompt = `You are a helpful banking assistant for the Smart ATM Simulator. Keep your answers brief, beginner-friendly, and no longer than 3 sentences. The user's name is ${user.name}. Never share fake account numbers or PIN details.`;
      
      const payload = {
        contents: [
          { role: 'user', parts: [{ text: contextualPrompt + "\n\nUser asking: " + text.trim() }] }
        ]
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      let reply = "";
      if (data.candidates && data.candidates[0].content.parts.length > 0) {
        reply = data.candidates[0].content.parts[0].text;
      } else {
        reply = "I'm having trouble understanding right now. Please try again later.";
      }

      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Network error. Please make sure you have internet access." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-[0_5px_15px_rgba(37,99,235,0.4)] hover:scale-110 active:scale-95 transition-all z-40 ${isOpen ? 'opacity-0 pointer-events-none scale-0' : 'opacity-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      <div className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 text-white">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AI Assistant</h3>
              <span className="text-blue-100 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
              </span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex flex-shrink-0 items-center justify-center mt-1">
                  <Bot size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-sm ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-tl-sm'
                }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex flex-shrink-0 items-center justify-center mt-1">
                <Bot size={14} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-tl-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto scrollbar-none whitespace-nowrap">
          {PREDEFINED_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="px-3 py-1.5 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 text-xs font-semibold rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition disabled:opacity-50 flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input area */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white dark:bg-slate-900 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm px-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition border border-transparent focus:border-blue-300 dark:focus:border-blue-700"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex justify-center items-center flex-shrink-0 transition disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="-ml-0.5" />}
          </button>
        </form>
      </div>
    </>
  );
}

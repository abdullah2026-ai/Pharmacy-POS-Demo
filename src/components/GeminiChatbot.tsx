import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  RefreshCw, 
  Minimize2, 
  Maximize2,
  ShieldCheck,
  Pill,
  Clock,
  MapPin,
  HelpCircle
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  isFallback?: boolean;
}

interface GeminiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const QUICK_PROMPTS = [
  'What is the difference between Napa and Napa Extra?',
  'How should I store insulin (Lantus / Mixtard)?',
  'Can Seclo (Omeprazole) be taken after food?',
  'Which Gazipur areas do you deliver to in 45 minutes?'
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  isOpen,
  onClose,
  initialQuery = ''
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Hello! I am the **Pharmly BD AI Clinical Assistant** (ফার্মেসী এআই সহকারী), powered by Gemini.

I can help you with:
• **Medicine & Generic Information** (Square, Beximco, Incepta, Renata)
• **Dosage Guidelines & Administration Timing** (before or after meals)
• **2°C–8°C Insulin Cold-Chain Storage Advice**
• **Gazipur 45-Minute WhatsApp Delivery Inquiries**

*Note: For emergency conditions or medical diagnoses, always consult a registered MBBS doctor.* How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery && isOpen) {
      setInput(initialQuery);
    }
  }, [initialQuery, isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (userText?: string) => {
    const textToSend = (userText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Format history for server-side Gemini API call
      const historyPayload = newMessages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      const botMessage: ChatMessage = {
        id: `model_${Date.now()}`,
        role: 'model',
        content: data.text || 'I could not generate a response at this moment. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: data.isFallback
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        content: 'I apologize, but I encountered a momentary connection issue. For immediate assistance, please reach our Gazipur pharmacy staff directly via WhatsApp.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'model',
        content: 'Conversation history cleared. How can I help you with your medications or Gazipur delivery today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className={`fixed z-50 transition-all duration-300 ease-in-out ${
      isExpanded 
        ? 'inset-3 sm:inset-6' 
        : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[440px] h-[85vh] sm:h-[580px]'
    }`}>
      <div className="h-full flex flex-col rounded-3xl bg-[#eef2f6] border border-slate-200/90 shadow-2xl overflow-hidden neu-convex">
        {/* Chatbot Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-[#062822] via-[#08352d] to-[#0a4238] text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 text-[#062822] flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  Pharmly AI Assistant
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#bbf246] text-[#062822]">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>DGDA Clinical Guide & Gazipur Support</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              title="Clear chat"
              className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Restore size' : 'Expand window'}
              className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              title="Close chat"
              className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-800">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3.5 space-y-1 shadow-xs ${
                  isUser
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-tr-xs'
                    : 'neu-flat bg-white/80 border border-slate-200/80 rounded-tl-xs'
                }`}>
                  <div className="leading-relaxed whitespace-pre-wrap break-words font-medium">
                    {msg.content}
                  </div>
                  <div className={`text-[10px] text-right font-mono ${isUser ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#062822] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center justify-start text-xs text-slate-500">
              <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="neu-flat px-4 py-2.5 rounded-2xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                <span className="text-[11px] font-semibold text-slate-600 ml-1">Analyzing clinical data...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Carousel (when history is small) */}
        {messages.length <= 3 && !isLoading && (
          <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200/80 shrink-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-emerald-700" />
              <span>Suggested Clinical Inquiries:</span>
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_PROMPTS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 text-[11px] font-semibold text-slate-700 hover:text-emerald-800 border border-slate-200 whitespace-nowrap transition-colors shrink-0 shadow-2xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3.5 bg-white/90 border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="flex-1 neu-sunken flex items-center px-3 py-2 rounded-2xl">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about medications, dosages, or Gazipur delivery..."
                className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 flex items-center justify-center"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[9px] text-slate-400 text-center mt-2">
            AI medical assistance is advisory. Always consult certified doctors & pharmacists before taking medicine.
          </p>
        </div>
      </div>
    </div>
  );
};

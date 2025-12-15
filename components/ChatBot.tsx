import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Loader2, Sparkles, Mic } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { ChatMessage, Language } from '../types';
import { Chat } from '@google/genai';

interface ChatBotProps {
  language: Language;
}

export const ChatBot: React.FC<ChatBotProps> = ({ language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello. I'm Calmify. I'm here to listen without judgment. How have you been feeling lately?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Re-initialize chat when language changes
  useEffect(() => {
    chatSessionRef.current = geminiService.createChatSession(language);
    // Optional: Send a hidden prompt to switch language context immediately or just clear history
    setMessages([{
      id: crypto.randomUUID(),
      role: 'model',
      text: language === 'en' ? "I'm listening..." : "I switched languages. I am listening...",
      timestamp: Date.now()
    }]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const responseText = result.text || "I'm having trouble connecting right now, but I'm here with you.";

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: "I apologize, but I'm having trouble processing that right now. Could we try again?",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex justify-between items-center shadow-md z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
            <Sparkles size={24} className="text-white" fill="currentColor"/>
          </div>
          <div>
            <h3 className="font-bold text-xl tracking-tight">Calmify AI</h3>
            <p className="text-violet-100 text-sm font-medium opacity-90">Compassionate AI Companion</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-2xl p-5 shadow-sm transition-all ${
                msg.role === 'user' 
                  ? 'bg-violet-600 text-white rounded-br-none shadow-violet-200' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
              }`}
            >
              <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex items-center space-x-3">
                <Loader2 className="animate-spin text-violet-500" size={18} />
                <span className="text-sm text-slate-500 font-medium">Calmify is thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-5 bg-white border-t border-slate-100">
        <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-transparent transition-all shadow-sm">
          <button 
            onClick={toggleListening}
            className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Mic size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type message..."
            className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 h-6 text-base"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md shadow-violet-200"
          >
            <Send size={18} fill="currentColor"/>
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-3">
          AI can make mistakes. For emergencies, please call 911.
        </p>
      </div>
    </div>
  );
};

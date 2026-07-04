'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, StopCircle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';
import { findOrCreateDebateRoom, sendDebateMessage, fetchDebateMessages } from './actions';
import Link from 'next/link';

interface Message {
  id?: string;
  sender: string;
  content: string;
  created_at?: string;
}

export default function DebateClient() {
  const [status, setStatus] = useState<'idle' | 'searching' | 'matched'>('idle');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>('');
  const [role, setRole] = useState<'User1' | 'User2'>('User1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Polling for new messages when matched
  useEffect(() => {
    if (status === 'matched' && roomId) {
      // Start polling
      pollIntervalRef.current = setInterval(async () => {
        const dbMsgs = await fetchDebateMessages(roomId);
        if (dbMsgs.length !== messages.length) {
          setMessages(dbMsgs);
        }
      }, 1500);
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [status, roomId, messages]);

  const handleStartSearch = async () => {
    setStatus('searching');
    setMessages([]);
    
    // Simulate matchmaking search
    setTimeout(async () => {
      const res = await findOrCreateDebateRoom();
      if ('error' in res) {
        alert('Matchmaking failed. Please try again.');
        setStatus('idle');
        return;
      }
      
      setRoomId(res.roomId);
      setTopic(res.topic);
      setRole(res.role as 'User1' | 'User2');
      setStatus('matched');
      
      // Send a system joining message
      await sendDebateMessage(
        res.roomId, 
        'System', 
        `Opponent connected! Your debate stance: ${res.role === 'User1' ? 'PRO (Agree)' : 'CON (Disagree)'}. Start debating!`
      );
      
      const dbMsgs = await fetchDebateMessages(res.roomId);
      setMessages(dbMsgs);
    }, 2500); // 2.5s matchmaking animation
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !roomId || sending) return;

    setSending(true);
    const text = inputText;
    setInputText('');

    // Optimistic message add
    const optimisticMsg: Message = { sender: role, content: text };
    setMessages(prev => [...prev, optimisticMsg]);

    const res = await sendDebateMessage(roomId, role, text);
    if (!res.success) {
      alert('Failed to send message.');
    }
    
    setSending(false);
  };

  const handleDisconnect = async () => {
    if (roomId) {
      await sendDebateMessage(roomId, 'System', 'Opponent has disconnected.');
    }
    setStatus('idle');
    setRoomId(null);
    setMessages([]);
  };

  const handleNextMatch = async () => {
    await handleDisconnect();
    handleStartSearch();
  };

  return (
    <div className="space-y-6">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Local Finder
      </Link>

      {status === 'idle' && (
        <div className="bg-secondary/10 border border-border/50 rounded-3xl p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
          
          <div className="w-16 h-16 bg-primary/20 text-primary border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Debate Arena
            </h1>
            <p className="text-gray-400 max-w-md mx-auto mt-2">
              Get matched anonymous 1-on-1 with a stranger to debate random, controversial topics. 
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              onClick={handleStartSearch}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 text-base"
            >
              Enter Debate Queue
            </button>
          </div>
          
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 mt-8 opacity-75">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Please keep debates clean, respectful, and constructive.
          </div>
        </div>
      )}

      {status === 'searching' && (
        <div className="bg-secondary/10 border border-border/50 rounded-3xl p-16 text-center space-y-8 shadow-2xl relative">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-primary animate-pulse" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold">Finding an Opponent...</h2>
            <p className="text-gray-400 text-sm mt-2">Matching you with someone to debate a random topic.</p>
          </div>

          <button 
            onClick={() => setStatus('idle')}
            className="border border-border/50 hover:bg-white/5 text-gray-400 hover:text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            Cancel Search
          </button>
        </div>
      )}

      {status === 'matched' && (
        <div className="border border-border/50 rounded-3xl bg-secondary/10 shadow-2xl overflow-hidden flex flex-col h-[600px]">
          {/* Header Panel */}
          <div className="p-6 border-b border-border/50 bg-[#0e1422] flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="flex-grow">
              <span className="text-xs font-semibold tracking-wider text-primary uppercase block mb-1">Debate Topic</span>
              <h3 className="text-lg font-bold text-white tracking-tight">{topic}</h3>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={handleDisconnect}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1.5"
              >
                <StopCircle className="w-4 h-4" />
                Disconnect
              </button>
              
              <button 
                onClick={handleNextMatch}
                className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/95 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                Next Match
              </button>
            </div>
          </div>

          {/* Stance Indicator Banner */}
          <div className="bg-[#121827] px-6 py-3 border-b border-border/50 flex justify-between text-xs font-medium tracking-wide">
            <span className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${role === 'User1' ? 'bg-[#23a55a]' : 'bg-rose-500'}`} />
              You: <strong className={role === 'User1' ? 'text-[#23a55a]' : 'text-rose-500'}>{role === 'User1' ? 'PRO (Agree)' : 'CON (Disagree)'}</strong>
            </span>
            <span className="text-gray-400">Stranger is typing...</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-black/10">
            {messages.map((msg, index) => {
              if (msg.sender === 'System') {
                return (
                  <div key={index} className="text-center">
                    <span className="inline-block bg-[#1f283d] text-gray-400 text-xs px-4 py-1.5 rounded-full border border-border/30">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              const isMe = msg.sender === role;
              
              return (
                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMe 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-[#182030] border border-border/50 text-white rounded-tl-none'
                  }`}>
                    <span className="text-[10px] font-bold block uppercase tracking-wider opacity-60 mb-1">
                      {isMe ? 'You' : 'Stranger'}
                    </span>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-border/50 bg-[#0e1422] flex gap-3">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your argument..."
              className="flex-grow bg-[#121824] border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white"
            />
            <button 
              type="submit"
              disabled={!inputText.trim() || sending}
              className="bg-primary hover:bg-primary/95 text-white w-12 h-12 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

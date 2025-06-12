"use client";

import { useState, useEffect, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { Wallet, Menu, User, LogOut, ArrowUp } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import OpenAI from 'openai';
import './globals.css';
import ConfidentialTransfer from '../encrypted-chat';

const openai = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ? new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL,
    "X-Title": "Inco Stream",
  },
}) : null;

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const chatContainerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleConnect = () => {
    try {
      console.log("Connecting wallet...");
      open();
    } catch (error) {
      console.error("Connect error:", error);
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !openai) return;

    const newMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const completion = await openai.chat.completions.create({
        model: "anthropic/claude-3-opus:beta",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant for the Incostream platform, a confidential payroll disbursement system. IMPORTANT: Never generate, assume, or provide fake information about people, transactions, or any other data. If you don't have real information, say so. Focus on explaining the platform's features and capabilities without making up examples. Keep responses professional and focused on payroll, finance, and HR topics."
          },
          ...messages,
          newMessage
        ],
        max_tokens: 500, // Limit response length to stay within free tier
        stream: true,
      });

      let assistantMessage = '';
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        assistantMessage += content;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.content = assistantMessage;
          } else {
            newMessages.push({ role: 'assistant', content: assistantMessage });
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.message?.includes('402')) {
        errorMessage = 'Sorry, the AI service is currently experiencing high demand. Please try again in a few minutes.';
      } else if (error.message?.includes('API key')) {
        errorMessage = 'Error: OpenRouter API key is not configured. Please add your API key to .env';
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

    return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 bg-gray-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-all duration-200 ease-in-out z-30 border-r-2 border-gray-600 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-full lg:w-16'}`}>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-4 bg-gray-800 p-1 rounded-full border border-gray-600 hover:bg-gray-700 hidden lg:block"
        >
          {isSidebarOpen ? (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-2xl font-bold text-white flex items-center gap-2 ${!isSidebarOpen && 'hidden lg:hidden'}`}>
              Incostream
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </h2>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-700"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="space-y-4">
            <a href="/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className={`${!isSidebarOpen && 'hidden lg:hidden'}`}>Dashboard</span>
            </a>
            <a href="/payroll" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className={`${!isSidebarOpen && 'hidden lg:hidden'}`}>Payroll</span>
            </a>
            <a href="/employees" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className={`${!isSidebarOpen && 'hidden lg:hidden'}`}>Employees</span>
            </a>
            <a href="/transactions" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className={`${!isSidebarOpen && 'hidden lg:hidden'}`}>Transactions</span>
            </a>
            <a href="/settings" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className={`${!isSidebarOpen && 'hidden lg:hidden'}`}>Settings</span>
            </a>
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-gray-600">
          <p className={`text-gray-400 text-xs ${!isSidebarOpen && 'hidden lg:hidden'}`}>© 2025 Incostream. All rights reserved.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className={`lg:pl-${isSidebarOpen ? '64' : '16'} transition-all duration-200 ease-in-out`}>
        {/* Header */}
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          <div>
            {isConnected ? (
              <div className="flex items-center gap-4 bg-gray-800 p-2 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white truncate max-w-[150px]">
                    {address?.substring(0, 6)}...
                    {address?.substring(address.length - 4)}
                  </span>
                </div>
                <button
                  onClick={handleDisconnect}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
              >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 0l4 4m-4-4l-4 4" />
                  </svg>
                Connect Wallet
              </button>
            )}
          </div>
        </div>
        </div>

        <div className="max-w-2xl mx-auto p-4">
          {/* Replace only the EncryptedChat component with ConfidentialTransfer */}
          <div className="mb-8">
            <ConfidentialTransfer />
          </div>

          {/* Existing chat container */}
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-gray-600 h-[calc(100vh-12rem)] relative">
            {messages.length === 0 && (
              <div className="stream-animation">
                <div className="content">
                  <span className="animate-typing">stream☁️</span>
                  <span className="animate-blink text-4xl">|</span>
                </div>
              </div>
            )}
            <div ref={chatContainerRef} className="relative z-10 h-full overflow-y-auto chat-container">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                  <div className={`chat-message ${message.role === 'user' ? 'user' : 'assistant'}`}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Streaming Indicator - Outside Chat Box */}
          {isLoading && (
            <div className="mt-4 flex justify-start">
              <div className="bg-gray-800 rounded-lg px-4 py-2">
                <span className="flex items-center gap-2 text-gray-400">
                  <span className="animate-typing">streaming</span>
                  <span className="animate-blink">...</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Field - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
          <div className={`lg:pl-${isSidebarOpen ? '64' : '16'} p-4 transition-all duration-200 ease-in-out`}>
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2 ml-7">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[calc(100%-5rem)]"
                />
            <button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className={`bg-blue-500 text-white p-2 rounded-full border border-white/30 hover:bg-blue-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
            </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Trash2, RefreshCw, Home, Settings, Ticket, DollarSign } from 'lucide-react';
import { ChatApiService, PropertyUtils } from '@/services/chatService';
import { QUICK_ACTIONS } from '@/config/globalPrompt';
import type { ChatMessage } from '@/types';
import { MarkDownText } from './ui/MarkDownText';

const chatService = new ChatApiService();

interface QuickAction {
  readonly text: string;
  readonly category: 'search' | 'support' | 'analysis' | 'management';
  readonly icon: 'Home' | 'Ticket' | 'DollarSign' | 'Settings';
  readonly color: string;
}

const iconMap = {
  Home,
  Ticket,
  DollarSign,
  Settings
} as const;

const PropertyChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m PropertyBot, your AI assistant specialized in property management and real estate services. I can help you find properties, create maintenance tickets, analyze market trends, and manage your real estate needs. How can I assist you today?',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);

  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await chatService.sendMessage(inputValue);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error. Please check your connection and try again.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleQuickAction = useCallback((action: string) => {
    setInputValue(action);
    // Auto-focus textarea after setting value
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        content: 'Hello! I\'m PropertyBot, your AI assistant specialized in property management and real estate services. How can I assist you today?',
        role: 'assistant',
        timestamp: new Date()
      }
    ]);
    chatService.clearHistory();
    setError(null);
  }, []);

  const formatTime = useCallback((date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Home className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">PropertyBot</h1>
              <div className="text-sm text-green-600 flex items-center font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Real Estate AI Assistant
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-blue-50 px-3 py-2 rounded-lg">
              <Bot className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">Powered by GPT-4o</span>
            </div>
            <button
              onClick={clearChat}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 shadow-sm"
              title="Clear chat"
              type="button"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/30 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {QUICK_ACTIONS.map((action: QuickAction, index: number) => {
              const IconComponent = iconMap[action.icon];
              return (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.text)}
                  className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${action.color} text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95`}
                  type="button"
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium">{action.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4 rounded">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error: {error}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
              type="button"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {messages.map((message: ChatMessage) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-4 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-4xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${message.role === 'user' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'}`}>
                  {message.role === 'user' ?
                    <User className="w-5 h-5 text-white" /> :
                    <Home className="w-5 h-5 text-white" />
                  }
                </div>
                <div className={`rounded-2xl px-5 py-4 shadow-lg ${message.role === 'user' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-white/90 backdrop-blur-sm border border-gray-100/50'}`}>
                  <div className={`text-sm leading-relaxed whitespace-pre-wrap ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                    <MarkDownText text={message.content} />
                  </div>
                  <p className={`text-xs mt-3 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex space-x-4 max-w-xs">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-lg border border-gray-100/50">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce" />
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200/50 bg-white/90 backdrop-blur-md p-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyPress={handleKeyPress}
                placeholder="Ask about properties, create tickets, get market insights..."
                className="w-full resize-none border border-gray-300 rounded-2xl px-5 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 overflow-y-auto text-sm bg-white/95 backdrop-blur-sm shadow-sm"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="p-4 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg mb-auto"
              type="button"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            PropertyBot AI • Real Estate & Property Management • Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertyChatBot;
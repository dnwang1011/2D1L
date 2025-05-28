'use client';

import { useState } from 'react';

// Mock conversation data - will be replaced with real chat API
const mockMessages = [
  {
    id: '1',
    type: 'orb' as const,
    content: "Hello! I'm here to help you explore your thoughts and memories. What's on your mind today?",
    timestamp: '10:30 AM',
  },
  {
    id: '2', 
    type: 'user' as const,
    content: "I've been thinking about my creative projects lately. I feel like I'm not making enough progress.",
    timestamp: '10:32 AM',
  },
  {
    id: '3',
    type: 'orb' as const,
    content: "I can sense your passion for creativity. Let's explore this together. What specific aspect of your creative work feels challenging right now?",
    timestamp: '10:33 AM',
  },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState(mockMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate Orb response
    setTimeout(() => {
      const orbResponse = {
        id: (Date.now() + 1).toString(),
        type: 'orb' as const,
        content: "That's a fascinating perspective. I can see how that connects to your growth in self-expression. Would you like to explore this further?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, orbResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]">
      <div className="glass-panel h-full rounded-large flex flex-col">
        {/* Chat Header */}
        <div className="p-lg border-b border-sys-color-outline">
          <div className="flex items-center gap-sm">
            <div className="w-3 h-3 rounded-full bg-ref-palette-accent-journeyGold animate-pulse-glow"></div>
            <h3 className="text-title-medium text-sys-color-primary">
              Chat with Orb
            </h3>
          </div>
          <p className="text-body-small text-sys-color-onSurface opacity-70 mt-xs">
            Your AI companion for reflection and growth
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-lg space-y-md modal-content">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-md rounded-medium ${
                  message.type === 'user'
                    ? 'bg-sys-color-primary text-sys-color-onPrimary'
                    : 'bg-sys-color-surface text-sys-color-onSurface border border-sys-color-outline'
                }`}
              >
                <p className="text-body-medium">{message.content}</p>
                <p className={`text-label-small mt-xs opacity-70 ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-sys-color-surface text-sys-color-onSurface border border-sys-color-outline p-md rounded-medium">
                <div className="flex items-center gap-xs">
                  <div className="flex gap-xs">
                    <div className="w-2 h-2 bg-sys-color-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-sys-color-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-sys-color-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-body-small opacity-70">Orb is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-lg border-t border-sys-color-outline">
          <div className="flex gap-sm">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts..."
              className="flex-1 bg-sys-color-surface text-sys-color-onSurface border border-sys-color-outline rounded-medium p-sm text-body-medium resize-none"
              rows={2}
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="btn-primary px-md py-sm self-end disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-xs mt-sm">
            <button className="btn-secondary text-xs px-sm py-xs">
              💭 Reflect
            </button>
            <button className="btn-secondary text-xs px-sm py-xs">
              🔗 Connect
            </button>
            <button className="btn-secondary text-xs px-sm py-xs">
              ✨ Insight
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
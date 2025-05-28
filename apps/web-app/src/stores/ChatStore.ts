import { create } from 'zustand';

// Define more specific types for Message later, based on shared-types
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  // ... other message properties
}

interface ChatState {
  messages: Message[];
  isAiTyping: boolean;
  // Add other chat-related state properties here
  addMessage: (message: Message) => void;
  setAiTyping: (typing: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isAiTyping: false,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setAiTyping: (typing) => set({ isAiTyping: typing }),
  // Initialize other state properties here
})); 
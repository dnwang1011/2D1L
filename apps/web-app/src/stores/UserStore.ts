import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

interface UserState {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  
  // Actions
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  reset: () => void;
}

const defaultState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
};

export const useUserStore = create<UserState>((set, get) => ({
  ...defaultState,
  
  setUser: (user: User) => set({ 
    user, 
    isAuthenticated: true, 
    error: null 
  }),
  
  setLoading: (isLoading: boolean) => set({ isLoading }),
  
  setError: (error: string | null) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Replace with actual API call
      console.log('Login attempt:', { email, password });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0], // Extract name from email for demo
      };
      
      get().setUser(mockUser);
      set({ isLoading: false });
      
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  },
  
  signup: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Replace with actual API call
      console.log('Signup attempt:', { email, password, name });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful signup
      const mockUser: User = {
        id: '1',
        email,
        name,
      };
      
      get().setUser(mockUser);
      set({ isLoading: false });
      
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Signup failed' 
      });
    }
  },
  
  logout: () => {
    set(defaultState);
  },
  
  reset: () => set(defaultState),
}));

// Export types for external use
export type { User, UserState }; 
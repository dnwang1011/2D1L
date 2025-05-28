import { create } from 'zustand';

interface OrbState {
  // Basic visibility state
  isVisible: boolean;
  
  // 3D position coordinates
  position: [number, number, number];
  
  // Emotional tone affects visual appearance
  emotionalTone: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm' | 'angry';
  
  // Visual state for different Orb conditions
  visualState: 'default' | 'listening' | 'thinking' | 'speaking' | 'sleeping';
  
  // Actions to modify state
  setVisible: (visible: boolean) => void;
  setPosition: (position: [number, number, number]) => void;
  setEmotionalTone: (tone: OrbState['emotionalTone']) => void;
  setVisualState: (state: OrbState['visualState']) => void;
  
  // Reset to defaults
  reset: () => void;
}

const defaultState = {
  isVisible: true,
  position: [0, 0, 0] as [number, number, number],
  emotionalTone: 'neutral' as const,
  visualState: 'default' as const,
};

export const useOrbStore = create<OrbState>((set) => ({
  ...defaultState,
  
  setVisible: (visible: boolean) => set({ isVisible: visible }),
  
  setPosition: (position: [number, number, number]) => set({ position }),
  
  setEmotionalTone: (emotionalTone: OrbState['emotionalTone']) => set({ emotionalTone }),
  
  setVisualState: (visualState: OrbState['visualState']) => set({ visualState }),
  
  reset: () => set(defaultState),
}));

// Export types for external use
export type { OrbState }; 
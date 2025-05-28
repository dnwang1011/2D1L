import { create } from 'zustand';

interface SceneState {
  activeScene: 'CloudScene' | 'AscensionScene' | 'GraphScene' | null;
  // Add other scene-related state properties here
  // e.g., isLoading, scene-specific parameters
  setActiveScene: (scene: SceneState['activeScene']) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  activeScene: null,
  setActiveScene: (scene) => set({ activeScene: scene }),
  // Initialize other state properties here
})); 
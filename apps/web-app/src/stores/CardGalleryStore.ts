import { create } from 'zustand';

// Define more specific types for Card later, based on shared-types
interface Card {
  id: string;
  title: string;
  // ... other card properties
  evolutionState?: string; // e.g., 'seed', 'sprout', 'bloom'
  growthDimensions?: Record<string, number>; // e.g., { self_know: 0.5, world_act: 0.2 }
}

interface CardGalleryState {
  cards: Card[];
  isLoading: boolean;
  filters: Record<string, unknown>;
  // Add other card gallery related state properties here
  setCards: (cards: Card[]) => void;
  addCard: (card: Card) => void;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: Record<string, unknown>) => void;
}

export const useCardGalleryStore = create<CardGalleryState>((set) => ({
  cards: [],
  isLoading: false,
  filters: {},
  setCards: (cards) => set({ cards }),
  addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),
  updateCard: (cardId, updates) => set((state) => ({
    cards: state.cards.map((card) => (card.id === cardId ? { ...card, ...updates } : card)),
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setFilters: (filters) => set({ filters }),
  // Initialize other state properties here
})); 
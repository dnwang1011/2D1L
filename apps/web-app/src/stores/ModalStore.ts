import { create } from 'zustand';

interface ModalState {
  activeModal: string | null; // e.g., 'CardGallery', 'Dashboard', 'Chat'
  isVisible: boolean;
  // Add other modal-related state properties here
  // e.g., modal specific data, isOpen flags for multiple modals
  setActiveModal: (modal: ModalState['activeModal']) => void;
  setVisible: (visible: boolean) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  isVisible: false,
  setActiveModal: (modal) => set({ activeModal: modal, isVisible: modal !== null }),
  setVisible: (visible) => set({ isVisible: visible }),
  closeModal: () => set({ activeModal: null, isVisible: false }),
  // Initialize other state properties here
})); 
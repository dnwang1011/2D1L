'use client';

import { useModalStore } from '../../stores/ModalStore';
import LoginModal from '../auth/LoginModal';
import SignUpModal from '../auth/SignUpModal';

import CardGallery from './CardGallery';
import ChatInterface from './ChatInterface';
import Dashboard from './Dashboard';

export default function ModalLayer({ children }: { children: React.ReactNode }) {
  const { activeModal, isVisible } = useModalStore();

  if (!isVisible) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Default page content */}
      {children}
      
      {/* Active Modal Content */}
      {activeModal === 'dashboard' && <Dashboard />}
      {activeModal === 'cardGallery' && <CardGallery />}
      {activeModal === 'chat' && <ChatInterface />}
      {activeModal === 'login' && <LoginModal />}
      {activeModal === 'signup' && <SignUpModal />}
    </>
  );
} 
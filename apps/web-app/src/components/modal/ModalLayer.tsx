'use client';

import { useModalStore } from '../../stores/ModalStore';
import Dashboard from './Dashboard';
import CardGallery from './CardGallery';
import ChatInterface from './ChatInterface';

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
    </>
  );
} 
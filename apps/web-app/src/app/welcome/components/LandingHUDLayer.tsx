// apps/web-app/src/app/welcome/components/LandingHUDLayer.tsx
'use client';

import { useRouter } from 'next/navigation';

import { useModalStore } from '../../../stores/ModalStore';
import { useUserStore } from '../../../stores/UserStore';

export default function LandingHUDLayer() {
  const { setActiveModal } = useModalStore();
  const { isAuthenticated, user, logout } = useUserStore(); // Corrected to use isAuthenticated
  const router = useRouter();

  return (
    <div className="fixed top-6 right-6 flex gap-3 z-[950]"> {/* Ensure z-index is below modals but above page content */}
      {isAuthenticated && user ? (
        <>
          <span className="glass-panel text-sm text-white-90 px-4 py-2 rounded-md">
            Welcome, {user.name || user.email}
          </span>
          <button
            onClick={() => router.push('/app/home')} // Navigate to main app
            className="glass-panel text-sm text-white-90 hover-text-white px-4 py-2 rounded-md transition-colors duration-200 border border-transparent hover-border-white-30"
          >
            Enter App
          </button>
          <button
            onClick={() => {
              logout();
              // Optionally, force a reload or redirect if needed to clear all app state
              // router.refresh(); // Next.js 13+ way to refetch server components & re-evaluate layout
            }}
            className="glass-panel text-sm text-white-90 hover-text-white px-4 py-2 rounded-md transition-colors duration-200 border border-transparent hover-border-white-30"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => setActiveModal('login')}
            className="glass-panel text-sm text-white-90 hover-text-white px-4 py-2 rounded-md transition-colors duration-200 border border-transparent hover-border-white-30"
          >
            Login
          </button>
          <button
            onClick={() => setActiveModal('signUp')}
            className="btn-primary text-sm px-4 py-2" // Use primary button style for sign up
          >
            Sign Up
          </button>
        </>
      )}
    </div>
  );
}
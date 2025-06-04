'use client';

import { useModalStore } from '../../stores/ModalStore';
import { useSceneStore } from '../../stores/SceneStore';
import { useUserStore } from '../../stores/UserStore';

export default function HUDLayer() {
  const { setActiveModal, activeModal } = useModalStore();
  const { setActiveScene, activeScene } = useSceneStore();
  const { isAuthenticated, logout, user } = useUserStore();

  const handleSceneToggle = () => {
    const scenes = ['CloudScene', 'AscensionScene', 'GraphScene'];
    const currentIndex = scenes.indexOf(activeScene || '');
    const nextIndex = (currentIndex + 1) % scenes.length;
    setActiveScene(scenes[nextIndex] as any);
  };

  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2 z-hud">
      {/* Scene Controls - Only show if authenticated */}
      {isAuthenticated && (
        <div className="glass-panel p-sm rounded-medium">
          <button
            onClick={handleSceneToggle}
            className="btn-secondary text-xs px-sm py-xs"
            title="Switch Scene"
          >
            🌌 {activeScene || 'Default'}
          </button>
        </div>
      )}

      {/* Auth Controls */}
      <div className="glass-panel p-sm rounded-medium flex flex-col gap-xs">
        {!isAuthenticated ? (
          // Show Login/Signup for unauthenticated users
          <>
            <button
              onClick={() => setActiveModal(activeModal === 'login' ? null : 'login')}
              className={`btn-${activeModal === 'login' ? 'primary' : 'secondary'} text-xs px-sm py-xs`}
              title="Login"
            >
              Log In
            </button>
            
            <button
              onClick={() => setActiveModal(activeModal === 'signup' ? null : 'signup')}
              className={`btn-${activeModal === 'signup' ? 'primary' : 'secondary'} text-xs px-sm py-xs`}
              title="Sign Up"
            >
              Sign Up
            </button>
          </>
        ) : (
          // Show app controls for authenticated users
          <>
            <button
              onClick={() => setActiveModal(activeModal === 'dashboard' ? null : 'dashboard')}
              className={`btn-${activeModal === 'dashboard' ? 'primary' : 'secondary'} text-xs px-sm py-xs`}
              title="Dashboard"
            >
              📊 Dashboard
            </button>
            
            <button
              onClick={() => setActiveModal(activeModal === 'cardGallery' ? null : 'cardGallery')}
              className={`btn-${activeModal === 'cardGallery' ? 'primary' : 'secondary'} text-xs px-sm py-xs`}
              title="Card Gallery"
            >
              🃏 Cards
            </button>
            
            <button
              onClick={() => setActiveModal(activeModal === 'chat' ? null : 'chat')}
              className={`btn-${activeModal === 'chat' ? 'primary' : 'secondary'} text-xs px-sm py-xs`}
              title="Chat with Orb"
            >
              💬 Chat
            </button>

            <button
              onClick={logout}
              className="btn-secondary text-xs px-sm py-xs"
              title={`Logout ${user?.name || 'User'}`}
            >
              👋 Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
} 
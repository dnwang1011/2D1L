'use client';

import { useModalStore } from '../../stores/ModalStore';
import { useSceneStore } from '../../stores/SceneStore';

export default function HUDLayer() {
  const { setActiveModal, activeModal } = useModalStore();
  const { setActiveScene, activeScene } = useSceneStore();

  const handleSceneToggle = () => {
    const scenes = ['CloudScene', 'AscensionScene', 'GraphScene'];
    const currentIndex = scenes.indexOf(activeScene || '');
    const nextIndex = (currentIndex + 1) % scenes.length;
    setActiveScene(scenes[nextIndex] as any);
  };

  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2 z-hud">
      {/* Scene Controls */}
      <div className="glass-panel p-sm rounded-medium">
        <button
          onClick={handleSceneToggle}
          className="btn-secondary text-xs px-sm py-xs"
          title="Switch Scene"
        >
          🌌 {activeScene || 'Default'}
        </button>
      </div>

      {/* Navigation Controls */}
      <div className="glass-panel p-sm rounded-medium flex flex-col gap-xs">
        <button
          onClick={() => setActiveModal(activeModal === 'dashboard' ? null : 'dashboard')}
          className={`btn-${activeModal === 'dashboard' ? 'primary' : 'secondary'} text-xs px-sm py-xs`}
          title="Dashboard"
        >
          📊
        </button>
        
        <button
          onClick={() => setActiveModal(activeModal === 'cardGallery' ? null : 'cardGallery')}
          className={`btn-${activeModal === 'cardGallery' ? 'primary' : 'secondary'} text-xs px-sm py-xs`}
          title="Card Gallery"
        >
          🃏
        </button>
        
        <button
          onClick={() => setActiveModal(activeModal === 'chat' ? null : 'chat')}
          className={`btn-${activeModal === 'chat' ? 'primary' : 'secondary'} text-xs px-sm py-xs`}
          title="Chat with Orb"
        >
          💬
        </button>
      </div>
    </div>
  );
} 
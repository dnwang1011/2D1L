import React from 'react';

interface GlassmorphicPanelProps {
  children: React.ReactNode;
  className?: string;
  // Add other props as needed, e.g., padding, shadow variants
}

const GlassmorphicPanel: React.FC<GlassmorphicPanelProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`
        bg-white/10 backdrop-blur-md 
        border border-white/20 
        rounded-lg 
        p-6 
        shadow-lg 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassmorphicPanel; 
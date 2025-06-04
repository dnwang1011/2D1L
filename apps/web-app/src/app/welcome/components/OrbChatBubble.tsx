'use client';

interface OrbChatBubbleProps {
  message: string;
  className?: string;
}

export default function OrbChatBubble({ message, className = '' }: OrbChatBubbleProps) {
  return (
    <div className={`orb-chat-bubble animate-pulse-glow ${className}`}>
      <p className="text-body-large font-plain text-white leading-relaxed">
        {message}
      </p>
    </div>
  );
} 
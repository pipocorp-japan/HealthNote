import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, interactive = false }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/40 dark:bg-black/40 
        backdrop-blur-xl 
        border border-white/40 dark:border-white/10 
        shadow-lg rounded-3xl 
        transition-all duration-300
        ${interactive ? 'cursor-pointer hover:bg-white/50 dark:hover:bg-black/50 hover:scale-[1.02] active:scale-95' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassCard;

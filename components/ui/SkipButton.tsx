import React from 'react';

interface SkipButtonProps {
  onClick: () => void;
  className?: string;
}

export const SkipButton: React.FC<SkipButtonProps> = ({ onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed top-4 right-4 z-[1002] px-3 py-1 text-lg font-mono text-gray-400 bg-black/50 rounded-lg hover:bg-white/20 hover:text-white transition-all duration-200 ${className}`}
      aria-label="Skip intro"
    >
      &gt;&gt;
    </button>
  );
};

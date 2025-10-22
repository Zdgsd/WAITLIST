import React from 'react';

interface ChipProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const ChipComponent: React.FC<ChipProps> = ({ label, isSelected, onClick, disabled = false }) => {
  const baseClasses = 'flex items-center space-x-4 p-3 cursor-pointer transition-all duration-200 w-full text-left text-lg md:text-xl';
  const selectedClasses = 'text-white bg-[var(--terminal-green)]/20';
  const unselectedClasses = 'text-[var(--terminal-green)] hover:bg-[var(--terminal-green)]/10';
  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses} ${disabled ? disabledClasses : ''}`}
      aria-pressed={isSelected}
    >
      <span className="w-8">{isSelected ? `[ > ]` : `[   ]`}</span>
      <span className="flex-1">{label}</span>
    </button>
  );
};

export const Chip = React.memo(ChipComponent);
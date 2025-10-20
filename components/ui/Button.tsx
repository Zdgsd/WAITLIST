import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'terminal';
}

const ButtonComponent: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseClasses = 'px-4 py-2 text-xl transition-all duration-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group';
  
  const variantClasses = {
    primary: 'bg-[var(--terminal-green)] text-black hover:brightness-125 focus:ring-4 ring-[var(--terminal-green)]/50 rounded-md hover:scale-105',
    secondary: 'border-2 border-[var(--terminal-green)] text-[var(--terminal-green)] hover:bg-[var(--terminal-green)]/20 rounded-md hover:border-[var(--terminal-green)]/80',
    terminal: 'text-[var(--terminal-green)] hover:bg-[var(--terminal-green)] hover:text-black hover:scale-105',
  };

  // Generate accessible label from children if not provided
  const ariaLabel = typeof children === 'string' ? children : props['aria-label'] || 'Button';

  return (
    <button
      role="button"
      aria-label={ariaLabel}
      className={`${baseClasses} ${variantClasses[variant]} ${className} cinematic-hover`}
      {...props}
    >
      {/* Animated background effect */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" aria-hidden="true" />
      
      {/* Glow effect */}
      <span className="absolute inset-0 rounded-md bg-[var(--terminal-green)]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
      
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export const Button = React.memo(ButtonComponent);

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'terminal';
}

const ButtonComponent: React.FC<ButtonProps> = ({ children, variant = 'primary', className, type = 'button', ...props }) => {
  const baseClasses = 'px-4 py-2 text-xl transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-[var(--terminal-green)] text-black hover:brightness-125 focus:ring-4 ring-[var(--terminal-green)]/50 rounded-md',
    secondary: 'border-2 border-[var(--terminal-green)] text-[var(--terminal-green)] hover:bg-[var(--terminal-green)]/20 rounded-md',
    terminal: 'text-[var(--terminal-green)] hover:bg-[var(--terminal-green)] hover:text-black',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} type={type} {...props}>
      {children}
    </button>
  );
};

export const Button = React.memo(ButtonComponent);

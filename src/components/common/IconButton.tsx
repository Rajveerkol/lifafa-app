import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  className,
  variant = 'ghost',
  size = 'md',
  rounded = true,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20',
    secondary: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
    outline: 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200',
    glass: 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/20',
  };

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        rounded ? 'rounded-full' : 'rounded-xl',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

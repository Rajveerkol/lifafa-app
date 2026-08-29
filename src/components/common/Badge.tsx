import React, { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const variants = {
    primary: 'bg-blue-100 text-blue-700 font-semibold',
    secondary: 'bg-slate-100 text-slate-700 font-medium',
    success: 'bg-emerald-100 text-emerald-700 font-semibold',
    warning: 'bg-amber-100 text-amber-700 font-semibold',
    danger: 'bg-red-100 text-red-700 font-semibold',
    info: 'bg-sky-100 text-sky-700 font-semibold',
    dark: 'bg-slate-800 text-white font-semibold',
    outline: 'border border-slate-200 text-slate-600 bg-white font-medium',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1 leading-none tracking-wide select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

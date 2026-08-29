import React, { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'gradient' | 'outline' | 'blue-glow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  };

  const variants = {
    default: 'bg-white border border-slate-100 shadow-card hover:shadow-card-hover transition-shadow duration-200',
    flat: 'bg-slate-50 border border-slate-100',
    gradient: 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg shadow-blue-500/20 border border-blue-500/30',
    outline: 'bg-white border-2 border-blue-100 shadow-sm',
    'blue-glow': 'bg-white border border-blue-200 shadow-blue-glow',
  };

  return (
    <div
      className={cn(
        'rounded-2xl relative overflow-hidden',
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

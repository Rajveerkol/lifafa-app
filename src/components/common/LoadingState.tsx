import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LoadingStateProps {
  message?: string;
  className?: string;
  variant?: 'spinner' | 'skeleton' | 'full';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  className,
  variant = 'spinner',
}) => {
  if (variant === 'full') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative flex items-center justify-center w-16 h-16 mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
          <img src="/logo.png" alt="Creatlifafa" className="w-8 h-8 rounded-full absolute" />
        </div>
        <p className="text-sm font-semibold text-slate-600 animate-pulse">{message}</p>
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn('w-full space-y-3 animate-pulse', className)}>
        <div className="h-4 bg-slate-200 rounded-md w-3/4" />
        <div className="h-8 bg-slate-200 rounded-xl" />
        <div className="h-4 bg-slate-200 rounded-md w-1/2" />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center gap-2.5 p-6 text-slate-500', className)}>
      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

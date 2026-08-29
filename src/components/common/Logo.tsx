import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  withLink?: boolean;
  showIcon?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  size = 'md',
  showTagline = false,
  withLink = true,
  showIcon = true,
}) => {
  const sizeStyles = {
    sm: {
      text: 'text-base',
      com: 'text-[9px] px-1.5 py-0.5',
      icon: 'w-6 h-6',
      tagline: 'text-[8px]',
    },
    md: {
      text: 'text-xl',
      com: 'text-[11px] px-2 py-0.5',
      icon: 'w-8 h-8',
      tagline: 'text-[9px]',
    },
    lg: {
      text: 'text-2xl',
      com: 'text-xs px-2.5 py-1',
      icon: 'w-10 h-10',
      tagline: 'text-[10px]',
    },
    xl: {
      text: 'text-3xl sm:text-4xl',
      com: 'text-sm sm:text-base px-3 py-1',
      icon: 'w-14 h-14',
      tagline: 'text-xs',
    },
  };

  const content = (
    <div className={cn('inline-flex flex-col items-center select-none', className)}>
      <div className="inline-flex items-center gap-1.5 font-black tracking-tight leading-none">
        {showIcon && (
          <img 
            src="/logo.png" 
            alt="Creatlifafa" 
            className={cn('rounded-full object-contain shadow-sm drop-shadow', sizeStyles[size].icon)} 
          />
        )}
        <div className="flex items-center">
          <span className={cn('font-extrabold text-blue-700 tracking-tight font-sans', sizeStyles[size].text)}>
            Creat<span className="text-blue-900">lifafa</span>
          </span>
          <span
            className={cn(
              'ml-1 font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-full shadow-sm shadow-red-500/30 uppercase tracking-wide',
              sizeStyles[size].com
            )}
          >
            .com
          </span>
        </div>
      </div>
      {showTagline && (
        <div
          className={cn(
            'mt-1 font-semibold tracking-widest text-slate-500 uppercase flex items-center gap-1',
            sizeStyles[size].tagline
          )}
        >
          <span>Create</span>
          <span className="text-blue-500">•</span>
          <span className="text-red-500 font-bold">Share</span>
          <span className="text-blue-500">•</span>
          <span>Celebrate</span>
        </div>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link to="/dashboard" className="inline-flex items-center focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
};

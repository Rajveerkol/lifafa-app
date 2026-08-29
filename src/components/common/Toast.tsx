import React from 'react';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
}) => {
  const styles = {
    success: {
      container: 'bg-emerald-900/90 text-white border-emerald-500/30',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    info: {
      container: 'bg-slate-900/90 text-white border-blue-500/30',
      icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
    },
    warning: {
      container: 'bg-amber-950/90 text-white border-amber-500/30',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    },
    error: {
      container: 'bg-red-950/90 text-white border-red-500/30',
      icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-xl backdrop-blur-md border text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-4',
        currentStyle.container
      )}
    >
      <div className="flex items-center gap-2.5">
        {currentStyle.icon}
        <p className="leading-snug text-xs sm:text-sm text-slate-100">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

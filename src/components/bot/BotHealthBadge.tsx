import React from 'react';

interface BotHealthBadgeProps {
  status: 'CONNECTED' | 'DISCONNECTED' | 'WARNING' | 'ACTIVE' | 'INACTIVE' | 'HEALTHY' | 'DEGRADED' | string;
  label?: string;
  className?: string;
}

export const BotHealthBadge: React.FC<BotHealthBadgeProps> = ({ status, label, className = '' }) => {
  const norm = (status || '').toUpperCase();
  const isHealthy = norm === 'CONNECTED' || norm === 'ACTIVE' || norm === 'HEALTHY';
  const isWarning = norm === 'WARNING' || norm === 'DEGRADED';

  const displayText = label || norm;

  if (isHealthy) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 shadow-2xs ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        {displayText}
      </span>
    );
  }

  if (isWarning) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black border border-amber-200 shadow-2xs ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {displayText}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-black border border-red-200 shadow-2xs ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      {displayText}
    </span>
  );
};

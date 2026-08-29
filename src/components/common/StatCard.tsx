import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  isPositive?: boolean;
  subtitle?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  isPositive = true,
  subtitle,
  className,
}) => {
  return (
    <Card className={cn('flex flex-col justify-between p-4', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              'text-xs font-bold px-1.5 py-0.5 rounded-md flex items-center',
              isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            )}
          >
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-400 font-medium">{subtitle}</p>
      )}
    </Card>
  );
};

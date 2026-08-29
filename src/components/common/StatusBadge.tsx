import React from 'react';
import { Badge } from './Badge';
import { CheckCircle2, Clock, XCircle, ShieldCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normalized = status.toLowerCase();

  if (normalized === 'active' || normalized === 'completed' || normalized === 'success') {
    return (
      <Badge variant="success" className={className}>
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>{status}</span>
      </Badge>
    );
  }

  if (normalized === 'pending' || normalized === 'processing') {
    return (
      <Badge variant="warning" className={className}>
        <Clock className="w-3 h-3 text-amber-600" />
        <span>{status}</span>
      </Badge>
    );
  }

  if (normalized === 'failed' || normalized === 'inactive' || normalized === 'cancelled') {
    return (
      <Badge variant="danger" className={className}>
        <XCircle className="w-3 h-3 text-red-600" />
        <span>{status}</span>
      </Badge>
    );
  }

  if (normalized.includes('trusted') || normalized.includes('verified')) {
    return (
      <Badge variant="primary" className={className}>
        <ShieldCheck className="w-3 h-3 text-blue-600" />
        <span>{status}</span>
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={className}>
      {status}
    </Badge>
  );
};

import React from 'react';
import { StockStatus } from '@/lib/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'rose' | 'sky' | 'zinc';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'zinc',
  size = 'md',
  pulse = false
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    zinc: 'bg-zinc-800/60 text-zinc-300 border-zinc-700/50'
  }[variant];

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${variantStyles} ${sizeStyles}`}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            variant === 'emerald' ? 'bg-emerald-400' :
            variant === 'amber' ? 'bg-amber-400' :
            variant === 'rose' ? 'bg-rose-400' : 'bg-sky-400'
          }`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            variant === 'emerald' ? 'bg-emerald-500' :
            variant === 'amber' ? 'bg-amber-500' :
            variant === 'rose' ? 'bg-rose-500' : 'bg-sky-500'
          }`} />
        </span>
      )}
      {children}
    </span>
  );
};

export const StockBadge: React.FC<{ status: StockStatus; stock: number }> = ({ status, stock }) => {
  if (status === 'out_of_stock') {
    return <Badge variant="rose" pulse>Agotado ({stock})</Badge>;
  }
  if (status === 'low_stock') {
    return <Badge variant="amber" pulse>Stock Bajo ({stock})</Badge>;
  }
  return <Badge variant="emerald">En Stock ({stock})</Badge>;
};

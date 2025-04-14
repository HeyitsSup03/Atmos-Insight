import { ReactNode } from 'react';
import clsx from 'clsx';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={clsx(
        'bg-glass backdrop-blur-glass',
        'border border-glass-border rounded-2xl',
        'shadow-lg transition-transform duration-300',
        'hover:scale-[1.02] hover:shadow-xl',
        className
      )}
    >
      {children}
    </div>
  );
}
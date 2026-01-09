import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  onClick,
  className,
  children,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card border border-border rounded-xl p-5 transition-all duration-200',
        onClick && 'cursor-pointer hover:border-foreground/20 hover:shadow-md hover:-translate-y-0.5',
        'fade-in',
        className
      )}
    >
      {Icon && (
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary mb-3">
          <Icon className="w-5 h-5 text-foreground" />
        </div>
      )}
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && trendValue && (
            <span
              className={cn(
                'text-xs font-medium px-1.5 py-0.5 rounded',
                trend === 'up' && 'bg-success/10 text-success',
                trend === 'down' && 'bg-destructive/10 text-destructive',
                trend === 'neutral' && 'bg-muted text-muted-foreground'
              )}
            >
              {trendValue}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

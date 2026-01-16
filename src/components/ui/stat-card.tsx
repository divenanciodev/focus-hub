import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';
import { Button } from './button';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconBgClassName?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
  hideable?: boolean;
  isHidden?: boolean;
  onToggleHidden?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgClassName,
  trend,
  trendValue,
  onClick,
  className,
  children,
  hideable = false,
  isHidden = false,
  onToggleHidden,
}: StatCardProps) {
  const handleToggleHidden = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleHidden?.();
  };

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
      <div className="flex items-start justify-between">
        {Icon && (
          <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg bg-secondary mb-3", iconBgClassName)}>
            <Icon className="w-5 h-5 text-foreground" />
          </div>
        )}
        {hideable && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mt-1 -mr-1"
            onClick={handleToggleHidden}
            title={isHidden ? 'Mostrar valor' : 'Ocultar valor'}
          >
            {isHidden ? (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Eye className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className={cn(
            "text-2xl font-bold text-foreground transition-all",
            isHidden && "blur-md select-none"
          )}>
            {value}
          </p>
          {trend && trendValue && (
            <span
              className={cn(
                'text-xs font-medium px-1.5 py-0.5 rounded',
                trend === 'up' && 'bg-success/10 text-success',
                trend === 'down' && 'bg-destructive/10 text-destructive',
                trend === 'neutral' && 'bg-muted text-muted-foreground',
                isHidden && "blur-md select-none"
              )}
            >
              {trendValue}
            </span>
          )}
        </div>
        {subtitle && (
          <p className={cn(
            "text-xs text-muted-foreground mt-1",
            isHidden && "blur-md select-none"
          )}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

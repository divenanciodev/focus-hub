import { LucideIcon, type LucideProps } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon | ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
  className,
}: EmptyStateProps) {
  const isLucideIcon = typeof Icon === 'function';
  
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        {isLucideIcon ? (
          <Icon className="w-8 h-8 text-muted-foreground" />
        ) : (
          <div className="text-muted-foreground">{Icon}</div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">{description}</p>
      {action ? action : (actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      ))}
    </div>
  );
}

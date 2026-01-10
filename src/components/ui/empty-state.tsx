import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { ReactNode, isValidElement } from 'react';

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
  // Check if Icon is a valid React element (already rendered) or a Lucide component
  const isReactElement = isValidElement(Icon);
  
  const renderIcon = () => {
    if (isReactElement) {
      // It's already a React element (e.g., <SomeIcon />)
      return <div className="text-muted-foreground">{Icon}</div>;
    }
    
    // It's a component reference (LucideIcon)
    if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && '$$typeof' in Icon)) {
      const IconComponent = Icon as LucideIcon;
      return <IconComponent className="w-8 h-8 text-muted-foreground" />;
    }
    
    // Fallback
    return <div className="text-muted-foreground">{Icon as ReactNode}</div>;
  };
  
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        {renderIcon()}
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

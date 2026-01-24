import { useStudyReviews } from '@/hooks/useStudyReviews';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PendingReviewsBadgeProps {
  disciplineId?: string;
  showTooltip?: boolean;
}

export function PendingReviewsBadge({ disciplineId, showTooltip = true }: PendingReviewsBadgeProps) {
  const { pendingReviews } = useStudyReviews(disciplineId);

  const filteredReviews = disciplineId 
    ? pendingReviews.filter(r => r.disciplineId === disciplineId)
    : pendingReviews;

  const overdueCount = filteredReviews.filter(r => r.isOverdue).length;
  const todayCount = filteredReviews.filter(r => {
    const today = new Date();
    return !r.isOverdue && 
      r.dueDate.toDateString() === today.toDateString();
  }).length;
  const totalPending = overdueCount + todayCount;

  if (totalPending === 0) return null;

  const badge = (
    <Badge 
      variant={overdueCount > 0 ? 'destructive' : 'secondary'}
      className="flex items-center gap-1 text-xs"
    >
      {overdueCount > 0 ? (
        <AlertCircle className="w-3 h-3" />
      ) : (
        <Clock className="w-3 h-3" />
      )}
      {totalPending} revisão(ões)
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            {overdueCount > 0 && (
              <p className="text-destructive font-medium">
                {overdueCount} revisão(ões) atrasada(s)
              </p>
            )}
            {todayCount > 0 && (
              <p>{todayCount} revisão(ões) para hoje</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

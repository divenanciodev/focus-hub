import { useState } from 'react';
import { CheckCircle2, Circle, Clock, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudyReviews, StudyReview } from '@/hooks/useStudyReviews';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SubtopicReviewItemProps {
  disciplineId: string;
  subtopic: string;
  index: number;
}

export function SubtopicReviewItem({ disciplineId, subtopic, index }: SubtopicReviewItemProps) {
  const { isSubtopicStudied, markAsStudied, unmarkAsStudied } = useStudyReviews(disciplineId);
  const [loading, setLoading] = useState(false);

  const review = isSubtopicStudied(subtopic);
  const isStudied = !!review;

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isStudied && review) {
        await unmarkAsStudied(review.id);
      } else {
        await markAsStudied(disciplineId, subtopic);
      }
    } finally {
      setLoading(false);
    }
  };

  const getNextReviewInfo = (review: StudyReview): { label: string; date: Date; type: number } | null => {
    const now = new Date();
    
    if (!review.review1Completed) {
      return { label: '1º dia', date: review.review1Due, type: 1 };
    }
    if (!review.review3Completed) {
      return { label: '3º dia', date: review.review3Due, type: 3 };
    }
    if (!review.review7Completed) {
      return { label: '7º dia', date: review.review7Due, type: 7 };
    }
    if (!review.review15Completed) {
      return { label: '15º dia', date: review.review15Due, type: 15 };
    }
    return null;
  };

  const getCompletedReviews = (review: StudyReview): number => {
    let count = 0;
    if (review.review1Completed) count++;
    if (review.review3Completed) count++;
    if (review.review7Completed) count++;
    if (review.review15Completed) count++;
    return count;
  };

  const nextReview = review ? getNextReviewInfo(review) : null;
  const completedCount = review ? getCompletedReviews(review) : 0;
  const isAllCompleted = completedCount === 4;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-colors',
        isStudied 
          ? isAllCompleted 
            ? 'bg-success/10 border border-success/20' 
            : 'bg-primary/10 border border-primary/20'
          : 'bg-secondary/50 hover:bg-secondary'
      )}
    >
      <button 
        onClick={handleToggle}
        disabled={loading}
        className="flex-shrink-0"
      >
        {isStudied ? (
          <CheckCircle2 className={cn(
            'w-5 h-5 transition-colors',
            isAllCompleted ? 'text-success' : 'text-primary'
          )} />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
        )}
      </button>

      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium text-muted-foreground flex-shrink-0">
        {index + 1}
      </div>

      <span className={cn(
        'flex-1 text-sm',
        isStudied && 'text-foreground font-medium'
      )}>
        {subtopic}
      </span>

      {isStudied && review && (
        <div className="flex items-center gap-2">
          {/* Progress indicator */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs">
                  {completedCount}/4 revisões
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs space-y-1">
                  <p className={review.review1Completed ? 'text-success' : ''}>
                    1 dia: {review.review1Completed ? '✓ Concluído' : format(review.review1Due, "dd/MM", { locale: ptBR })}
                  </p>
                  <p className={review.review3Completed ? 'text-success' : ''}>
                    3 dias: {review.review3Completed ? '✓ Concluído' : format(review.review3Due, "dd/MM", { locale: ptBR })}
                  </p>
                  <p className={review.review7Completed ? 'text-success' : ''}>
                    7 dias: {review.review7Completed ? '✓ Concluído' : format(review.review7Due, "dd/MM", { locale: ptBR })}
                  </p>
                  <p className={review.review15Completed ? 'text-success' : ''}>
                    15 dias: {review.review15Completed ? '✓ Concluído' : format(review.review15Due, "dd/MM", { locale: ptBR })}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {nextReview && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge 
                    variant={nextReview.date <= new Date() ? 'destructive' : 'secondary'}
                    className="text-xs flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    {nextReview.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    Próxima revisão: {format(nextReview.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {isAllCompleted && (
            <Badge variant="default" className="text-xs bg-success text-success-foreground">
              Concluído
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

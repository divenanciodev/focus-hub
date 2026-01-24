import { useStudyReviews, PendingReview } from '@/hooks/useStudyReviews';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface PendingReviewsListProps {
  disciplineId?: string;
  compact?: boolean;
}

export function PendingReviewsList({ disciplineId, compact = false }: PendingReviewsListProps) {
  const { pendingReviews, completeReview, loading } = useStudyReviews(disciplineId);
  const navigate = useNavigate();

  const filteredReviews = disciplineId 
    ? pendingReviews.filter(r => r.disciplineId === disciplineId)
    : pendingReviews;

  // Group reviews by status
  const overdueReviews = filteredReviews.filter(r => r.isOverdue);
  const todayReviews = filteredReviews.filter(r => !r.isOverdue && isToday(r.dueDate));
  const upcomingReviews = filteredReviews.filter(r => !r.isOverdue && !isToday(r.dueDate));

  const handleComplete = async (review: PendingReview) => {
    await completeReview(review.id, review.reviewType);
  };

  const formatDueDate = (date: Date, isOverdue: boolean): string => {
    if (isOverdue) {
      return `Atrasada ${formatDistanceToNow(date, { locale: ptBR, addSuffix: false })}`;
    }
    if (isToday(date)) {
      return 'Hoje';
    }
    if (isTomorrow(date)) {
      return 'Amanhã';
    }
    return format(date, "dd/MM", { locale: ptBR });
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Carregando revisões...
      </div>
    );
  }

  if (filteredReviews.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Nenhuma revisão pendente.</p>
        <p className="text-xs mt-1">Marque subtópicos como estudados na Grade Curricular para iniciar o sistema de revisão espaçada.</p>
      </div>
    );
  }

  const renderReviewItem = (review: PendingReview) => (
    <div
      key={`${review.id}-${review.reviewType}`}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-colors',
        review.isOverdue 
          ? 'bg-destructive/10 border border-destructive/20' 
          : 'bg-secondary/50 hover:bg-secondary'
      )}
    >
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold',
        review.isOverdue 
          ? 'bg-destructive/20 text-destructive' 
          : 'bg-primary/20 text-primary'
      )}>
        {review.reviewType}d
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {review.subtopic}
        </p>
        {!disciplineId && (
          <p className="text-xs text-muted-foreground truncate">
            {review.disciplineName}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Badge 
          variant={review.isOverdue ? 'destructive' : 'outline'}
          className="text-xs flex items-center gap-1"
        >
          {review.isOverdue ? (
            <AlertCircle className="w-3 h-3" />
          ) : (
            <Clock className="w-3 h-3" />
          )}
          {formatDueDate(review.dueDate, review.isOverdue)}
        </Badge>

        <Button
          size="sm"
          variant={review.isOverdue ? 'destructive' : 'default'}
          onClick={() => handleComplete(review)}
          className="h-7 px-2"
        >
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Revisei
        </Button>
      </div>
    </div>
  );

  if (compact) {
    // Show only first 3 reviews in compact mode
    const displayReviews = [...overdueReviews, ...todayReviews, ...upcomingReviews].slice(0, 3);
    return (
      <div className="space-y-2">
        {displayReviews.map(renderReviewItem)}
        {filteredReviews.length > 3 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => disciplineId && navigate(`/estudos/${disciplineId}`)}
          >
            Ver todas ({filteredReviews.length} pendentes)
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {overdueReviews.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-destructive flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4" />
            Atrasadas ({overdueReviews.length})
          </h4>
          <div className="space-y-2">
            {overdueReviews.map(renderReviewItem)}
          </div>
        </div>
      )}

      {todayReviews.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" />
            Para Hoje ({todayReviews.length})
          </h4>
          <div className="space-y-2">
            {todayReviews.map(renderReviewItem)}
          </div>
        </div>
      )}

      {upcomingReviews.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4" />
            Próximas ({upcomingReviews.length})
          </h4>
          <div className="space-y-2">
            {upcomingReviews.slice(0, 5).map(renderReviewItem)}
            {upcomingReviews.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                + {upcomingReviews.length - 5} mais revisões agendadas
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

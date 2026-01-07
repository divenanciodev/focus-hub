import { useState, useEffect, useCallback } from 'react';
import { FlashcardGroup, FlashcardCard } from '@/types/flashcards';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FlipCard } from './FlipCard';
import { 
  ArrowLeft, 
  ArrowRight, 
  X, 
  Check, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface FlashcardPracticeProps {
  group: FlashcardGroup;
  onClose: () => void;
  onComplete: () => void;
}

export function FlashcardPractice({ group, onClose, onComplete }: FlashcardPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [cardKey, setCardKey] = useState(0); // Force re-render of FlipCard

  const currentCard = group.cards[currentIndex];
  const progress = ((currentIndex + 1) / group.cards.length) * 100;

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
    });
  }, []);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setShowFeedback('correct');
      setCorrectCount(c => c + 1);
      triggerConfetti();
    } else {
      setShowFeedback('incorrect');
    }
  };

  const handleNext = () => {
    if (currentIndex < group.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowFeedback(null);
      setCardKey(k => k + 1);
    } else {
      setIsComplete(true);
      if (correctCount >= group.cards.length * 0.7) {
        triggerConfetti();
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowFeedback(null);
      setCardKey(k => k + 1);
    }
  };

  const handleMarkCorrect = () => {
    setCorrectCount(c => c + 1);
    triggerConfetti();
    setShowFeedback('correct');
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setIsComplete(false);
    setShowFeedback(null);
    setCardKey(k => k + 1);
  };

  // Completion screen
  if (isComplete) {
    const percentage = Math.round((correctCount / group.cards.length) * 100);
    
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Parabéns! 🎉
          </h2>
          <p className="text-muted-foreground mb-8">
            Você completou o estudo de "{group.name}"
          </p>

          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <div className="text-5xl font-bold text-foreground mb-2">
              {percentage}%
            </div>
            <p className="text-muted-foreground">
              {correctCount} de {group.cards.length} cartões corretos
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRestart} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Refazer
            </Button>
            <Button onClick={() => { onComplete(); onClose(); }} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Concluir
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="text-center">
          <h2 className="font-semibold text-foreground">{group.name}</h2>
          <p className="text-sm text-muted-foreground">
            Cartão {currentIndex + 1} de {group.cards.length}
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </header>

      {/* Progress */}
      <div className="px-4 py-2">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Card Area */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Navigation buttons */}
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={cn(
            "absolute left-4 w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center transition-all",
            currentIndex === 0 
              ? "opacity-30 cursor-not-allowed" 
              : "hover:bg-secondary hover:scale-105"
          )}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Card with animation wrapper */}
        <div 
          className={cn(
            "transition-all duration-300 animate-fade-in",
            showFeedback === 'correct' && "scale-105",
            showFeedback === 'incorrect' && "animate-shake"
          )}
        >
          <FlipCard 
            key={cardKey}
            card={currentCard} 
            onAnswer={currentCard.type === 'multiple-choice' ? handleAnswer : undefined}
          />
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === group.cards.length - 1 && !showFeedback}
          className={cn(
            "absolute right-4 w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center transition-all",
            "hover:bg-secondary hover:scale-105"
          )}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Feedback overlay */}
      {showFeedback && (
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center pointer-events-none z-10",
            showFeedback === 'correct' ? "bg-green-500/10" : "bg-red-500/10"
          )}
        >
          <div className={cn(
            "text-center animate-scale-in",
            showFeedback === 'correct' ? "text-green-600" : "text-red-600"
          )}>
            {showFeedback === 'correct' ? (
              <>
                <Sparkles className="w-16 h-16 mx-auto mb-2" />
                <p className="text-2xl font-bold">🎉 ACERTOU!!</p>
              </>
            ) : (
              <p className="text-xl font-medium">Resposta Incorreta</p>
            )}
          </div>
        </div>
      )}

      {/* Footer - Action buttons for flip cards */}
      {currentCard.type !== 'multiple-choice' && (
        <footer className="p-4 border-t border-border">
          <div className="max-w-md mx-auto flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleNext}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Errei
            </Button>
            <Button 
              onClick={handleMarkCorrect}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Acertei
            </Button>
          </div>
          
          <p className="text-center text-xs text-muted-foreground mt-3">
            Clique no cartão para virar e ver a resposta
          </p>
        </footer>
      )}

      {/* Footer for multiple choice - continue button */}
      {currentCard.type === 'multiple-choice' && showFeedback && (
        <footer className="p-4 border-t border-border">
          <div className="max-w-md mx-auto">
            <Button onClick={handleNext} className="w-full">
              <ArrowRight className="w-4 h-4 mr-2" />
              Continuar
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}

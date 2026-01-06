import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FlashcardDeck, FlashcardItem, FlashcardDifficulty } from '@/types/training';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Shuffle, 
  X,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashcardStudyModeProps {
  deck: FlashcardDeck;
  onClose: () => void;
  onComplete: (results: { easy: number; medium: number; hard: number }) => void;
}

type StudyMode = 'sequential' | 'random' | 'review';

export function FlashcardStudyMode({
  deck,
  onClose,
  onComplete,
}: FlashcardStudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>('sequential');
  const [shuffledCards, setShuffledCards] = useState<FlashcardItem[]>(deck.cards);
  const [cardResults, setCardResults] = useState<Record<string, FlashcardDifficulty>>({});
  const [isComplete, setIsComplete] = useState(false);

  const currentCards = studyMode === 'random' ? shuffledCards : deck.cards;
  const currentCard = currentCards[currentIndex];
  const progress = ((currentIndex + 1) / currentCards.length) * 100;

  const shuffleCards = useCallback(() => {
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudyMode('random');
  }, [deck.cards]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < currentCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      finishStudy();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleDifficultyMark = (difficulty: FlashcardDifficulty) => {
    setCardResults({
      ...cardResults,
      [currentCard.id]: difficulty,
    });
    handleNext();
  };

  const finishStudy = () => {
    const results = {
      easy: Object.values(cardResults).filter(d => d === 'easy').length,
      medium: Object.values(cardResults).filter(d => d === 'medium').length,
      hard: Object.values(cardResults).filter(d => d === 'hard').length,
    };
    setIsComplete(true);
    onComplete(results);
  };

  const restartStudy = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCardResults({});
    setIsComplete(false);
  };

  if (isComplete) {
    const results = {
      easy: Object.values(cardResults).filter(d => d === 'easy').length,
      medium: Object.values(cardResults).filter(d => d === 'medium').length,
      hard: Object.values(cardResults).filter(d => d === 'hard').length,
    };
    const total = deck.cards.length;

    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Estudo Concluído! 🎉</h2>
          <p className="text-muted-foreground mb-6">Você revisou {total} cartões</p>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
              <span className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-green-500" />
                Fáceis
              </span>
              <span className="font-bold text-green-500">{results.easy}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
              <span className="flex items-center gap-2">
                <Minus className="w-4 h-4 text-yellow-500" />
                Médios
              </span>
              <span className="font-bold text-yellow-500">{results.medium}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
              <span className="flex items-center gap-2">
                <ThumbsDown className="w-4 h-4 text-red-500" />
                Difíceis
              </span>
              <span className="font-bold text-red-500">{results.hard}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={restartStudy} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Revisar novamente
            </Button>
            <Button onClick={onClose} className="flex-1">
              Finalizar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-semibold">{deck.name}</h2>
            <p className="text-sm text-muted-foreground">{deck.discipline}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={studyMode === 'sequential' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => {
              setStudyMode('sequential');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
          >
            Sequencial
          </Button>
          <Button
            variant={studyMode === 'random' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={shuffleCards}
          >
            <Shuffle className="w-4 h-4 mr-1" />
            Aleatório
          </Button>
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
          <span>Cartão {currentIndex + 1} de {currentCards.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div
          onClick={handleFlip}
          className={cn(
            "w-full max-w-2xl aspect-[3/2] cursor-pointer perspective-1000",
            "transition-transform duration-500 transform-style-preserve-3d",
            isFlipped && "rotate-y-180"
          )}
        >
          <div
            className={cn(
              "absolute inset-0 rounded-2xl border-2 border-border shadow-lg p-8",
              "flex items-center justify-center text-center backface-hidden",
              "bg-card"
            )}
          >
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">
                {isFlipped ? 'Resposta' : 'Pergunta'}
              </p>
              <p className="text-xl md:text-2xl font-medium">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              {!isFlipped && (
                <p className="text-sm text-muted-foreground mt-6">
                  Clique para ver a resposta
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Controls */}
      <footer className="border-t border-border p-4">
        {isFlipped ? (
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-sm text-muted-foreground mb-3">
              Como foi esse cartão?
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => handleDifficultyMark('hard')}
                className="flex-1 max-w-32 border-red-500/30 hover:bg-red-500/10"
              >
                <ThumbsDown className="w-4 h-4 mr-2 text-red-500" />
                Difícil
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDifficultyMark('medium')}
                className="flex-1 max-w-32 border-yellow-500/30 hover:bg-yellow-500/10"
              >
                <Minus className="w-4 h-4 mr-2 text-yellow-500" />
                Médio
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDifficultyMark('easy')}
                className="flex-1 max-w-32 border-green-500/30 hover:bg-green-500/10"
              >
                <ThumbsUp className="w-4 h-4 mr-2 text-green-500" />
                Fácil
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Anterior
            </Button>
            <Button size="lg" onClick={handleFlip}>
              Virar cartão
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleNext}
            >
              Pular
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </footer>
    </div>
  );
}

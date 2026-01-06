import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FlashcardDeck, FlashcardItem, FlashcardDifficulty, FlashcardContent } from '@/types/training';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Shuffle, 
  X,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Clock,
  Bookmark,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Info,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashcardStudyModeProps {
  deck: FlashcardDeck;
  onClose: () => void;
  onComplete: (results: { easy: number; medium: number; hard: number }) => void;
}

type StudyMode = 'sequential' | 'random' | 'review';

// Helper to get text from content
function getContentText(content: string | FlashcardContent): string {
  if (typeof content === 'string') return content;
  return content.mainText || '';
}

function getContentHint(content: string | FlashcardContent): string | undefined {
  if (typeof content === 'string') return undefined;
  return content.hint;
}

function getContentExample(content: string | FlashcardContent): string | undefined {
  if (typeof content === 'string') return undefined;
  return content.example;
}

function getContentBulletPoints(content: string | FlashcardContent): string[] | undefined {
  if (typeof content === 'string') return undefined;
  return content.bulletPoints;
}

function getContentNote(content: string | FlashcardContent): string | undefined {
  if (typeof content === 'string') return undefined;
  return content.note;
}

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
  const [showHint, setShowHint] = useState(false);
  const [bookmarkedCards, setBookmarkedCards] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState(Date.now());
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  
  // For interactive card types
  const [selectedMCOption, setSelectedMCOption] = useState<string | null>(null);
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);

  const currentCards = studyMode === 'random' ? shuffledCards : deck.cards;
  const currentCard = currentCards[currentIndex];
  const progress = ((currentIndex + 1) / currentCards.length) * 100;
  const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);

  const hint = currentCard ? getContentHint(currentCard.front) : undefined;

  useEffect(() => {
    setCardStartTime(Date.now());
    setShowHint(false);
    setSelectedMCOption(null);
    setTfAnswer(null);
  }, [currentIndex]);

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

  const toggleBookmark = () => {
    const newBookmarked = new Set(bookmarkedCards);
    if (newBookmarked.has(currentCard.id)) {
      newBookmarked.delete(currentCard.id);
    } else {
      newBookmarked.add(currentCard.id);
    }
    setBookmarkedCards(newBookmarked);
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
    setStartTime(Date.now());
  };

  const handleMCSubmit = (optionId: string) => {
    setSelectedMCOption(optionId);
    // Auto flip after selection
    setTimeout(() => setIsFlipped(true), 500);
  };

  const handleTFSubmit = (answer: boolean) => {
    setTfAnswer(answer);
    // Auto flip after selection
    setTimeout(() => setIsFlipped(true), 500);
  };

  // Completion screen
  if (isComplete) {
    const results = {
      easy: Object.values(cardResults).filter(d => d === 'easy').length,
      medium: Object.values(cardResults).filter(d => d === 'medium').length,
      hard: Object.values(cardResults).filter(d => d === 'hard').length,
    };
    const total = deck.cards.length;
    const accuracy = total > 0 ? Math.round((results.easy / total) * 100) : 0;

    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center animate-scale-in">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Estudo Concluído!</h2>
          <p className="text-muted-foreground mb-6">
            Você revisou {total} cartões em {elapsedMinutes || '<1'} min
          </p>
          
          {/* Stats */}
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

          {/* Bookmarked */}
          {bookmarkedCards.size > 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              <Bookmark className="w-4 h-4 inline mr-1" />
              {bookmarkedCards.size} cartões marcados para revisão
            </p>
          )}

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

  // Get card content
  const frontText = getContentText(currentCard.front);
  const backText = getContentText(currentCard.back);
  const backExample = getContentExample(currentCard.back);
  const backBulletPoints = getContentBulletPoints(currentCard.back);
  const backNote = getContentNote(currentCard.back);

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
        
        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {elapsedMinutes}min
          </div>
          
          {/* Study mode toggle */}
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
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          {/* Card type badge */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline" className="text-xs">
              {currentCard.type === 'direct' && '❓ Pergunta Direta'}
              {currentCard.type === 'true-false' && '✅ Verdadeiro ou Falso'}
              {currentCard.type === 'fill-blank' && '📝 Completar'}
              {currentCard.type === 'concept-definition' && '📚 Conceito'}
              {currentCard.type === 'multiple-choice' && '🔘 Múltipla Escolha'}
              {currentCard.type === 'contextual' && '📖 Contextual'}
              {currentCard.type === 'reversible' && '🔄 Reversível'}
              {currentCard.type === 'association' && '🔗 Associação'}
              {currentCard.type === 'ordering' && '📊 Ordenação'}
              {currentCard.type === 'visual' && '🖼️ Visual'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className={cn(bookmarkedCards.has(currentCard.id) && "text-amber-500")}
              onClick={toggleBookmark}
            >
              <Bookmark className={cn("w-4 h-4", bookmarkedCards.has(currentCard.id) && "fill-current")} />
            </Button>
          </div>

          {/* The card */}
          <div
            onClick={handleFlip}
            className={cn(
              "relative cursor-pointer select-none",
              "min-h-[350px] md:min-h-[400px]",
            )}
            style={{ perspective: '1000px' }}
          >
            <div
              className={cn(
                "absolute inset-0 w-full h-full transition-transform duration-500",
              )}
              style={{ 
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front */}
              <div
                className={cn(
                  "absolute inset-0 w-full h-full rounded-2xl border-2 shadow-lg p-6 md:p-8",
                  "flex flex-col bg-card border-border"
                )}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">
                    Pergunta
                  </p>
                  <p className="text-xl md:text-2xl font-medium mb-6">
                    {frontText}
                  </p>

                  {/* Multiple choice options */}
                  {currentCard.type === 'multiple-choice' && currentCard.multipleChoiceOptions && (
                    <div className="w-full max-w-md space-y-2 mt-4">
                      {currentCard.multipleChoiceOptions.map((option, idx) => (
                        <button
                          key={option.id}
                          onClick={(e) => { e.stopPropagation(); handleMCSubmit(option.id); }}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border transition-all text-sm",
                            selectedMCOption === option.id
                              ? option.isCorrect
                                ? "border-green-500 bg-green-500/10"
                                : "border-red-500 bg-red-500/10"
                              : "border-border hover:border-primary/50 hover:bg-secondary/50"
                          )}
                          disabled={selectedMCOption !== null}
                        >
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + idx)})
                          </span>
                          {option.text}
                          {selectedMCOption === option.id && (
                            <span className="float-right">
                              {option.isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* True/False buttons */}
                  {currentCard.type === 'true-false' && (
                    <div className="flex gap-3 mt-4">
                      <Button
                        variant={tfAnswer === true 
                          ? (currentCard.trueFalseAnswer === true ? "default" : "destructive")
                          : "outline"
                        }
                        className={cn("px-8", tfAnswer === true && currentCard.trueFalseAnswer === true && "bg-green-600")}
                        onClick={(e) => { e.stopPropagation(); handleTFSubmit(true); }}
                        disabled={tfAnswer !== null}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Verdadeiro
                      </Button>
                      <Button
                        variant={tfAnswer === false 
                          ? (currentCard.trueFalseAnswer === false ? "default" : "destructive")
                          : "outline"
                        }
                        className={cn("px-8", tfAnswer === false && currentCard.trueFalseAnswer === false && "bg-green-600")}
                        onClick={(e) => { e.stopPropagation(); handleTFSubmit(false); }}
                        disabled={tfAnswer !== null}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Falso
                      </Button>
                    </div>
                  )}

                  {/* Show hint button */}
                  {hint && !showHint && currentCard.type !== 'multiple-choice' && currentCard.type !== 'true-false' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 text-amber-500"
                      onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Ver dica
                    </Button>
                  )}

                  {/* Hint displayed */}
                  {hint && showHint && (
                    <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm max-w-md">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-amber-600 dark:text-amber-400">{hint}</span>
                    </div>
                  )}
                </div>

                {currentCard.type !== 'multiple-choice' && currentCard.type !== 'true-false' && (
                  <p className="text-sm text-muted-foreground text-center">
                    Clique para ver a resposta
                  </p>
                )}
              </div>

              {/* Back */}
              <div
                className={cn(
                  "absolute inset-0 w-full h-full rounded-2xl border-2 shadow-lg p-6 md:p-8",
                  "flex flex-col bg-card border-primary/30"
                )}
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="flex-1 flex flex-col items-center justify-center text-center overflow-y-auto">
                  <p className="text-xs text-primary uppercase tracking-wide mb-4">
                    Resposta
                  </p>
                  <p className="text-xl md:text-2xl font-medium mb-4">
                    {backText}
                  </p>

                  {/* Bullet points */}
                  {backBulletPoints && backBulletPoints.length > 0 && (
                    <ul className="mt-4 space-y-2 text-left max-w-md">
                      {backBulletPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-primary">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* True/False explanation */}
                  {currentCard.type === 'true-false' && currentCard.trueFalseExplanation && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 max-w-md">
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                        📝 Explicação
                      </p>
                      <p className="text-sm">{currentCard.trueFalseExplanation}</p>
                    </div>
                  )}

                  {/* Example */}
                  {backExample && (
                    <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 max-w-md">
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                        💡 Exemplo
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        {backExample}
                      </p>
                    </div>
                  )}

                  {/* Note */}
                  {backNote && (
                    <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground max-w-md">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{backNote}</span>
                    </div>
                  )}
                </div>
              </div>
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

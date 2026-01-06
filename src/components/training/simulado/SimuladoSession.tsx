import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Simulado, SimuladoQuestion } from '@/types/training';
import { 
  ArrowLeft, 
  ArrowRight, 
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimuladoSessionProps {
  simulado: Simulado;
  onClose: () => void;
  onComplete: (results: { score: number; answers: Record<string, number | string> }) => void;
}

export function SimuladoSession({
  simulado,
  onClose,
  onComplete,
}: SimuladoSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(simulado.timeMinutes * 60);
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentQuestion = simulado.questions[currentIndex];
  const progress = ((currentIndex + 1) / simulado.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  // Timer
  useEffect(() => {
    if (isPaused || isComplete) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishSimulado();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: number | string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: answer,
    });
  };

  const handleNext = () => {
    if (currentIndex < simulado.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQuestion.id)) {
      newFlagged.delete(currentQuestion.id);
    } else {
      newFlagged.add(currentQuestion.id);
    }
    setFlagged(newFlagged);
  };

  const finishSimulado = useCallback(() => {
    let correct = 0;
    simulado.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    const score = Math.round((correct / simulado.questions.length) * 100);
    setIsComplete(true);
    onComplete({ score, answers });
  }, [answers, simulado.questions, onComplete]);

  if (isComplete) {
    let correct = 0;
    simulado.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    const score = Math.round((correct / simulado.questions.length) * 100);

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Simulado Concluído!</h2>
            <p className="text-muted-foreground">{simulado.name}</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 text-center mb-8">
            <div className="text-6xl font-bold mb-2" style={{ color: score >= 70 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444' }}>
              {score}%
            </div>
            <p className="text-muted-foreground">
              {correct} de {simulado.questions.length} questões corretas
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="font-semibold">Revisão das questões</h3>
            {simulado.questions.map((q, index) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              
              return (
                <div
                  key={q.id}
                  className={cn(
                    "border rounded-lg p-4",
                    isCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-2">{index + 1}. {q.text}</p>
                      <div className="space-y-1 text-sm">
                        {q.options?.map((opt, optIndex) => (
                          <p
                            key={optIndex}
                            className={cn(
                              optIndex === q.correctAnswer && "text-green-600 font-medium",
                              optIndex === userAnswer && optIndex !== q.correctAnswer && "text-red-600 line-through"
                            )}
                          >
                            {String.fromCharCode(65 + optIndex)}) {opt}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onClose}>
              Voltar aos treinos
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
          <Button variant="ghost" size="icon" onClick={() => {
            if (confirm('Deseja sair do simulado? Seu progresso será perdido.')) {
              onClose();
            }
          }}>
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-semibold">{simulado.name}</h2>
            <p className="text-sm text-muted-foreground">{simulado.discipline}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold",
            timeLeft < 60 ? "bg-red-500/10 text-red-500" : "bg-secondary"
          )}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <Button onClick={() => setIsPaused(!isPaused)} variant="outline" size="sm">
            {isPaused ? 'Continuar' : 'Pausar'}
          </Button>
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 py-2 border-b border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
          <span>Questão {currentIndex + 1} de {simulado.questions.length}</span>
          <span>{answeredCount} respondidas</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {isPaused ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">Simulado pausado</p>
              <Button onClick={() => setIsPaused(false)} className="mt-4">
                Continuar
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground">
                    Questão {currentIndex + 1}
                  </span>
                  <p className="text-lg font-medium mt-2">{currentQuestion.text}</p>
                </div>
                <Button
                  variant={flagged.has(currentQuestion.id) ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={toggleFlag}
                >
                  <Flag className={cn(
                    "w-4 h-4",
                    flagged.has(currentQuestion.id) && "text-yellow-500"
                  )} />
                </Button>
              </div>

              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border-2 transition-all",
                      answers[currentQuestion.id] === index
                        ? "border-foreground bg-foreground/5"
                        : "border-border hover:border-foreground/30"
                    )}
                  >
                    <span className="font-medium mr-3">
                      {String.fromCharCode(65 + index)})
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Navigation */}
      <footer className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {/* Quick navigation */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto max-w-md">
            {simulado.questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-8 h-8 rounded text-xs font-medium transition-colors",
                  currentIndex === index && "ring-2 ring-foreground",
                  answers[q.id] !== undefined
                    ? "bg-foreground text-background"
                    : "bg-secondary",
                  flagged.has(q.id) && "ring-2 ring-yellow-500"
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentIndex === simulado.questions.length - 1 ? (
            <Button onClick={finishSimulado}>
              Finalizar
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Próxima
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

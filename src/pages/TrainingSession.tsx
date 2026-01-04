import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { mockQuestions, mockTrainings } from '@/data/mockData';
import { ArrowLeft, Clock, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TrainingSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const training = mockTrainings.find((t) => t.id === id);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(mockQuestions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(training?.timeMinutes ? training.timeMinutes * 60 : 30 * 60);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isFinished) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isFinished]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const calculateScore = () => {
    let correct = 0;
    mockQuestions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    return Math.round((correct / mockQuestions.length) * 100);
  };

  const handleFinish = () => {
    setIsFinished(true);
  };

  if (!training) {
    return (
      <div className="fade-in">
        <Button variant="ghost" onClick={() => navigate('/treinos')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <p className="text-muted-foreground mt-4">Treino não encontrado.</p>
      </div>
    );
  }

  if (isFinished) {
    const score = calculateScore();
    const correctCount = mockQuestions.filter((q, i) => answers[i] === q.correctIndex).length;

    return (
      <div className="fade-in max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className={cn(
            'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6',
            score >= 70 ? 'bg-success/10' : score >= 50 ? 'bg-warning/10' : 'bg-destructive/10'
          )}>
            <span className={cn(
              'text-3xl font-bold',
              score >= 70 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive'
            )}>
              {score}%
            </span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">Treino finalizado!</h2>
          <p className="text-muted-foreground mb-6">
            Você acertou {correctCount} de {mockQuestions.length} questões
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Acertos</p>
              <p className="text-2xl font-bold text-success">{correctCount}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Erros</p>
              <p className="text-2xl font-bold text-destructive">{mockQuestions.length - correctCount}</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/treinos')}>
              Voltar aos treinos
            </Button>
            <Button onClick={() => window.location.reload()}>
              Refazer treino
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const question = mockQuestions[currentQuestion];

  return (
    <div className="fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/treinos')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Sair
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span className={cn(
              'font-mono font-medium',
              timeLeft < 300 && 'text-destructive'
            )}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1}/{mockQuestions.length}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {mockQuestions.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              answers[i] !== null ? 'bg-foreground' : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Question */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <p className="text-foreground font-medium mb-6">{question.text}</p>

        <div className="space-y-3">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(i)}
              className={cn(
                'w-full p-4 rounded-lg border text-left transition-all duration-200',
                answers[currentQuestion] === i
                  ? 'border-foreground bg-foreground/5'
                  : 'border-border hover:border-foreground/30 hover:bg-secondary/50'
              )}
            >
              <div className="flex items-start gap-3">
                <span className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium flex-shrink-0',
                  answers[currentQuestion] === i
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm text-foreground">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>

        <Button
          variant="outline"
          onClick={handleFinish}
        >
          <Flag className="w-4 h-4 mr-2" />
          Finalizar
        </Button>

        <Button
          onClick={() => {
            if (currentQuestion === mockQuestions.length - 1) {
              handleFinish();
            } else {
              setCurrentQuestion((prev) => prev + 1);
            }
          }}
        >
          {currentQuestion === mockQuestions.length - 1 ? 'Finalizar' : 'Próxima'}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

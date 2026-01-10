import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSimulados } from '@/hooks/useSimulados';
import { ArrowLeft, Clock, ChevronLeft, ChevronRight, Flag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TrainingSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { simulados, loading, completeSimulado } = useSimulados();
  
  const simulado = simulados.find((s) => s.id === id);
  const questions = simulado?.questions || [];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (simulado) {
      setAnswers(new Array(questions.length).fill(null));
      setTimeLeft(simulado.timeMinutes * 60);
    }
  }, [simulado, questions.length]);

  useEffect(() => {
    if (isFinished || !simulado) return;

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
  }, [isFinished, simulado]);

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
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    return questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  };

  const handleFinish = async () => {
    setIsFinished(true);
    const score = calculateScore();
    if (id) {
      await completeSimulado(id, score);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!simulado || questions.length === 0) {
    return (
      <div className="fade-in">
        <Button variant="ghost" onClick={() => navigate('/treinos')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <p className="text-muted-foreground mt-4">Simulado não encontrado ou sem questões.</p>
      </div>
    );
  }

  if (isFinished) {
    const score = calculateScore();
    const correctCount = questions.filter((q, i) => answers[i] === q.correctAnswer).length;

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

          <h2 className="text-2xl font-bold text-foreground mb-2">Simulado finalizado!</h2>
          <p className="text-muted-foreground mb-6">
            Você acertou {correctCount} de {questions.length} questões
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Acertos</p>
              <p className="text-2xl font-bold text-success">{correctCount}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Erros</p>
              <p className="text-2xl font-bold text-destructive">{questions.length - correctCount}</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/treinos')}>
              Voltar aos treinos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/treinos')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Sair
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span className={cn('font-mono font-medium', timeLeft < 300 && 'text-destructive')}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1}/{questions.length}
          </span>
        </div>
      </div>

      <div className="flex gap-1 mb-6">
        {questions.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              answers[i] !== null ? 'bg-foreground' : 'bg-muted'
            )}
          />
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-6">
        {/* Conteúdo associado */}
        {question.criteriaName && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              {question.criteriaName}
            </span>
          </div>
        )}

        {/* Título da questão */}
        {question.title && (
          <h3 className="text-lg font-semibold text-foreground">{question.title}</h3>
        )}

        {/* Textos de apoio */}
        {question.supportTexts && question.supportTexts.length > 0 && (
          <div className="space-y-4">
            {question.supportTexts.map((supportText, idx) => (
              <div key={supportText.id || idx} className="bg-muted/30 rounded-lg p-4 border-l-4 border-primary/50">
                {supportText.title && (
                  <h4 className="font-semibold text-foreground text-sm mb-2">{supportText.title}</h4>
                )}
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {supportText.content}
                </p>
                {supportText.reference && (
                  <p className="text-xs text-muted-foreground/70 mt-3 italic border-t border-border pt-2">
                    {supportText.reference}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Enunciado / Comando */}
        <div className="pt-2">
          <p className="text-foreground font-medium">{question.statement}</p>
        </div>

        {/* Alternativas */}
        <div className="space-y-3 pt-2">
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

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>

        <Button variant="outline" onClick={handleFinish}>
          <Flag className="w-4 h-4 mr-2" />
          Finalizar
        </Button>

        <Button
          onClick={() => {
            if (currentQuestion === questions.length - 1) {
              handleFinish();
            } else {
              setCurrentQuestion((prev) => prev + 1);
            }
          }}
        >
          {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

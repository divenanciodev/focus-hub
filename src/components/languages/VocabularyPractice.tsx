import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Check, 
  X, 
  SkipForward,
  RotateCcw,
  Trophy
} from 'lucide-react';
import { useVocabularyWords } from '@/hooks/useLanguagesModule';
import type { VocabularySet, VocabularyWord, VocabularyExerciseType } from '@/types/languages';
import confetti from 'canvas-confetti';

interface VocabularyPracticeProps {
  set: VocabularySet;
  onBack: () => void;
}

interface PracticeState {
  words: VocabularyWord[];
  currentIndex: number;
  userInput: string;
  showResult: boolean;
  isCorrect: boolean;
  correctCount: number;
  incorrectCount: number;
  exerciseType: VocabularyExerciseType;
  startTime: number;
}

export function VocabularyPractice({ set, onBack }: VocabularyPracticeProps) {
  const { words, loading } = useVocabularyWords(set.id);
  const [state, setState] = useState<PracticeState | null>(null);

  // Initialize practice when words load
  useEffect(() => {
    if (words.length > 0 && !state) {
      // Shuffle words
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setState({
        words: shuffled,
        currentIndex: 0,
        userInput: '',
        showResult: false,
        isCorrect: false,
        correctCount: 0,
        incorrectCount: 0,
        exerciseType: 'word_to_translation',
        startTime: Date.now(),
      });
    }
  }, [words, state]);

  const handleSubmit = useCallback(() => {
    if (!state) return;
    
    const currentWord = state.words[state.currentIndex];
    const correctAnswer = state.exerciseType === 'word_to_translation' 
      ? currentWord.translation 
      : currentWord.word;
    
    const isCorrect = state.userInput.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();
    
    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    
    setState(prev => prev ? {
      ...prev,
      showResult: true,
      isCorrect,
      correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
      incorrectCount: !isCorrect ? prev.incorrectCount + 1 : prev.incorrectCount,
    } : null);
  }, [state]);

  const handleNext = useCallback(() => {
    if (!state) return;
    
    const nextIndex = state.currentIndex + 1;
    
    if (nextIndex >= state.words.length) {
      // Practice complete
      return;
    }
    
    // Alternate exercise type
    const nextType: VocabularyExerciseType = 
      state.exerciseType === 'word_to_translation' 
        ? 'translation_to_word' 
        : 'word_to_translation';
    
    setState(prev => prev ? {
      ...prev,
      currentIndex: nextIndex,
      userInput: '',
      showResult: false,
      isCorrect: false,
      exerciseType: nextType,
    } : null);
  }, [state]);

  const handleSkip = useCallback(() => {
    if (!state) return;
    
    setState(prev => prev ? {
      ...prev,
      incorrectCount: prev.incorrectCount + 1,
    } : null);
    
    handleNext();
  }, [state, handleNext]);

  const handleRestart = useCallback(() => {
    if (!words.length) return;
    
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setState({
      words: shuffled,
      currentIndex: 0,
      userInput: '',
      showResult: false,
      isCorrect: false,
      correctCount: 0,
      incorrectCount: 0,
      exerciseType: 'word_to_translation',
      startTime: Date.now(),
    });
  }, [words]);

  if (loading || !state) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Nenhuma palavra para praticar neste conjunto.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if practice is complete
  const isComplete = state.currentIndex >= state.words.length;

  if (isComplete) {
    const accuracy = Math.round((state.correctCount / state.words.length) * 100);
    const elapsedTime = Math.round((Date.now() - state.startTime) / 1000);
    
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <Card className="max-w-md mx-auto">
          <CardContent className="py-8 text-center space-y-6">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
            <h2 className="text-2xl font-bold">Prática Concluída!</h2>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-500">{state.correctCount}</div>
                <div className="text-sm text-muted-foreground">Corretas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{state.incorrectCount}</div>
                <div className="text-sm text-muted-foreground">Erradas</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{accuracy}%</div>
                <div className="text-sm text-muted-foreground">Precisão</div>
              </div>
            </div>
            
            <div className="text-muted-foreground">
              Tempo: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={onBack}>
                Sair
              </Button>
              <Button onClick={handleRestart}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Repetir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentWord = state.words[state.currentIndex];
  const progress = ((state.currentIndex) / state.words.length) * 100;
  const prompt = state.exerciseType === 'word_to_translation' 
    ? currentWord.word 
    : currentWord.translation;
  const answer = state.exerciseType === 'word_to_translation' 
    ? currentWord.translation 
    : currentWord.word;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Sair
        </Button>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {state.currentIndex + 1} / {state.words.length}
          </Badge>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">{state.correctCount}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-red-500">{state.incorrectCount}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Card */}
      <Card className="p-8">
        <CardContent className="space-y-6 text-center p-0">
          {/* Exercise type indicator */}
          <Badge variant="outline">
            {state.exerciseType === 'word_to_translation' 
              ? 'Palavra → Tradução' 
              : 'Tradução → Palavra'}
          </Badge>

          {/* Prompt */}
          <div className="text-3xl font-bold py-4">
            {prompt || '—'}
          </div>

          {/* Input */}
          {!state.showResult ? (
            <div className="space-y-4">
              <Input 
                value={state.userInput}
                onChange={(e) => setState(prev => prev ? { ...prev, userInput: e.target.value } : null)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Digite a resposta..."
                className="text-center text-lg"
                autoFocus
              />
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={handleSkip}>
                  <SkipForward className="w-4 h-4 mr-2" />
                  Pular
                </Button>
                <Button onClick={handleSubmit}>
                  Verificar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Result feedback */}
              <div className={`p-4 rounded-lg ${
                state.isCorrect 
                  ? 'bg-green-500/10 text-green-600' 
                  : 'bg-red-500/10 text-red-600'
              }`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {state.isCorrect ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <X className="w-6 h-6" />
                  )}
                  <span className="font-medium">
                    {state.isCorrect ? 'Correto!' : 'Incorreto'}
                  </span>
                </div>
                {!state.isCorrect && (
                  <div className="text-sm">
                    Resposta correta: <strong>{answer}</strong>
                  </div>
                )}
              </div>
              
              <Button onClick={handleNext}>
                Próxima
              </Button>
            </div>
          )}

          {/* Example hint */}
          {currentWord.example && !state.showResult && (
            <div className="text-sm text-muted-foreground italic">
              Dica: "{currentWord.example}"
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

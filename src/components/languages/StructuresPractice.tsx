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
  Trophy,
  Lightbulb
} from 'lucide-react';
import { useLanguageAllWords } from '@/hooks/useLanguagesModule';
import type { GrammarStructure, VocabularyWord } from '@/types/languages';
import confetti from 'canvas-confetti';

interface StructuresPracticeProps {
  structures: GrammarStructure[];
  languageId: string;
  onBack: () => void;
}

interface PracticeState {
  structures: GrammarStructure[];
  currentIndex: number;
  userInput: string;
  showResult: boolean;
  isCorrect: boolean;
  correctCount: number;
  incorrectCount: number;
  showHint: boolean;
  startTime: number;
}

export function StructuresPractice({ structures, languageId, onBack }: StructuresPracticeProps) {
  const { words, loading: wordsLoading } = useLanguageAllWords(languageId);
  const [state, setState] = useState<PracticeState | null>(null);

  // Initialize practice
  useEffect(() => {
    if (structures.length > 0 && !state) {
      const shuffled = [...structures].sort(() => Math.random() - 0.5);
      setState({
        structures: shuffled,
        currentIndex: 0,
        userInput: '',
        showResult: false,
        isCorrect: false,
        correctCount: 0,
        incorrectCount: 0,
        showHint: false,
        startTime: Date.now(),
      });
    }
  }, [structures, state]);

  // Get valid words for current structure
  const getValidWords = useCallback((structure: GrammarStructure): string[] => {
    if (structure.expectedInput === 'sentence' || structure.expectedInput === 'any') {
      return words.map(w => w.word.toLowerCase());
    }
    
    // Filter by expected input type
    // For now, accept all words - in a full implementation, 
    // words would have a grammatical class assigned
    return words.map(w => w.word.toLowerCase());
  }, [words]);

  const handleSubmit = useCallback(() => {
    if (!state) return;
    
    const currentStructure = state.structures[state.currentIndex];
    const validWords = getValidWords(currentStructure);
    const userWord = state.userInput.toLowerCase().trim();
    
    // Check if the input is valid (either in vocabulary or matches examples)
    const isInVocabulary = validWords.includes(userWord);
    const matchesExample = currentStructure.examples.some(
      ex => ex.toLowerCase().includes(userWord)
    );
    
    // For now, accept any non-empty input
    const isCorrect = userWord.length > 0 && (isInVocabulary || matchesExample || validWords.length === 0);
    
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
  }, [state, getValidWords]);

  const handleNext = useCallback(() => {
    if (!state) return;
    
    const nextIndex = state.currentIndex + 1;
    
    if (nextIndex >= state.structures.length) {
      return;
    }
    
    setState(prev => prev ? {
      ...prev,
      currentIndex: nextIndex,
      userInput: '',
      showResult: false,
      isCorrect: false,
      showHint: false,
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
    const shuffled = [...structures].sort(() => Math.random() - 0.5);
    setState({
      structures: shuffled,
      currentIndex: 0,
      userInput: '',
      showResult: false,
      isCorrect: false,
      correctCount: 0,
      incorrectCount: 0,
      showHint: false,
      startTime: Date.now(),
    });
  }, [structures]);

  if (wordsLoading || !state) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Check if practice is complete
  const isComplete = state.currentIndex >= state.structures.length;

  if (isComplete) {
    const accuracy = Math.round((state.correctCount / state.structures.length) * 100);
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

  const currentStructure = state.structures[state.currentIndex];
  const progress = ((state.currentIndex) / state.structures.length) * 100;

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
            {state.currentIndex + 1} / {state.structures.length}
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
        <CardContent className="space-y-6 p-0">
          {/* Translation hint */}
          {currentStructure.translation && (
            <p className="text-center text-muted-foreground text-sm">
              {currentStructure.translation}
            </p>
          )}

          {/* Structure pattern */}
          <div className="flex items-center justify-center gap-2 text-2xl font-mono py-4">
            <span className="font-bold">{currentStructure.fixedText}</span>
            <span className="text-primary">+</span>
            {!state.showResult ? (
              <Input 
                value={state.userInput}
                onChange={(e) => setState(prev => prev ? { ...prev, userInput: e.target.value } : null)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={currentStructure.expectedInput}
                className="w-40 text-center text-lg font-mono"
                autoFocus
              />
            ) : (
              <span className={state.isCorrect ? 'text-green-500' : 'text-red-500'}>
                {state.userInput || '___'}
              </span>
            )}
          </div>

          {/* Expected input type */}
          <div className="text-center">
            <Badge variant="outline">
              Esperado: {currentStructure.expectedInput}
            </Badge>
          </div>

          {/* Actions */}
          {!state.showResult ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSkip}>
                  <SkipForward className="w-4 h-4 mr-2" />
                  Pular
                </Button>
                <Button onClick={handleSubmit}>
                  Verificar
                </Button>
              </div>
              
              {/* Hint button */}
              {currentStructure.grammarTip && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setState(prev => prev ? { ...prev, showHint: !prev.showHint } : null)}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {state.showHint ? 'Ocultar dica' : 'Ver dica'}
                </Button>
              )}
              
              {state.showHint && currentStructure.grammarTip && (
                <div className="p-3 bg-muted rounded-lg text-sm text-center">
                  {currentStructure.grammarTip}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-center">
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
                    {state.isCorrect ? 'Correto!' : 'Tente novamente'}
                  </span>
                </div>
              </div>
              
              {/* Examples */}
              {currentStructure.examples.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Exemplos:</p>
                  {currentStructure.examples.slice(0, 2).map((ex, i) => (
                    <p key={i} className="italic">"{ex}"</p>
                  ))}
                </div>
              )}
              
              <Button onClick={handleNext}>
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

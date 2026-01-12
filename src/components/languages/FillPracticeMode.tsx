import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface Section {
  id: string;
  name: string;
  levelId: string;
  sortOrder: number;
}

interface Structure {
  id: string;
  name: string;
  pattern: string | null;
  patternTranslation: string | null;
  sectionId: string;
  sortOrder: number;
}

interface VocabularyWord {
  id: string;
  structureId: string;
  wordType: string;
  word: string;
  translation: string | null;
  sortOrder: number;
}

interface FillPracticeModeProps {
  languageCategory: string;
  sections: Section[];
  structures: Record<string, Structure[]>;
  vocabulary: Record<string, VocabularyWord[]>;
  selectedSectionId: string | null;
  onBack: () => void;
}

interface FillState {
  currentStructureIndex: number;
  currentWordIndex: number;
  structureList: { structure: Structure; section: Section; words: VocabularyWord[] }[];
  userInput: string;
  feedback: 'none' | 'correct' | 'incorrect';
  results: { correct: number; total: number };
  finished: boolean;
  startTime: number;
}

export function FillPracticeMode({
  languageCategory,
  sections,
  structures,
  vocabulary,
  selectedSectionId,
  onBack,
}: FillPracticeModeProps) {
  const [fillState, setFillState] = useState<FillState | null>(null);

  // Get structures with vocabulary for fill mode
  const getStructuresForFill = () => {
    const result: { structure: Structure; section: Section; words: VocabularyWord[] }[] = [];
    
    const sectionsToProcess = selectedSectionId 
      ? sections.filter(s => s.id === selectedSectionId) 
      : sections;
    
    sectionsToProcess.forEach((section) => {
      (structures[section.id] || []).forEach((struct) => {
        const structVocab = vocabulary[struct.id] || [];
        // Check if pattern has placeholders in [wordType] format
        if (struct.pattern && /\[\w+\]/.test(struct.pattern) && structVocab.length > 0) {
          result.push({ structure: struct, section, words: structVocab });
        }
      });
    });
    
    return result;
  };

  // Initialize fill state
  useEffect(() => {
    const structuresWithVocab = getStructuresForFill();
    if (structuresWithVocab.length > 0) {
      setFillState({
        currentStructureIndex: 0,
        currentWordIndex: 0,
        structureList: structuresWithVocab,
        userInput: '',
        feedback: 'none',
        results: { correct: 0, total: 0 },
        finished: false,
        startTime: Date.now(),
      });
    }
  }, [selectedSectionId]);

  const handleSubmit = () => {
    if (!fillState) return;
    
    const currentStruct = fillState.structureList[fillState.currentStructureIndex];
    const currentWord = currentStruct.words[fillState.currentWordIndex];
    
    const isCorrect = fillState.userInput.toLowerCase().trim() === currentWord.word.toLowerCase();
    
    if (isCorrect) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
    
    setFillState({ ...fillState, feedback: isCorrect ? 'correct' : 'incorrect' });
    
    // Move to next after delay
    setTimeout(() => {
      moveToNext(isCorrect);
    }, 1500);
  };

  const moveToNext = (wasCorrect: boolean) => {
    if (!fillState) return;
    
    const currentStruct = fillState.structureList[fillState.currentStructureIndex];
    const newResults = {
      correct: fillState.results.correct + (wasCorrect ? 1 : 0),
      total: fillState.results.total + 1,
    };
    
    // Check if we should move to next word or next structure
    if (fillState.currentWordIndex < currentStruct.words.length - 1) {
      setFillState({
        ...fillState,
        currentWordIndex: fillState.currentWordIndex + 1,
        userInput: '',
        feedback: 'none',
        results: newResults,
      });
    } else if (fillState.currentStructureIndex < fillState.structureList.length - 1) {
      setFillState({
        ...fillState,
        currentStructureIndex: fillState.currentStructureIndex + 1,
        currentWordIndex: 0,
        userInput: '',
        feedback: 'none',
        results: newResults,
      });
    } else {
      setFillState({ ...fillState, results: newResults, finished: true });
    }
  };

  const goToPrevious = () => {
    if (!fillState || fillState.feedback !== 'none') return;
    
    if (fillState.currentWordIndex > 0) {
      setFillState({
        ...fillState,
        currentWordIndex: fillState.currentWordIndex - 1,
        userInput: '',
      });
    } else if (fillState.currentStructureIndex > 0) {
      const prevStruct = fillState.structureList[fillState.currentStructureIndex - 1];
      setFillState({
        ...fillState,
        currentStructureIndex: fillState.currentStructureIndex - 1,
        currentWordIndex: prevStruct.words.length - 1,
        userInput: '',
      });
    }
  };

  const skipToNext = () => {
    if (!fillState || fillState.feedback !== 'none') return;
    moveToNext(false);
  };

  const resetPractice = () => {
    const structuresWithVocab = getStructuresForFill();
    if (structuresWithVocab.length > 0) {
      setFillState({
        currentStructureIndex: 0,
        currentWordIndex: 0,
        structureList: structuresWithVocab,
        userInput: '',
        feedback: 'none',
        results: { correct: 0, total: 0 },
        finished: false,
        startTime: Date.now(),
      });
    }
  };

  const getElapsedTime = () => {
    if (!fillState) return '0 min';
    const elapsed = Math.floor((Date.now() - fillState.startTime) / 60000);
    return `${elapsed || '<1'} min`;
  };

  // No structures available
  if (!fillState || fillState.structureList.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Nenhuma estrutura disponível para praticar</p>
          <Button variant="outline" onClick={onBack}>Voltar</Button>
        </div>
      </div>
    );
  }

  // Finished view
  if (fillState.finished) {
    const percentage = fillState.results.total > 0 
      ? Math.round((fillState.results.correct / fillState.results.total) * 100) 
      : 0;

    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md w-full">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Prática Concluída!</h2>
          <p className="text-muted-foreground mb-8">
            Você acertou {fillState.results.correct} de {fillState.results.total} respostas
          </p>
          <Progress value={percentage} className="mb-4 h-3" />
          <p className="text-2xl font-bold text-primary mb-8">{percentage}%</p>
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={onBack}>
              Voltar
            </Button>
            <Button className="flex-1" onClick={resetPractice}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Repetir
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentStruct = fillState.structureList[fillState.currentStructureIndex];
  const currentWord = currentStruct.words[fillState.currentWordIndex];
  const totalItems = fillState.structureList.reduce((acc, s) => acc + s.words.length, 0);
  const currentItem = fillState.structureList
    .slice(0, fillState.currentStructureIndex)
    .reduce((acc, s) => acc + s.words.length, 0) + fillState.currentWordIndex + 1;

  // Render pattern with input placeholder
  const renderPattern = () => {
    if (!currentStruct.structure.pattern) return null;
    
    const parts = currentStruct.structure.pattern.split(/(\[\w+\])/g);
    
    return parts.map((part, idx) => {
      const match = part.match(/\[(\w+)\]/);
      if (match && match[1].toLowerCase() === currentWord.wordType.toLowerCase()) {
        return (
          <span key={idx} className="inline-block mx-2">
            <Input
              value={fillState.userInput}
              onChange={(e) => setFillState({ ...fillState, userInput: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && fillState.feedback === 'none' && handleSubmit()}
              placeholder=""
              className={cn(
                'w-40 h-12 text-center text-lg font-medium rounded-lg',
                fillState.feedback === 'correct' && 'border-green-500 bg-green-100',
                fillState.feedback === 'incorrect' && 'border-red-500 bg-red-100'
              )}
              disabled={fillState.feedback !== 'none'}
              autoFocus
            />
          </span>
        );
      }
      if (match) {
        // Other placeholders - show grayed
        return (
          <span key={idx} className="text-muted-foreground mx-1">
            [{match[1]}]
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const canGoPrevious = fillState.currentStructureIndex > 0 || fillState.currentWordIndex > 0;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header with category, section, and time */}
      <header className="border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-muted-foreground">{languageCategory}</span>
            <h1 className="text-xl font-bold">{currentStruct.section.name}</h1>
          </div>
          <span className="text-muted-foreground">{getElapsedTime()}</span>
        </div>
      </header>

      {/* Main content - Pattern with input */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-3xl font-bold flex items-center justify-center flex-wrap gap-1">
            {renderPattern()}
          </div>

          {/* Feedback */}
          {fillState.feedback !== 'none' && (
            <div className={cn(
              'mt-8 flex items-center justify-center gap-2 text-lg',
              fillState.feedback === 'correct' ? 'text-green-600' : 'text-red-600'
            )}>
              {fillState.feedback === 'correct' ? (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  <span>Correto!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6" />
                  <span>A resposta era: <strong>{currentWord.word}</strong></span>
                </>
              )}
            </div>
          )}

          {/* Hint */}
          {fillState.feedback === 'none' && currentWord.translation && (
            <p className="mt-6 text-muted-foreground">
              Dica: {currentWord.translation}
            </p>
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="border-t border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Progress */}
          <div className="text-sm text-muted-foreground">
            {currentItem} / {totalItems}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-3">
            <Button 
              variant="default"
              className="rounded-full px-6 gap-2"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            {fillState.feedback === 'none' ? (
              <Button 
                variant="default"
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={handleSubmit}
                disabled={!fillState.userInput.trim()}
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button 
                variant="default"
                size="icon"
                className="rounded-full w-12 h-12"
                disabled
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Play,
  BookOpen,
  Keyboard,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
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

interface LanguagePracticeProps {
  languageId: string;
  sections: Section[];
  structures: Record<string, Structure[]>;
  vocabulary: Record<string, VocabularyWord[]>;
}

type PracticeMode = 'none' | 'flashcard' | 'fill';

interface FlashcardState {
  currentIndex: number;
  flipped: boolean;
  words: VocabularyWord[];
  results: { correct: number; total: number };
  finished: boolean;
}

interface FillState {
  currentStructureIndex: number;
  currentWordIndex: number;
  structures: { structure: Structure; words: VocabularyWord[] }[];
  userInput: string;
  feedback: 'none' | 'correct' | 'incorrect';
  results: { correct: number; total: number };
  finished: boolean;
}

export function LanguagePractice({
  languageId,
  sections,
  structures,
  vocabulary,
}: LanguagePracticeProps) {
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('none');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [flashcardState, setFlashcardState] = useState<FlashcardState | null>(null);
  const [fillState, setFillState] = useState<FillState | null>(null);

  // Get all vocabulary for selected section(s)
  const getVocabularyForSection = (sectionId: string) => {
    if (sectionId === 'all') {
      // Get all vocabulary from all sections
      const allWords: VocabularyWord[] = [];
      sections.forEach((section) => {
        (structures[section.id] || []).forEach((struct) => {
          allWords.push(...(vocabulary[struct.id] || []));
        });
      });
      return allWords;
    } else {
      const sectionStructures = structures[sectionId] || [];
      const words: VocabularyWord[] = [];
      sectionStructures.forEach((struct) => {
        words.push(...(vocabulary[struct.id] || []));
      });
      return words;
    }
  };

  // Get structures with vocabulary for fill mode - now uses [wordType] format
  const getStructuresForFill = (sectionId: string) => {
    const result: { structure: Structure; words: VocabularyWord[] }[] = [];
    
    const sectionsToProcess = sectionId === 'all' ? sections : sections.filter(s => s.id === sectionId);
    
    sectionsToProcess.forEach((section) => {
      (structures[section.id] || []).forEach((struct) => {
        const structVocab = vocabulary[struct.id] || [];
        // Check if pattern has placeholders in [wordType] format
        if (struct.pattern && /\[\w+\]/.test(struct.pattern) && structVocab.length > 0) {
          result.push({ structure: struct, words: structVocab });
        }
      });
    });
    
    return result;
  };

  const startFlashcardMode = () => {
    const words = getVocabularyForSection(selectedSection);
    if (words.length === 0) return;
    
    // Shuffle words
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    
    setFlashcardState({
      currentIndex: 0,
      flipped: false,
      words: shuffled,
      results: { correct: 0, total: 0 },
      finished: false,
    });
    setPracticeMode('flashcard');
  };

  const startFillMode = () => {
    const structuresWithVocab = getStructuresForFill(selectedSection);
    if (structuresWithVocab.length === 0) return;
    
    setFillState({
      currentStructureIndex: 0,
      currentWordIndex: 0,
      structures: structuresWithVocab,
      userInput: '',
      feedback: 'none',
      results: { correct: 0, total: 0 },
      finished: false,
    });
    setPracticeMode('fill');
  };

  const handleFlashcardFlip = () => {
    if (!flashcardState) return;
    setFlashcardState({ ...flashcardState, flipped: !flashcardState.flipped });
  };

  const handleFlashcardAnswer = (correct: boolean) => {
    if (!flashcardState) return;
    
    if (correct) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
    
    const newResults = {
      correct: flashcardState.results.correct + (correct ? 1 : 0),
      total: flashcardState.results.total + 1,
    };
    
    if (flashcardState.currentIndex >= flashcardState.words.length - 1) {
      setFlashcardState({ ...flashcardState, results: newResults, finished: true });
    } else {
      setFlashcardState({
        ...flashcardState,
        currentIndex: flashcardState.currentIndex + 1,
        flipped: false,
        results: newResults,
      });
    }
  };

  const handleFillSubmit = () => {
    if (!fillState) return;
    
    const currentStruct = fillState.structures[fillState.currentStructureIndex];
    const currentWord = currentStruct.words[fillState.currentWordIndex];
    
    const isCorrect = fillState.userInput.toLowerCase().trim() === currentWord.word.toLowerCase();
    
    if (isCorrect) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
    
    setFillState({ ...fillState, feedback: isCorrect ? 'correct' : 'incorrect' });
    
    // Move to next after delay
    setTimeout(() => {
      const newResults = {
        correct: fillState.results.correct + (isCorrect ? 1 : 0),
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
      } else if (fillState.currentStructureIndex < fillState.structures.length - 1) {
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
    }, 1500);
  };

  const resetPractice = () => {
    setPracticeMode('none');
    setFlashcardState(null);
    setFillState(null);
  };

  // Parse pattern to show with placeholder - now uses [wordType] format
  const renderPatternWithPlaceholder = (pattern: string, wordType: string) => {
    const parts = pattern.split(/(\[\w+\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/\[(\w+)\]/);
      if (match && match[1].toLowerCase() === wordType.toLowerCase()) {
        return (
          <span key={idx} className="inline-block min-w-[100px] mx-1">
            <Input
              value={fillState?.userInput || ''}
              onChange={(e) => fillState && setFillState({ ...fillState, userInput: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleFillSubmit()}
              placeholder={wordType}
              className={cn(
                'h-8 text-center font-medium',
                fillState?.feedback === 'correct' && 'border-green-500 bg-green-500/10',
                fillState?.feedback === 'incorrect' && 'border-red-500 bg-red-500/10'
              )}
              disabled={fillState?.feedback !== 'none'}
              autoFocus
            />
          </span>
        );
      }
      if (match) {
        return (
          <span key={idx} className="text-muted-foreground">
            [{match[1]}]
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  // Mode selection view
  if (practiceMode === 'none') {
    const totalWords = getVocabularyForSection('all').length;
    const totalStructures = getStructuresForFill('all').length;

    return (
      <div className="p-4 max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Selecione a Seção</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma seção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Seções</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className={cn(
              'cursor-pointer transition-all hover:shadow-lg hover:border-primary',
              totalWords === 0 && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => totalWords > 0 && startFlashcardMode()}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Flashcards</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Pratique o vocabulário no estilo flashcard
              </p>
              <Badge variant="secondary">
                {getVocabularyForSection(selectedSection).length} palavras
              </Badge>
            </CardContent>
          </Card>

          <Card
            className={cn(
              'cursor-pointer transition-all hover:shadow-lg hover:border-primary',
              totalStructures === 0 && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => totalStructures > 0 && startFillMode()}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Keyboard className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Preencher</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Digite a palavra correta dentro do padrão
              </p>
              <Badge variant="secondary">
                {getStructuresForFill(selectedSection).length} estruturas
              </Badge>
            </CardContent>
          </Card>
        </div>

        {totalWords === 0 && (
          <p className="text-center text-muted-foreground mt-6">
            Adicione estruturas e vocabulário na aba "Editar" para começar a praticar.
          </p>
        )}
      </div>
    );
  }

  // Flashcard mode
  if (practiceMode === 'flashcard' && flashcardState) {
    if (flashcardState.finished) {
      const percentage = Math.round((flashcardState.results.correct / flashcardState.results.total) * 100);
      
      return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Prática Concluída!</h2>
              <p className="text-muted-foreground mb-6">
                Você acertou {flashcardState.results.correct} de {flashcardState.results.total} palavras
              </p>
              <Progress value={percentage} className="mb-4" />
              <p className="text-lg font-semibold text-primary mb-6">{percentage}%</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={resetPractice}>
                  Voltar
                </Button>
                <Button className="flex-1" onClick={startFlashcardMode}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Repetir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    const currentWord = flashcardState.words[flashcardState.currentIndex];
    const progress = ((flashcardState.currentIndex + 1) / flashcardState.words.length) * 100;

    return (
      <div className="p-4">
        <div className="max-w-md mx-auto">
          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Palavra {flashcardState.currentIndex + 1} de {flashcardState.words.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Card */}
          <Card
            className="min-h-[300px] cursor-pointer"
            onClick={handleFlashcardFlip}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8 min-h-[300px]">
              {!flashcardState.flipped ? (
                <>
                  <Badge variant="outline" className="mb-4">{currentWord.wordType}</Badge>
                  <p className="text-3xl font-bold mb-4">{currentWord.word}</p>
                  <p className="text-sm text-muted-foreground">Clique para ver a tradução</p>
                </>
              ) : (
                <>
                  <Badge variant="outline" className="mb-4">{currentWord.wordType}</Badge>
                  <p className="text-2xl text-muted-foreground mb-2">{currentWord.word}</p>
                  <p className="text-3xl font-bold text-primary">
                    {currentWord.translation || '—'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {flashcardState.flipped && (
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
                onClick={() => handleFlashcardAnswer(false)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Errei
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleFlashcardAnswer(true)}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Acertei
              </Button>
            </div>
          )}

          <Button variant="ghost" className="w-full mt-4" onClick={resetPractice}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  // Fill mode
  if (practiceMode === 'fill' && fillState) {
    if (fillState.finished) {
      const percentage = Math.round((fillState.results.correct / fillState.results.total) * 100);
      
      return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Prática Concluída!</h2>
              <p className="text-muted-foreground mb-6">
                Você acertou {fillState.results.correct} de {fillState.results.total} respostas
              </p>
              <Progress value={percentage} className="mb-4" />
              <p className="text-lg font-semibold text-primary mb-6">{percentage}%</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={resetPractice}>
                  Voltar
                </Button>
                <Button className="flex-1" onClick={startFillMode}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Repetir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    const currentStruct = fillState.structures[fillState.currentStructureIndex];
    const currentWord = currentStruct.words[fillState.currentWordIndex];
    const totalItems = fillState.structures.reduce((acc, s) => acc + s.words.length, 0);
    const currentItem = fillState.structures.slice(0, fillState.currentStructureIndex).reduce((acc, s) => acc + s.words.length, 0) + fillState.currentWordIndex + 1;
    const progress = (currentItem / totalItems) * 100;

    return (
      <div className="p-4">
        <div className="max-w-lg mx-auto">
          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Exercício {currentItem} de {totalItems}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Structure Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{currentStruct.structure.name}</CardTitle>
              {currentStruct.structure.patternTranslation && (
                <p className="text-sm text-muted-foreground">
                  {currentStruct.structure.patternTranslation}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-xl flex items-center flex-wrap gap-1 mb-4">
                {currentStruct.structure.pattern && renderPatternWithPlaceholder(
                  currentStruct.structure.pattern,
                  currentWord.wordType
                )}
              </div>

              {/* Translation hint */}
              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-muted-foreground">
                  Complete com: <span className="font-medium text-foreground">{currentWord.translation || currentWord.word}</span>
                </p>
              </div>

              {/* Feedback */}
              {fillState.feedback !== 'none' && (
                <div className={cn(
                  'flex items-center gap-2 p-3 rounded-lg mb-4',
                  fillState.feedback === 'correct' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                )}>
                  {fillState.feedback === 'correct' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Correto!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span>Incorreto! A resposta era: <strong>{currentWord.word}</strong></span>
                    </>
                  )}
                </div>
              )}

              {/* Submit button */}
              {fillState.feedback === 'none' && (
                <Button
                  className="w-full"
                  onClick={handleFillSubmit}
                  disabled={!fillState.userInput.trim()}
                >
                  Verificar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>

          <Button variant="ghost" className="w-full mt-4" onClick={resetPractice}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

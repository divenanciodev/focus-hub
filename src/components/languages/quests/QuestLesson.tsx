import { useState } from 'react';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SyntaxEditor } from './SyntaxEditor';
import { SYNTAX_CHIP, classifyWord } from './syntaxColors';
import type { Quest } from './questData';

interface QuestLessonProps {
  quest: Quest;
  onBack: () => void;
  onComplete: () => void;
}

export function QuestLesson({ quest, onBack, onComplete }: QuestLessonProps) {
  const [step, setStep] = useState(0);

  const handleResult = (correct: boolean) => {
    if (!correct) return;
    if (step + 1 >= quest.exercises.length) {
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-100 dark:bg-zinc-900 flex flex-col">
      {/* Purple header */}
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-6 py-4 flex items-center gap-4 shadow-lg">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white text-violet-600 flex items-center justify-center shadow-md hover:scale-105 transition"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-white">
          <div className="text-xs font-bold uppercase tracking-widest text-white/80">
            Quest · {quest.shortTitle}
          </div>
          <div className="text-lg font-extrabold">{quest.title}</div>
        </div>
        <div className="ml-auto text-white/90 text-xs font-mono">Booting Lesson...</div>
      </div>

      {/* Two-column body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-4 p-4 overflow-hidden">
        {/* Theory panel */}
        <div className="bg-white dark:bg-card rounded-xl border border-border p-6 overflow-y-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" /> Lição
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mt-4">{quest.title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{quest.meaning}</p>

          <div className="mt-5 p-3 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30">
            <div className="text-xs font-bold text-violet-600 dark:text-violet-300 uppercase tracking-wider">
              Fórmula
            </div>
            <div className="text-base font-bold text-foreground mt-1 font-mono">
              {quest.formula}
            </div>
          </div>

          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Vocabulário
            </div>
            <div className="flex flex-wrap gap-2">
              {quest.vocabulary.map((w) => (
                <span
                  key={w}
                  className={cn(
                    'px-2.5 py-1 rounded-md border text-xs font-bold font-mono',
                    SYNTAX_CHIP[classifyWord(w)],
                  )}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Uso real
            </div>
            <ul className="space-y-1.5">
              {quest.usage.map((s) => (
                <li key={s} className="text-sm font-mono text-foreground bg-muted/50 px-2.5 py-1.5 rounded">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-200">{quest.toneNote}</p>
          </div>
        </div>

        {/* Editor panel */}
        <div className="min-h-0">
          <SyntaxEditor
            exercise={quest.exercises[step]}
            stepIndex={step}
            totalSteps={quest.exercises.length}
            onResult={handleResult}
            onSkip={() => handleResult(true)}
          />
        </div>
      </div>
    </div>
  );
}
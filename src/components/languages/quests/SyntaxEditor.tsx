import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Lightbulb, Volume2, SkipForward, Play } from 'lucide-react';
import { classifyTokens, SYNTAX_TEXT, SYNTAX_CHIP, type SyntaxCategory } from './syntaxColors';
import type { ExerciseStep } from './questData';

interface SyntaxEditorProps {
  exercise: ExerciseStep;
  stepIndex: number;
  totalSteps: number;
  onResult: (correct: boolean) => void;
  onSkip: () => void;
}

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export function SyntaxEditor({ exercise, stepIndex, totalSteps, onResult, onSkip }: SyntaxEditorProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showHint, setShowHint] = useState(false);

  const handleCheck = () => {
    if (!selected) return;
    const ok = selected.toLowerCase() === exercise.blank.toLowerCase();
    if (ok) {
      const filled = exercise.prompt.replace('____', selected);
      setFeedback({
        ok: true,
        msg: `> Correct Syntax!  "${filled}"   +10 XP  +5 coins`,
      });
      speak(filled);
      setTimeout(() => {
        onResult(true);
        setSelected(null);
        setFeedback(null);
        setShowHint(false);
      }, 1100);
    } else {
      setFeedback({
        ok: false,
        msg: `> Syntax Error: expected ${exercise.category} word. Try: ${exercise.options.filter((o) => o.toLowerCase() === exercise.blank.toLowerCase()).join(', ') || exercise.blank}`,
      });
    }
  };

  // build line tokens, replacing the blank with a slot
  const beforeBlank = exercise.prompt.split('____')[0];
  const afterBlank = exercise.prompt.split('____')[1] ?? '';

  const renderTokens = (text: string) =>
    classifyTokens(text).map((t, i) => (
      <span key={i} className={cn(SYNTAX_TEXT[t.cat], 'whitespace-pre')}>
        {t.word}
      </span>
    ));

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
      {/* IDE header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <span className="ml-3 text-xs text-zinc-400 font-mono">syntax.en</span>
        </div>
        <div className="text-[10px] text-zinc-500 font-mono">
          line {stepIndex + 1} / {totalSteps}
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 font-mono text-sm bg-zinc-950 p-4 overflow-auto">
        {Array.from({ length: 8 }).map((_, lineIdx) => {
          const isActive = lineIdx === stepIndex;
          return (
            <div key={lineIdx} className="flex items-start gap-4 py-1 min-h-[28px]">
              <span className="text-zinc-600 select-none w-5 text-right">{lineIdx + 1}</span>
              <div className="flex-1 flex items-center flex-wrap gap-y-1">
                {isActive ? (
                  <>
                    {renderTokens(beforeBlank)}
                    <span
                      className={cn(
                        'inline-flex min-w-[100px] px-3 py-0.5 mx-0.5 rounded-md border-2 border-dashed text-center font-bold',
                        selected
                          ? 'border-violet-400 bg-violet-500/10 text-violet-200'
                          : 'border-zinc-600 text-zinc-500',
                      )}
                    >
                      {selected ?? '____'}
                    </span>
                    {renderTokens(afterBlank)}
                  </>
                ) : lineIdx < stepIndex ? (
                  <span className="text-emerald-500">✓ <span className="text-zinc-500">completed</span></span>
                ) : (
                  <span className="text-zinc-700">{/* empty */}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Options */}
      <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 flex flex-wrap gap-2">
        {exercise.options.map((opt) => {
          const cat: SyntaxCategory = exercise.category;
          const isSel = selected === opt;
          return (
            <button
              key={opt}
              onClick={() => {
                setSelected(opt);
                setFeedback(null);
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-lg border font-mono text-sm transition-transform',
                SYNTAX_CHIP[cat],
                isSel && 'scale-105 ring-2 ring-violet-400',
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Console / feedback */}
      <div className="px-4 py-3 bg-black border-t border-zinc-800 font-mono text-xs min-h-[64px]">
        {feedback ? (
          <div className={cn(feedback.ok ? 'text-emerald-400' : 'text-rose-400')}>
            {feedback.msg}
          </div>
        ) : showHint ? (
          <div className="text-amber-300">{`> hint: ${exercise.hint}`}</div>
        ) : (
          <div className="text-zinc-500">{`> Syntax Module Loaded — pick a word and Check Syntax`}</div>
        )}
      </div>

      {/* Action bar */}
      <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 flex flex-wrap items-center gap-2">
        <Button
          onClick={handleCheck}
          disabled={!selected}
          className="bg-amber-400 hover:bg-amber-500 text-black font-bold gap-2"
        >
          <Play className="w-4 h-4" /> Check Syntax
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowHint((s) => !s)}
          className="bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700 gap-2"
        >
          <Lightbulb className="w-4 h-4" /> Hint
        </Button>
        <Button
          variant="outline"
          onClick={() => speak(exercise.prompt.replace('____', exercise.blank))}
          className="bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700 gap-2"
        >
          <Volume2 className="w-4 h-4" /> Speak
        </Button>
        <Button
          variant="ghost"
          onClick={onSkip}
          className="ml-auto text-zinc-400 hover:text-white gap-2"
        >
          <SkipForward className="w-4 h-4" /> Skip
        </Button>
      </div>
    </div>
  );
}
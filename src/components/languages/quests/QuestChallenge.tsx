import { useMemo, useState } from 'react';
import { ArrowLeft, Mic, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SYNTAX_CHIP, classifyWord } from './syntaxColors';
import type { Quest } from './questData';

interface QuestChallengeProps {
  quest: Quest;
  onBack: () => void;
  onComplete: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function QuestChallenge({ quest, onBack, onComplete }: QuestChallengeProps) {
  const initialPool = useMemo(() => shuffle(quest.challenge.pieces), [quest.id]);
  const [pool, setPool] = useState<string[]>(initialPool);
  const [built, setBuilt] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const target = quest.challenge.expected;
  const builtSentence = built.join(' ');

  const addPiece = (i: number) => {
    setBuilt((b) => [...b, pool[i]]);
    setPool((p) => p.filter((_, idx) => idx !== i));
    setFeedback(null);
  };

  const removePiece = (i: number) => {
    setPool((p) => [...p, built[i]]);
    setBuilt((b) => b.filter((_, idx) => idx !== i));
    setFeedback(null);
  };

  const handleCheck = () => {
    const ok = builtSentence.trim().toLowerCase() === target.toLowerCase();
    if (ok) {
      setFeedback({ ok: true, msg: 'Quest Complete' });
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(target);
        u.lang = 'en-US';
        window.speechSynthesis.speak(u);
      }
      setTimeout(onComplete, 1000);
    } else {
      setFeedback({ ok: false, msg: `Try again. Expected: "${target}"` });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-100 dark:bg-zinc-900 flex flex-col">
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
            Challenge · {quest.shortTitle}
          </div>
          <div className="text-lg font-extrabold">Build your sentence</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* prompt */}
        <div className="text-center">
          <div className="text-8xl mb-3">{quest.challenge.promptEmoji}</div>
          <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            {quest.challenge.promptLabel}
          </div>
        </div>

        {/* built area */}
        <div className="w-full max-w-2xl min-h-[80px] bg-white dark:bg-card border-2 border-dashed border-border rounded-xl p-4 flex flex-wrap gap-2 items-center justify-center">
          {built.length === 0 ? (
            <span className="text-sm text-muted-foreground">Toque nas peças abaixo para montar a frase</span>
          ) : (
            built.map((w, i) => (
              <button
                key={`${w}-${i}`}
                onClick={() => removePiece(i)}
                className={cn(
                  'px-3.5 py-2 rounded-lg border font-bold font-mono text-sm hover:scale-105 transition',
                  SYNTAX_CHIP[classifyWord(w)],
                )}
              >
                {w}
              </button>
            ))
          )}
        </div>

        {/* pool */}
        <div className="flex flex-wrap gap-2 max-w-2xl justify-center">
          {pool.map((w, i) => (
            <button
              key={`${w}-${i}`}
              onClick={() => addPiece(i)}
              className={cn(
                'px-3.5 py-2 rounded-lg border font-bold font-mono text-sm hover:scale-105 transition',
                SYNTAX_CHIP[classifyWord(w)],
              )}
            >
              {w}
            </button>
          ))}
        </div>

        {feedback && (
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm',
              feedback.ok
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
            )}
          >
            {feedback.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {feedback.msg}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleCheck}
            disabled={built.length === 0}
            className="bg-violet-500 hover:bg-violet-600 text-white font-bold px-6"
          >
            Verificar frase
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                const u = new SpeechSynthesisUtterance(builtSentence || target);
                u.lang = 'en-US';
                window.speechSynthesis.speak(u);
              }
            }}
          >
            <Mic className="w-4 h-4" /> Voice
          </Button>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Zap, Coins, Sparkles, ArrowRight, Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SYNTAX_CHIP } from './syntaxColors';
import type { Quest } from './questData';

interface QuestRewardProps {
  quest: Quest;
  hasNext: boolean;
  onNext: () => void;
  onMap: () => void;
}

export function QuestReward({ quest, hasNext, onNext, onMap }: QuestRewardProps) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-amber-500 flex items-center justify-center p-6 overflow-hidden">
      {/* confetti dots */}
      {Array.from({ length: 30 }).map((_, i) => (
        <span
          key={i}
          className="absolute w-2 h-2 rounded-sm animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: ['#fde047', '#a78bfa', '#34d399', '#f472b6', '#fb923c'][i % 5],
            animationDelay: `${(i % 10) * 0.1}s`,
            animationDuration: `${1 + (i % 5) * 0.2}s`,
            opacity: show ? 1 : 0,
          }}
        />
      ))}

      <div
        className={cn(
          'relative bg-white dark:bg-card rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transition-all duration-500',
          show ? 'scale-100 opacity-100' : 'scale-90 opacity-0',
        )}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-black text-xs font-extrabold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> Quest Complete
        </div>
        <h2 className="text-3xl font-extrabold text-foreground mt-3">{quest.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">Syntax Upgraded</p>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4">
            <Zap className="w-6 h-6 mx-auto text-amber-500" />
            <div className="text-2xl font-extrabold text-foreground mt-1">+{quest.xpReward}</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">XP</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4">
            <Coins className="w-6 h-6 mx-auto text-amber-500" />
            <div className="text-2xl font-extrabold text-foreground mt-1">+{quest.coinReward}</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Moedas</div>
          </div>
        </div>

        {quest.unlocksSyntax && (
          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              New Word Unlocked
            </div>
            <span
              className={cn(
                'inline-block px-3 py-1.5 rounded-lg border font-mono font-bold',
                SYNTAX_CHIP[quest.unlocksSyntax.cat],
              )}
            >
              {quest.unlocksSyntax.word}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-6">
          {hasNext && (
            <Button
              onClick={onNext}
              className="bg-violet-500 hover:bg-violet-600 text-white font-bold gap-2"
            >
              Próxima Quest <ArrowRight className="w-4 h-4" />
            </Button>
          )}
          <Button variant="outline" onClick={onMap} className="gap-2">
            <Map className="w-4 h-4" /> Voltar ao Mapa
          </Button>
        </div>
      </div>
    </div>
  );
}
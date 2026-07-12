import { Lock, Play, Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WORLDS } from './questData';
import selfModeCover from '@/assets/quest-covers/self-mode.jpg';
import actionModeCover from '@/assets/quest-covers/action-mode.jpg';
import internetModeCover from '@/assets/quest-covers/internet-mode.jpg';

interface QuestModulesProps {
  completedQuests: Set<string>;
  onOpenWorld: (worldId: string) => void;
}

const WORLD_COVERS: Record<string, string> = {
  'self-mode': selfModeCover,
  'action-mode': actionModeCover,
  'internet-mode': internetModeCover,
};

const WORLD_GRADIENTS: Record<string, string> = {
  'self-mode': 'from-violet-500 via-purple-500 to-fuchsia-500',
  'action-mode': 'from-orange-500 via-red-500 to-rose-500',
  'internet-mode': 'from-teal-400 via-cyan-500 to-blue-500',
};

export function QuestModules({ completedQuests, onOpenWorld }: QuestModulesProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {WORLDS.map((world) => {
          const total = world.quests.length;
          const done = world.quests.filter((q) => completedQuests.has(q.id)).length;
          const totalXp = world.quests.reduce((s, q) => s + q.xpReward, 0);
          const locked = !!world.comingSoon || total === 0;
          const pct = total ? (done / total) * 100 : 0;

          return (
            <button
              key={world.id}
              onClick={() => !locked && onOpenWorld(world.id)}
              disabled={locked}
              className={cn(
                'group text-left rounded-3xl overflow-hidden bg-white dark:bg-card shadow-xl border border-border transition-all',
                !locked && 'hover:-translate-y-1 hover:shadow-2xl',
                locked && 'opacity-70 cursor-not-allowed',
              )}
            >
              {/* Cover */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-br',
                    WORLD_GRADIENTS[world.id] ?? 'from-slate-500 to-slate-700',
                  )}
                />
                {WORLD_COVERS[world.id] && (
                  <img
                    src={WORLD_COVERS[world.id]}
                    alt={world.title}
                    loading="lazy"
                    width={1280}
                    height={768}
                    className={cn(
                      'absolute inset-0 w-full h-full object-cover transition-transform duration-500',
                      !locked && 'group-hover:scale-105',
                      locked && 'grayscale',
                    )}
                  />
                )}
                {/* Bottom gradient for text legibility */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Locked overlay */}
                {locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2 text-white">
                      <Lock className="w-10 h-10" />
                      <span className="text-xs font-bold uppercase tracking-widest">Em breve</span>
                    </div>
                  </div>
                )}

                {/* Subtitle chip */}
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-white/90 text-[10px] font-black uppercase tracking-widest text-foreground shadow">
                  {world.subtitle}
                </div>

                {/* Title */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-2xl font-extrabold drop-shadow-lg leading-tight">
                    {world.cardTitle ?? world.title}
                  </div>
                  {!locked && (
                    <div className="mt-1 flex items-center gap-3 text-xs font-bold text-white/90">
                      <span className="inline-flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-300" /> {totalXp} XP
                      </span>
                      <span>{total} quests</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Progresso
                    </span>
                    <span className="text-xs font-bold text-foreground tabular-nums">
                      {done}/{total || '—'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn('h-full bg-gradient-to-r rounded-full transition-all', WORLD_GRADIENTS[world.id])}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div
                  className={cn(
                    'w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md shrink-0',
                    locked ? 'bg-muted-foreground/50' : 'bg-gradient-to-br',
                    !locked && WORLD_GRADIENTS[world.id],
                  )}
                >
                  {locked ? <Lock className="w-4 h-4" /> : done === total && total > 0 ? <Check className="w-5 h-5" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
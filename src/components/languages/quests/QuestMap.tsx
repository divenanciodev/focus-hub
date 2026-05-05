import { Lock, Crown, Star, Trophy, Zap, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WORLDS, type Quest } from './questData';

interface QuestMapProps {
  completedQuests: Set<string>;
  currentQuestId: string | null;
  onSelectQuest: (questId: string) => void;
}

export function QuestMap({ completedQuests, currentQuestId, onSelectQuest }: QuestMapProps) {
  const world = WORLDS[0];
  const totalXp = world.quests.reduce((sum, q) => sum + q.xpReward, 0);
  const earnedXp = world.quests
    .filter((q) => completedQuests.has(q.id))
    .reduce((sum, q) => sum + q.xpReward, 0);

  // determine availability: first quest unlocked, then unlock next after previous done
  const isUnlocked = (idx: number) => {
    if (idx === 0) return true;
    return completedQuests.has(world.quests[idx - 1].id);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16">
      {/* World header */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-xl border border-border p-5 mb-10 text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {world.subtitle}
        </div>
        <h2 className="text-2xl font-extrabold text-foreground mt-1">{world.title}</h2>
        <div className="mt-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
              style={{ width: `${(earnedXp / totalXp) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-muted-foreground tabular-nums">
            {earnedXp} / {totalXp} XP
          </span>
        </div>
      </div>

      {/* Path with nodes — zig-zag */}
      <div className="relative flex flex-col items-center gap-12">
        {world.quests.map((quest, idx) => {
          const unlocked = isUnlocked(idx);
          const completed = completedQuests.has(quest.id);
          const isCurrent = currentQuestId === quest.id || (!completed && unlocked && idx === world.quests.findIndex((q, i) => isUnlocked(i) && !completedQuests.has(q.id)));
          const offset = idx % 2 === 0 ? '-translate-x-12' : 'translate-x-12';
          return (
            <QuestNode
              key={quest.id}
              quest={quest}
              unlocked={unlocked}
              completed={completed}
              isCurrent={isCurrent}
              offsetClass={offset}
              onClick={() => unlocked && onSelectQuest(quest.id)}
            />
          );
        })}
      </div>

      {/* Coming soon worlds */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {WORLDS.slice(1).map((w) => (
          <div
            key={w.id}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center"
          >
            <Lock className="w-6 h-6 mx-auto text-white/60 mb-2" />
            <div className="text-xs font-bold uppercase tracking-widest text-white/70">
              {w.subtitle}
            </div>
            <div className="text-base font-bold text-white">{w.title}</div>
            <div className="text-xs text-white/60 mt-1">Em breve</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface QuestNodeProps {
  quest: Quest;
  unlocked: boolean;
  completed: boolean;
  isCurrent: boolean;
  offsetClass: string;
  onClick: () => void;
}

function QuestNode({ quest, unlocked, completed, isCurrent, offsetClass, onClick }: QuestNodeProps) {
  const Icon = quest.isBoss ? Trophy : completed ? Star : Crown;

  let bg = 'from-zinc-300 to-zinc-400'; // locked
  if (completed) bg = 'from-emerald-400 to-emerald-600';
  else if (isCurrent) bg = 'from-violet-400 to-fuchsia-500';
  else if (unlocked) bg = 'from-emerald-400 to-emerald-600';
  if (quest.isBoss && unlocked) bg = 'from-amber-400 to-orange-500';

  return (
    <div className={cn('flex flex-col items-center group', offsetClass)}>
      <button
        onClick={onClick}
        disabled={!unlocked}
        className="relative disabled:cursor-not-allowed"
        aria-label={quest.title}
      >
        {isCurrent && unlocked && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-violet-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg whitespace-nowrap">
            Atual
          </div>
        )}
        <div
          className={cn(
            'relative w-[110px] h-[110px] rounded-full flex items-center justify-center shadow-xl transition-transform bg-gradient-to-br',
            bg,
            unlocked && 'group-hover:scale-110 group-active:scale-95',
            !unlocked && 'opacity-70 grayscale',
          )}
        >
          {!unlocked ? (
            <Lock className="w-10 h-10 text-white drop-shadow" />
          ) : (
            <Icon className="w-12 h-12 text-white drop-shadow fill-white/30" />
          )}

          {/* reward preview */}
          {unlocked && !completed && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
              <Zap className="w-2.5 h-2.5 text-amber-300" /> {quest.xpReward}
              <Coins className="w-2.5 h-2.5 text-amber-300 ml-1" /> {quest.coinReward}
            </div>
          )}
        </div>
      </button>
      <div className="mt-4 text-center">
        <div className="text-sm font-extrabold text-white drop-shadow">{quest.title}</div>
        {quest.isBoss && (
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mt-0.5">
            Boss
          </div>
        )}
      </div>
    </div>
  );
}
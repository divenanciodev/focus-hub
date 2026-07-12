import { useState } from 'react';
import { ArrowLeft, ChevronDown, Circle, Zap, Crown, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuestWorld, Quest } from './questData';

interface QuestCurriculumProps {
  world: QuestWorld;
  completedQuests: Set<string>;
  onBack: () => void;
  onSelectQuest: (id: string) => void;
}

interface Section {
  id: string;
  title: string;
  quests: Quest[];
}

// Groups quests into logical sections. Boss quests split a section.
function buildSections(world: QuestWorld): Section[] {
  if (world.quests.length === 0) return [];
  const sections: Section[] = [];
  let current: Quest[] = [];
  let index = 1;

  const flush = (title: string) => {
    if (current.length) {
      sections.push({ id: `sec-${sections.length}`, title, quests: current });
      current = [];
    }
  };

  for (const q of world.quests) {
    current.push(q);
    if (q.isBoss) {
      flush(`Módulo ${index}`);
      index += 1;
    }
  }
  flush(`Módulo ${index}`);
  return sections;
}

export function QuestCurriculum({ world, completedQuests, onBack, onSelectQuest }: QuestCurriculumProps) {
  const sections = buildSections(world);
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.id)),
  );

  const toggle = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const done = world.quests.filter((q) => completedQuests.has(q.id)).length;
  const total = world.quests.length;

  // All quests are freely accessible from the curriculum screen.
  // Locking only applies when trying to advance WITHIN a lesson (handled per-lesson component).
  const isUnlocked = (_idx: number) => true;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16">
      {/* Back */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-bold mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar aos módulos
      </button>

      {/* Header card */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-xl border border-border overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-8 py-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest opacity-90">
                {world.subtitle}
              </div>
              <div className="text-xl font-extrabold">{world.title}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold tabular-nums">{done}/{total}</div>
            <div className="text-xs uppercase tracking-widest opacity-90">passos</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const open = openSections.has(section.id);
          const secDone = section.quests.filter((q) => completedQuests.has(q.id)).length;
          const secTotal = section.quests.length;
          const allDone = secDone === secTotal;

          return (
            <div key={section.id} className="bg-white dark:bg-card rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => toggle(section.id)}
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-muted/50 transition"
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                    allDone ? 'bg-violet-500 text-white' : 'border-2 border-muted-foreground/40',
                  )}
                >
                  {allDone && <span className="text-[9px] font-black tracking-tight">OK</span>}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-base font-bold text-foreground">{section.title}</div>
                </div>
                <div className="text-sm font-bold text-muted-foreground tabular-nums">
                  {secDone} de {secTotal} passos concluídos
                </div>
                <ChevronDown
                  className={cn('w-5 h-5 text-muted-foreground transition-transform', open && 'rotate-180')}
                />
              </button>

              {open && (
                <div className="border-t border-border">
                  {section.quests.map((quest) => {
                    const globalIdx = world.quests.findIndex((q) => q.id === quest.id);
                    const unlocked = isUnlocked(globalIdx);
                    const completed = completedQuests.has(quest.id);
                    return (
                      <QuestStepRow
                        key={quest.id}
                        quest={quest}
                        stepNumber={globalIdx + 1}
                        completed={completed}
                        unlocked={unlocked}
                        onClick={() => unlocked && onSelectQuest(quest.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {sections.length === 0 && (
          <div className="bg-white dark:bg-card rounded-xl border border-border p-8 text-center text-muted-foreground text-sm">
            Conteúdo em preparação.
          </div>
        )}
      </div>
    </div>
  );
}

function QuestStepRow({
  quest,
  stepNumber,
  completed,
  unlocked,
  onClick,
}: {
  quest: Quest;
  stepNumber: number;
  completed: boolean;
  unlocked: boolean;
  onClick: () => void;
}) {
  const badge = quest.isBoss ? 'Boss' : quest.isTheory ? 'Teoria' : 'Prática';
  const badgeClass = quest.isBoss
    ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
    : quest.isTheory
    ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40'
    : 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40';

  return (
    <button
      onClick={onClick}
      disabled={!unlocked}
      className={cn(
        'w-full px-6 py-4 flex items-center gap-4 border-t border-border first:border-t-0 text-left transition',
        unlocked ? 'hover:bg-muted/60 cursor-pointer' : 'opacity-50 cursor-not-allowed',
      )}
    >
      {/* status icon */}
      <div
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
          completed ? 'bg-violet-500 text-white' : 'border-2 border-muted-foreground/50',
        )}
      >
        {completed ? (
          <span className="text-[9px] font-black tracking-tight">OK</span>
        ) : (
          <Circle className="w-2.5 h-2.5 fill-transparent" />
        )}
      </div>

      {/* step number */}
      <div className="text-sm font-bold text-muted-foreground tabular-nums w-8">
        {stepNumber}.
      </div>

      {/* title */}
      <div className="flex-1 min-w-0 flex items-center gap-2.5 flex-wrap">
        <span className="text-base font-semibold text-foreground truncate">{quest.title}</span>
        <span className={cn('px-2 py-0.5 rounded border text-xs font-bold', badgeClass)}>
          {badge}
        </span>
        {quest.isBoss && <Trophy className="w-4 h-4 text-amber-500" />}
      </div>

      {/* rewards */}
      {unlocked && !completed && (
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <Zap className="w-4 h-4 text-amber-500" />
          {quest.xpReward}
        </div>
      )}
    </button>
  );
}
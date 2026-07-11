import { useState } from 'react';
import { ArrowLeft, Check, ChevronDown, Circle, Zap, Crown, Trophy, Lock } from 'lucide-react';
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

  // determine which quests are unlocked (sequential)
  const isUnlocked = (idx: number) => {
    if (idx === 0) return true;
    return completedQuests.has(world.quests[idx - 1].id);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16">
      {/* Back */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-bold mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar aos módulos
      </button>

      {/* Header card */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-xl border border-border overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-90">
                {world.subtitle}
              </div>
              <div className="text-lg font-extrabold">{world.title}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold tabular-nums">{done}/{total}</div>
            <div className="text-[10px] uppercase tracking-widest opacity-90">passos</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section) => {
          const open = openSections.has(section.id);
          const secDone = section.quests.filter((q) => completedQuests.has(q.id)).length;
          const secTotal = section.quests.length;
          const allDone = secDone === secTotal;

          return (
            <div key={section.id} className="bg-white dark:bg-card rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => toggle(section.id)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition"
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                    allDone ? 'bg-emerald-500 text-white' : 'border-2 border-muted-foreground/40',
                  )}
                >
                  {allDone && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-foreground">{section.title}</div>
                </div>
                <div className="text-xs font-bold text-muted-foreground tabular-nums">
                  {secDone} de {secTotal} passos concluídos
                </div>
                <ChevronDown
                  className={cn('w-4 h-4 text-muted-foreground transition-transform', open && 'rotate-180')}
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
  const badge = quest.isBoss ? 'Boss' : 'Prática';
  const badgeClass = quest.isBoss
    ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
    : 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40';

  return (
    <button
      onClick={onClick}
      disabled={!unlocked}
      className={cn(
        'w-full px-4 py-2.5 flex items-center gap-3 border-t border-border first:border-t-0 text-left transition',
        unlocked ? 'hover:bg-muted/60 cursor-pointer' : 'opacity-50 cursor-not-allowed',
      )}
    >
      {/* status icon */}
      <div
        className={cn(
          'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
          completed
            ? 'bg-emerald-500 text-white'
            : unlocked
            ? 'border-2 border-muted-foreground/50'
            : 'bg-muted',
        )}
      >
        {completed ? (
          <Check className="w-3 h-3" strokeWidth={3} />
        ) : !unlocked ? (
          <Lock className="w-3 h-3 text-muted-foreground" />
        ) : (
          <Circle className="w-2 h-2 fill-transparent" />
        )}
      </div>

      {/* step number */}
      <div className="text-xs font-bold text-muted-foreground tabular-nums w-6">
        {stepNumber}.
      </div>

      {/* title */}
      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold text-foreground truncate">{quest.title}</span>
        <span className={cn('px-1.5 py-0.5 rounded border text-[10px] font-bold', badgeClass)}>
          {badge}
        </span>
        {quest.isBoss && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
      </div>

      {/* rewards */}
      {unlocked && !completed && (
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
          <Zap className="w-3 h-3 text-amber-500" />
          {quest.xpReward}
        </div>
      )}
    </button>
  );
}
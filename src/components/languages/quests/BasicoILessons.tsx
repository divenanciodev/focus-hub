import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, Crown, Star, Briefcase, Plane, Utensils, MessagesSquare, Users, Lightbulb, Sparkles } from 'lucide-react';
import { ImGoodAtLesson } from './ImGoodAtLesson';
import { cn } from '@/lib/utils';

interface BasicoILessonsProps {
  onBack: () => void;
}

type NodeDef = {
  id: string;
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  bg: string;
  available: boolean;
  intro?: boolean;
};

const NODES: NodeDef[] = [
  { id: 'intro', title: 'Intro', Icon: Sparkles, bg: 'from-violet-300 to-violet-400', available: false, intro: true },
  { id: 'im-good-at', title: 'Habilidades e talentos', Icon: Star, bg: 'from-sky-400 to-sky-500', available: true },
  { id: 'travel', title: 'Viagens', Icon: Plane, bg: 'from-sky-400 to-sky-500', available: false },
  { id: 'menu', title: 'Menu', Icon: Utensils, bg: 'from-sky-400 to-sky-500', available: false },
  { id: 'meet', title: 'Encontros', Icon: MessagesSquare, bg: 'from-sky-400 to-sky-500', available: false },
  { id: 'family', title: 'Família', Icon: Users, bg: 'from-sky-400 to-sky-500', available: false },
  { id: 'jobs', title: 'Empregos', Icon: Briefcase, bg: 'from-fuchsia-400 to-purple-500', available: false },
  { id: 'present', title: 'Presente 1', Icon: Lightbulb, bg: 'from-muted to-muted', available: false },
];

export function BasicoILessons({ onBack }: BasicoILessonsProps) {
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});

  if (openLesson === 'im-good-at') {
    return (
      <ImGoodAtLesson
        onBack={() => setOpenLesson(null)}
        onComplete={(p) => setProgress((s) => ({ ...s, 'im-good-at': p }))}
        initialProgress={progress['im-good-at'] ?? 0}
      />
    );
  }

  const totalCrowns = 50;
  const earnedCrowns = Object.values(progress).filter((p) => p >= 100).length * 10;

  return (
    <div className="max-w-md mx-auto pb-10">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/15">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-bold">
          <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span className="tabular-nums">{earnedCrowns}</span>
        </div>
      </div>

      {/* Section header card */}
      <div className="relative mx-auto w-full max-w-xs mb-10">
        <div className="absolute left-1/2 -translate-x-1/2 -top-8 text-4xl">🏰</div>
        <div className="bg-white dark:bg-card rounded-2xl shadow-xl border border-border px-6 pt-6 pb-4 text-center">
          <h2 className="text-2xl font-extrabold text-foreground">Estrutura de Inglês I</h2>
          <div className="mt-3 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${(earnedCrowns / totalCrowns) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-muted-foreground tabular-nums">
              {earnedCrowns} / {totalCrowns}
            </span>
          </div>
        </div>
      </div>

      {/* Path nodes — hierarchy: solo, pairs, solo */}
      {(() => {
        // Group: [intro], [im-good-at, travel], [menu, meet], [family, jobs], [present]
        const rows: NodeDef[][] = [
          [NODES[0]],
          [NODES[1], NODES[2]],
          [NODES[3], NODES[4]],
          [NODES[5], NODES[6]],
          [NODES[7]],
        ];

        const renderNode = (node: NodeDef) => {
          const pct = progress[node.id] ?? 0;
          const completed = pct >= 100;
          const Icon = node.Icon;
          const isLocked = !node.available;
          return (
            <div
              key={node.id}
              className="flex flex-col items-center"
            >
              <button
                onClick={() => node.available && setOpenLesson(node.id)}
                disabled={isLocked}
                className="group relative disabled:cursor-not-allowed"
                aria-label={node.title}
              >
                {/* progress ring */}
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" width={104} height={104}>
                  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="6" />
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke={completed ? '#facc15' : 'rgba(250,204,21,0.9)'}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 46}
                    strokeDashoffset={(2 * Math.PI * 46) * (1 - pct / 100)}
                  />
                </svg>

                <div
                  className={cn(
                    'relative w-[104px] h-[104px] rounded-full flex items-center justify-center shadow-xl transition-transform',
                    'bg-gradient-to-br',
                    node.bg,
                    !isLocked && 'group-hover:scale-105 group-active:scale-95',
                    isLocked && 'opacity-70 grayscale'
                  )}
                >
                  {isLocked ? (
                    <Lock className="w-10 h-10 text-white drop-shadow" />
                  ) : (
                    <Icon className="w-12 h-12 text-white drop-shadow fill-white/20" />
                  )}

                  {/* crown badge */}
                  {!node.intro && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center',
                        completed ? 'bg-amber-400' : 'bg-muted'
                      )}>
                        <Crown className={cn(
                          'w-3.5 h-3.5',
                          completed ? 'text-white fill-white' : 'text-muted-foreground'
                        )} />
                      </div>
                    </div>
                  )}
                </div>
              </button>

              <div className="mt-2.5 text-center text-sm font-extrabold text-white drop-shadow max-w-[140px]">
                {node.title}
              </div>
            </div>
          );
        };

        return (
          <div className="flex flex-col items-center gap-10">
            {rows.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className={cn(
                  'flex items-start justify-center',
                  row.length === 1 ? 'w-full' : 'gap-12 sm:gap-16'
                )}
              >
                {row.map(renderNode)}
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

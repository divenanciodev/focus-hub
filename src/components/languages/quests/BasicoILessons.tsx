import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Play } from 'lucide-react';
import { ImGoodAtLesson } from './ImGoodAtLesson';

interface BasicoILessonsProps {
  onBack: () => void;
}

const LESSONS = [
  {
    id: 'im-good-at',
    title: "I'm good at",
    subtitle: 'Habilidades e talentos',
    progress: 0,
    icon: '🚀',
    available: true,
  },
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

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/15 mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Quests
      </Button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm mb-3">
          🥉 Pacote
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
          Básico I
        </h1>
        <p className="text-white/80 mt-2">Comece sua jornada com lições essenciais</p>
      </div>

      <div className="space-y-4">
        {LESSONS.map((lesson) => {
          const pct = progress[lesson.id] ?? lesson.progress;
          const completed = pct >= 100;
          return (
            <button
              key={lesson.id}
              onClick={() => lesson.available && setOpenLesson(lesson.id)}
              disabled={!lesson.available}
              className="w-full text-left disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Card className="bg-white dark:bg-card border-0 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all p-4 flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-3xl shadow-md">
                    {lesson.icon}
                  </div>
                  {completed && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-lg font-extrabold text-foreground truncate">
                      {lesson.title}
                    </h3>
                    <span className="text-xs font-bold text-muted-foreground tabular-nums">
                      {pct}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{lesson.subtitle}</p>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="shrink-0">
                  {completed ? (
                    <Button size="sm" variant="secondary" className="rounded-full">
                      Revisar
                    </Button>
                  ) : (
                    <Button size="sm" className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                      <Play className="w-4 h-4 mr-1 fill-current" />
                      {pct > 0 ? 'Continuar' : 'Iniciar'}
                    </Button>
                  )}
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}

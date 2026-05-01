import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Volume2, CheckCircle2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImGoodAtLessonProps {
  onBack: () => void;
  onComplete: (progress: number) => void;
  initialProgress: number;
}

type Stage = 'intro' | 'learn' | 'done';

interface VocabItem {
  en: string;
  pt: string;
  emoji: string;
}

interface VocabGroup {
  title: string;
  emoji: string;
  color: string;
  items: VocabItem[];
}

const GROUPS: VocabGroup[] = [
  {
    title: 'Habilidades gerais',
    emoji: '🧠',
    color: 'from-indigo-400 to-purple-500',
    items: [
      { en: "I'm good at speaking", pt: 'Eu sou bom(a) em falar', emoji: '🗣️' },
      { en: "I'm good at writing", pt: 'Eu sou bom(a) em escrever', emoji: '✍️' },
      { en: "I'm good at reading", pt: 'Eu sou bom(a) em ler', emoji: '📖' },
      { en: "I'm good at learning", pt: 'Eu sou bom(a) em aprender', emoji: '🎓' },
      { en: "I'm good at explaining things", pt: 'Eu sou bom(a) em explicar coisas', emoji: '💡' },
      { en: "I'm good at teaching", pt: 'Eu sou bom(a) em ensinar', emoji: '👩‍🏫' },
    ],
  },
  {
    title: 'Tecnologia / estudo',
    emoji: '💻',
    color: 'from-cyan-400 to-blue-500',
    items: [
      { en: "I'm good at typing", pt: 'Eu sou bom(a) em digitar', emoji: '⌨️' },
      { en: "I'm good at coding", pt: 'Eu sou bom(a) em programar', emoji: '👨‍💻' },
      { en: "I'm good at designing", pt: 'Eu sou bom(a) em criar/design', emoji: '🎨' },
      { en: "I'm good at researching", pt: 'Eu sou bom(a) em pesquisar', emoji: '🔍' },
    ],
  },
  {
    title: 'Criatividade',
    emoji: '🎨',
    color: 'from-pink-400 to-rose-500',
    items: [
      { en: "I'm good at drawing", pt: 'Eu sou bom(a) em desenhar', emoji: '✏️' },
      { en: "I'm good at painting", pt: 'Eu sou bom(a) em pintar', emoji: '🖌️' },
      { en: "I'm good at creating", pt: 'Eu sou bom(a) em criar', emoji: '✨' },
      { en: "I'm good at editing videos", pt: 'Eu sou bom(a) em editar vídeos', emoji: '🎬' },
    ],
  },
  {
    title: 'Comunicação',
    emoji: '🗣️',
    color: 'from-emerald-400 to-teal-500',
    items: [
      { en: "I'm good at talking to people", pt: 'Eu sou bom(a) em conversar com pessoas', emoji: '💬' },
      { en: "I'm good at listening", pt: 'Eu sou bom(a) em ouvir', emoji: '👂' },
      { en: "I'm good at presenting", pt: 'Eu sou bom(a) em apresentar', emoji: '🎤' },
      { en: "I'm good at negotiating", pt: 'Eu sou bom(a) em negociar', emoji: '🤝' },
    ],
  },
  {
    title: 'Atividades físicas',
    emoji: '🏃‍♀️',
    color: 'from-orange-400 to-red-500',
    items: [
      { en: "I'm good at running", pt: 'Eu sou bom(a) em correr', emoji: '🏃' },
      { en: "I'm good at swimming", pt: 'Eu sou bom(a) em nadar', emoji: '🏊' },
      { en: "I'm good at dancing", pt: 'Eu sou bom(a) em dançar', emoji: '💃' },
      { en: "I'm good at training", pt: 'Eu sou bom(a) em treinar', emoji: '🏋️' },
    ],
  },
  {
    title: 'Vida prática',
    emoji: '🍳',
    color: 'from-amber-400 to-yellow-500',
    items: [
      { en: "I'm good at cooking", pt: 'Eu sou bom(a) em cozinhar', emoji: '👨‍🍳' },
      { en: "I'm good at driving", pt: 'Eu sou bom(a) em dirigir', emoji: '🚗' },
      { en: "I'm good at organizing things", pt: 'Eu sou bom(a) em organizar coisas', emoji: '🗂️' },
      { en: "I'm good at planning", pt: 'Eu sou bom(a) em planejar', emoji: '📅' },
    ],
  },
];

const TOTAL_ITEMS = GROUPS.reduce((s, g) => s + g.items.length, 0);

function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function ImGoodAtLesson({ onBack, onComplete, initialProgress }: ImGoodAtLessonProps) {
  const [stage, setStage] = useState<Stage>('intro');
  const [learned, setLearned] = useState<Set<string>>(new Set());

  const learnedCount = learned.size;
  const pct = Math.round((learnedCount / TOTAL_ITEMS) * 100);

  const toggleLearned = (key: string) => {
    setLearned((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      const newPct = Math.round((next.size / TOTAL_ITEMS) * 100);
      onComplete(newPct);
      return next;
    });
  };

  // INTRO
  if (stage === 'intro') {
    return (
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/15 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <Card className="bg-white dark:bg-card border-0 rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-4">
              <BookOpen className="w-3.5 h-3.5" /> Lição
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">
              I'm good at
            </h1>
          </div>

          <div className="space-y-5 text-foreground">
            <p className="text-center text-lg leading-relaxed">
              <strong>I'm</strong> é a forma contraída de <strong>I AM</strong>. A palavra <em>I am</em> significa
              <strong> Eu Sou</strong> e <em>Good at</em> significa <strong>Bom em</strong>. A frase completa diz a
              alguém que você se destaca em algo.
            </p>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-2xl p-6 text-center">
              <h3 className="text-xl md:text-2xl font-bold mb-3">
                Na estrutura <span className="text-indigo-600">"I'm good at..."</span>, usamos:
              </h3>
              <div className="text-2xl md:text-3xl font-extrabold flex items-center justify-center gap-2">
                👉 <span className="text-purple-600">verbo + ing</span>
                <span className="text-muted-foreground text-lg">(gerúndio)</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground text-center max-w-xl mx-auto leading-relaxed">
              Mas na frase funcionam como <strong>substantivos (gerúndio)</strong>. Ou seja, eles se comportam
              como "coisas/atividades", não como ação no tempo verbal.
            </div>

            <div className="bg-foreground text-background rounded-2xl p-5 text-center">
              <div className="text-xl md:text-2xl font-extrabold">
                I'm good at <span className="text-amber-300">+ verbo com -ing</span>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            onClick={() => setStage('learn')}
            className="w-full mt-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base h-12"
          >
            Vamos aprender <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>
    );
  }

  // LEARN
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => setStage('intro')} className="text-white hover:bg-white/15">
          <ArrowLeft className="w-4 h-4 mr-2" /> Explicação
        </Button>
        <div className="flex items-center gap-3">
          <div className="text-white text-sm font-bold tabular-nums">
            {learnedCount}/{TOTAL_ITEMS}
          </div>
          <div className="w-32 h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-white text-sm font-bold tabular-nums">{pct}%</div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
          Vocabulário: <span className="text-amber-200">verbo + ing</span>
        </h1>
        <p className="text-white/80 text-sm mt-1">
          Toque em uma palavra para ouvir. Marque as que você já aprendeu.
        </p>
      </div>

      <div className="space-y-6">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <div className="flex items-center gap-2 mb-3 text-white">
              <div
                className={cn(
                  'w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-lg shadow-md',
                  group.color
                )}
              >
                {group.emoji}
              </div>
              <h2 className="text-lg font-extrabold drop-shadow">{group.title}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.items.map((item) => {
                const key = item.en;
                const isLearned = learned.has(key);
                return (
                  <Card
                    key={key}
                    className={cn(
                      'group relative bg-white dark:bg-card border-0 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all p-4 flex items-center gap-3 cursor-pointer',
                      isLearned && 'ring-2 ring-emerald-400'
                    )}
                    onClick={() => toggleLearned(key)}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl shrink-0',
                        group.color
                      )}
                    >
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-foreground text-sm truncate">{item.en}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.pt}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(item.en);
                      }}
                      className="w-8 h-8 rounded-full bg-muted hover:bg-indigo-100 hover:text-indigo-600 flex items-center justify-center transition shrink-0"
                      aria-label="Ouvir"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    {isLearned && (
                      <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 rounded-full p-0.5 shadow">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 mb-4 flex justify-center">
        <Button
          size="lg"
          onClick={onBack}
          className="rounded-full bg-white text-foreground hover:bg-white/90 font-bold px-8 shadow-xl"
        >
          Concluir lição
        </Button>
      </div>
    </div>
  );
}

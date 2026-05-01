import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Volume2, CheckCircle2, BookOpen, X, Lock, Trophy } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ImGoodAtLessonProps {
  onBack: () => void;
  onComplete: (progress: number) => void;
  initialProgress: number;
}

type Stage = 'intro' | 'learn';

interface VocabItem {
  en: string;
  pt: string;
  emoji: string;
}

interface VocabGroup {
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  trophyColor: string;
  badgeBg: string;
  items: VocabItem[];
}

const GROUPS: VocabGroup[] = [
  {
    title: 'Habilidades gerais',
    subtitle: 'Fale, escreva, leia e ensine como um nativo',
    emoji: '🧠',
    color: 'from-indigo-400 to-purple-500',
    trophyColor: 'from-amber-500 via-orange-500 to-rose-500',
    badgeBg: 'bg-orange-500',
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
    subtitle: 'Vocabulário do mundo digital e dos estudos',
    emoji: '💻',
    color: 'from-cyan-400 to-blue-500',
    trophyColor: 'from-slate-300 via-slate-400 to-slate-500',
    badgeBg: 'bg-slate-500',
    items: [
      { en: "I'm good at typing", pt: 'Eu sou bom(a) em digitar', emoji: '⌨️' },
      { en: "I'm good at coding", pt: 'Eu sou bom(a) em programar', emoji: '👨‍💻' },
      { en: "I'm good at designing", pt: 'Eu sou bom(a) em criar/design', emoji: '🎨' },
      { en: "I'm good at researching", pt: 'Eu sou bom(a) em pesquisar', emoji: '🔍' },
    ],
  },
  {
    title: 'Criatividade',
    subtitle: 'Expresse seu lado artístico em inglês',
    emoji: '🎨',
    color: 'from-pink-400 to-rose-500',
    trophyColor: 'from-yellow-300 via-amber-400 to-yellow-600',
    badgeBg: 'bg-amber-500',
    items: [
      { en: "I'm good at drawing", pt: 'Eu sou bom(a) em desenhar', emoji: '✏️' },
      { en: "I'm good at painting", pt: 'Eu sou bom(a) em pintar', emoji: '🖌️' },
      { en: "I'm good at creating", pt: 'Eu sou bom(a) em criar', emoji: '✨' },
      { en: "I'm good at editing videos", pt: 'Eu sou bom(a) em editar vídeos', emoji: '🎬' },
    ],
  },
  {
    title: 'Comunicação',
    subtitle: 'Conecte-se com pessoas em qualquer lugar',
    emoji: '🗣️',
    color: 'from-emerald-400 to-teal-500',
    trophyColor: 'from-blue-400 via-indigo-500 to-blue-700',
    badgeBg: 'bg-blue-500',
    items: [
      { en: "I'm good at talking to people", pt: 'Eu sou bom(a) em conversar com pessoas', emoji: '💬' },
      { en: "I'm good at listening", pt: 'Eu sou bom(a) em ouvir', emoji: '👂' },
      { en: "I'm good at presenting", pt: 'Eu sou bom(a) em apresentar', emoji: '🎤' },
      { en: "I'm good at negotiating", pt: 'Eu sou bom(a) em negociar', emoji: '🤝' },
    ],
  },
  {
    title: 'Atividades físicas',
    subtitle: 'Mexa-se e descreva seus esportes favoritos',
    emoji: '🏃‍♀️',
    color: 'from-orange-400 to-red-500',
    trophyColor: 'from-emerald-400 via-green-500 to-teal-600',
    badgeBg: 'bg-emerald-500',
    items: [
      { en: "I'm good at running", pt: 'Eu sou bom(a) em correr', emoji: '🏃' },
      { en: "I'm good at swimming", pt: 'Eu sou bom(a) em nadar', emoji: '🏊' },
      { en: "I'm good at dancing", pt: 'Eu sou bom(a) em dançar', emoji: '💃' },
      { en: "I'm good at training", pt: 'Eu sou bom(a) em treinar', emoji: '🏋️' },
    ],
  },
  {
    title: 'Vida prática',
    subtitle: 'Rotina, casa e organização do dia a dia',
    emoji: '🍳',
    color: 'from-amber-400 to-yellow-500',
    trophyColor: 'from-fuchsia-400 via-purple-500 to-violet-700',
    badgeBg: 'bg-purple-500',
    items: [
      { en: "I'm good at cooking", pt: 'Eu sou bom(a) em cozinhar', emoji: '👨‍🍳' },
      { en: "I'm good at driving", pt: 'Eu sou bom(a) em dirigir', emoji: '🚗' },
      { en: "I'm good at organizing things", pt: 'Eu sou bom(a) em organizar coisas', emoji: '🗂️' },
      { en: "I'm good at planning", pt: 'Eu sou bom(a) em planejar', emoji: '📅' },
    ],
  },
];

const TOTAL_ITEMS = GROUPS.reduce((s, g) => s + g.items.length, 0);

function extractGerund(en: string): string {
  const m = en.match(/good at (.+)/i);
  return (m?.[1] ?? en).split(' ')[0];
}

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
  const [openGroup, setOpenGroup] = useState<VocabGroup | null>(null);
  const [cardIndex, setCardIndex] = useState(0);

  const learnedCount = learned.size;
  const pct = Math.round((learnedCount / TOTAL_ITEMS) * 100);

  const markLearned = (key: string) => {
    setLearned((s) => {
      if (s.has(key)) return s;
      const next = new Set(s);
      next.add(key);
      const newPct = Math.round((next.size / TOTAL_ITEMS) * 100);
      onComplete(newPct);
      return next;
    });
  };

  const openGroupModal = (group: VocabGroup) => {
    setOpenGroup(group);
    setCardIndex(0);
  };

  const closeGroupModal = () => {
    setOpenGroup(null);
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
  };

  const nextCard = () => {
    if (!openGroup) return;
    const current = openGroup.items[cardIndex];
    if (current) markLearned(current.en);
    if (cardIndex < openGroup.items.length - 1) {
      setCardIndex((i) => i + 1);
    } else {
      closeGroupModal();
    }
  };

  const prevCard = () => {
    if (cardIndex > 0) setCardIndex((i) => i - 1);
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

  // LEARN — trophy-style category cards
  return (
    <div className="max-w-6xl mx-auto">
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

      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
          Conquiste todas as <span className="text-amber-200">categorias</span>
        </h1>
        <p className="text-white/80 text-sm mt-1">
          Toque em um troféu para começar a estudar as palavras dessa categoria.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {GROUPS.map((group, idx) => {
          const groupLearned = group.items.filter((i) => learned.has(i.en)).length;
          const groupPct = Math.round((groupLearned / group.items.length) * 100);
          const completed = groupPct >= 100;
          const xp = group.items.length * 10;
          return (
            <button
              key={group.title}
              onClick={() => openGroupModal(group)}
              className="group text-left"
            >
              <Card className="relative bg-white dark:bg-card border-0 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all p-5 pt-6 h-full flex flex-col">
                <div className="absolute top-3 left-3">
                  <div className={cn('relative w-9 h-9 flex items-center justify-center text-white rounded-md rotate-3 shadow-md', group.badgeBg)}>
                    <Trophy className="w-4 h-4" />
                    <span className="absolute -bottom-1 -right-1 bg-white text-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow font-bold">
                      {idx + 1}
                    </span>
                  </div>
                </div>

                <div className="absolute top-3 right-3 text-xs font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded-full">
                  + {xp} EXP
                </div>

                <div className="flex justify-center mt-4 mb-3">
                  <div className="relative">
                    <div
                      className={cn(
                        'w-24 h-24 bg-gradient-to-br flex items-center justify-center shadow-xl',
                        group.trophyColor
                      )}
                      style={{
                        clipPath:
                          'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      }}
                    >
                      <Trophy className="w-12 h-12 text-white drop-shadow-lg" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white text-foreground text-[11px] font-extrabold w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-muted">
                      {idx + 1}
                    </div>
                  </div>
                </div>

                <h3 className="text-center text-base font-extrabold text-foreground mt-2">
                  {group.title}
                </h3>
                <p className="text-center text-xs text-muted-foreground mt-1 leading-snug px-2 line-clamp-2 min-h-[2.25rem]">
                  {group.subtitle}
                </p>

                <div className="mt-4">
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        completed
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400'
                      )}
                      style={{ width: `${groupPct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 text-center text-[11px] font-extrabold tracking-[0.15em] uppercase">
                  {completed ? (
                    <span className="text-emerald-600 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                    </span>
                  ) : groupLearned > 0 ? (
                    <span className="text-indigo-600">Em progresso</span>
                  ) : (
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Iniciar
                    </span>
                  )}
                </div>
              </Card>
            </button>
          );
        })}
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

      {/* Study modal — center flashcard */}
      <Dialog open={!!openGroup} onOpenChange={(o) => !o && closeGroupModal()}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
          {openGroup && (() => {
            const item = openGroup.items[cardIndex];
            const total = openGroup.items.length;
            const isLearned = learned.has(item.en);
            const gerund = extractGerund(item.en);
            return (
              <Card className="bg-white dark:bg-card border-0 rounded-3xl shadow-2xl p-6 relative">
                <button
                  onClick={closeGroupModal}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center z-10"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-3 pr-10">
                  <div className={cn('w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-sm shadow', openGroup.color)}>
                    {openGroup.emoji}
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">
                    {openGroup.title}
                  </span>
                  <span className="ml-auto text-xs font-bold text-muted-foreground tabular-nums">
                    {cardIndex + 1} / {total}
                  </span>
                </div>

                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-6">
                  <div
                    className={cn('h-full bg-gradient-to-r transition-all', openGroup.color)}
                    style={{ width: `${((cardIndex + 1) / total) * 100}%` }}
                  />
                </div>

                <div
                  className={cn(
                    'mx-auto w-44 h-44 rounded-3xl bg-gradient-to-br flex items-center justify-center text-7xl shadow-xl mb-6',
                    openGroup.color
                  )}
                >
                  {item.emoji}
                </div>

                <div className="text-center">
                  <div className="text-3xl font-extrabold text-foreground capitalize">
                    {gerund}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 italic">
                    {item.en}
                  </div>
                  <div className="text-sm font-medium text-foreground/70 mt-2">
                    {item.pt}
                  </div>
                </div>

                <div className="flex justify-center mt-5">
                  <Button
                    size="lg"
                    onClick={() => speak(item.en)}
                    className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl"
                  >
                    <Volume2 className="w-5 h-5 mr-2" /> Ouvir pronúncia
                  </Button>
                </div>

                <div className="flex items-center justify-between gap-3 mt-6">
                  <Button
                    variant="ghost"
                    onClick={prevCard}
                    disabled={cardIndex === 0}
                    className="rounded-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Anterior
                  </Button>

                  {isLearned && (
                    <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Aprendida
                    </span>
                  )}

                  <Button
                    onClick={nextCard}
                    className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-bold"
                  >
                    {cardIndex === total - 1 ? 'Concluir' : 'Próxima'}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

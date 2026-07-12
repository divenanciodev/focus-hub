import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Mic,
  Menu,
  ChevronDown,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Quest } from './questData';

interface TheoryLessonProps {
  quest: Quest;
  onBack: () => void;
  onComplete: () => void;
}

interface Question {
  id: number;
  text: string;
  options: { label: string; text: string }[];
  correct: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'O que são "greetings"?',
    options: [
      { label: 'a', text: 'Palavras usadas apenas em e-mails formais' },
      { label: 'b', text: 'Palavras e expressões usadas para cumprimentar alguém, iniciar uma conversa ou demonstrar educação e cordialidade' },
      { label: 'c', text: 'Expressões usadas somente entre familiares' },
      { label: 'd', text: 'Termos técnicos usados em entrevistas de emprego' },
    ],
    correct: 'b',
  },
  {
    id: 2,
    text: 'Segundo o texto, os greetings costumam ser:',
    options: [
      { label: 'a', text: 'A última interação entre duas pessoas' },
      { label: 'b', text: 'Usados apenas em situações informais' },
      { label: 'c', text: 'A primeira interação entre duas pessoas' },
      { label: 'd', text: 'Dispensáveis no inglês americano' },
    ],
    correct: 'c',
  },
  {
    id: 3,
    text: 'Qual das opções abaixo NÃO é citada no texto como uma situação em que se usam greetings?',
    options: [
      { label: 'a', text: 'Participar de reuniões' },
      { label: 'b', text: 'Fazer entrevistas de emprego' },
      { label: 'c', text: 'Assistir a um filme' },
      { label: 'd', text: 'Iniciar uma ligação telefônica' },
    ],
    correct: 'c',
  },
  {
    id: 4,
    text: 'De acordo com o texto, os cumprimentos ajudam a:',
    options: [
      { label: 'a', text: 'Evitar conversas desnecessárias' },
      { label: 'b', text: 'Demonstrar educação, criar boa primeira impressão e mostrar respeito' },
      { label: 'c', text: 'Substituir o assunto principal da conversa' },
      { label: 'd', text: 'Tornar a comunicação mais formal em qualquer situação' },
    ],
    correct: 'b',
  },
  {
    id: 5,
    text: 'No inglês americano, como costuma ser iniciada uma conversa antes de se falar sobre o assunto principal?',
    options: [
      { label: 'a', text: 'Diretamente, sem nenhum cumprimento' },
      { label: 'b', text: 'Com perguntas pessoais sobre a vida do interlocutor' },
      { label: 'c', text: 'Com um cumprimento (greeting)' },
      { label: 'd', text: 'Com uma despedida antecipada' },
    ],
    correct: 'c',
  },
];

export function TheoryLesson({ quest, onBack, onComplete }: TheoryLessonProps) {
  const [showDescription, setShowDescription] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined);
  const allCorrect = QUESTIONS.every((q) => answers[q.id] === q.correct);

  const handleSubmit = () => setSubmitted(true);
  const handleRetry = () => { setAnswers({}); setSubmitted(false); };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-100 dark:bg-zinc-900 flex flex-col overflow-hidden">

      {/* ── Purple header (same as ImModule) ── */}
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-6 py-3 flex items-center gap-4 shadow-lg shrink-0">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white text-violet-600 flex items-center justify-center shadow-md hover:scale-105 transition"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 bg-white/95 rounded-full px-3 py-1.5 shadow">
            <span className="text-amber-400 text-lg">★</span>
            <span className="font-extrabold text-sm">1</span>
            <div className="w-16 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: '33%' }} />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/95 rounded-full px-3 py-1.5 shadow">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-white text-[10px] font-bold flex items-center justify-center">XP</span>
            <span className="font-extrabold text-sm">570,00</span>
            <span className="text-[10px] text-muted-foreground font-bold">XPS</span>
          </div>
          <div className="flex items-center gap-2 bg-white/95 rounded-full px-3 py-1.5 shadow">
            <span className="w-6 h-6 rounded-full bg-violet-300 text-white text-[10px] font-bold flex items-center justify-center">M</span>
            <span className="font-extrabold text-sm">1.500</span>
            <span className="text-[10px] text-muted-foreground font-bold">MOEDAS</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-violet-600">
          <Mic className="w-5 h-5" />
        </div>
      </div>

      {/* ── Course description bar (same as ImModule) ── */}
      <div className="bg-white dark:bg-card border-b border-border px-6 py-4 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center transition"
            aria-label="Anterior"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDescription((v) => !v)}
            aria-expanded={showDescription}
            className="flex items-center gap-2 px-4 h-9 rounded-lg border border-border bg-background hover:bg-muted text-sm font-semibold transition"
          >
            <Menu className="w-4 h-4" />
            Descrição do Curso
            <ChevronDown className={cn('w-4 h-4 transition-transform', showDescription && 'rotate-180')} />
          </button>
          <button
            onClick={onComplete}
            className="w-9 h-9 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center transition"
            aria-label="Próximo"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {showDescription && (
          <div className="max-w-4xl mx-auto mt-3 rounded-xl border border-border bg-muted/40 p-4 animate-in fade-in slide-in-from-top-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              {quest.title}
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              Introdução ao conceito de greetings: o que são, para que servem e por que são essenciais na comunicação em inglês.
            </p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg bg-background border border-border p-3">
                <div className="font-bold text-muted-foreground uppercase tracking-widest mb-1">Tipo</div>
                <div className="font-mono text-foreground">Teoria</div>
              </div>
              <div className="rounded-lg bg-background border border-border p-3">
                <div className="font-bold text-muted-foreground uppercase tracking-widest mb-1">Etapas</div>
                <div className="text-foreground">Leitura › Quiz</div>
              </div>
              <div className="rounded-lg bg-background border border-border p-3">
                <div className="font-bold text-muted-foreground uppercase tracking-widest mb-1">Dica</div>
                <div className="text-foreground">Leia com atenção antes de responder o quiz.</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Body: single full-width card ── */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full bg-white dark:bg-card rounded-xl border border-border overflow-y-auto">

          {/* Theory content */}
          <div className="p-6 border-b border-border">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-bold mb-3">
              <BookOpen className="w-3.5 h-3.5" /> Teoria
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">{quest.title}</h1>

            <div className="mt-4 space-y-4 text-sm leading-relaxed text-foreground">
              <p>
                Greetings são as palavras e expressões usadas para cumprimentar alguém, iniciar uma
                conversa ou demonstrar educação e cordialidade.
              </p>
              <p>
                Eles são uma parte essencial da comunicação em inglês e costumam ser a{' '}
                <strong>primeira interação</strong> entre duas pessoas.
              </p>

              <div>
                <p className="font-semibold mb-2">Os greetings podem ser usados em diversas situações, como:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Conhecer alguém pela primeira vez.</li>
                  <li>Encontrar amigos ou familiares.</li>
                  <li>Conversar com colegas de trabalho.</li>
                  <li>Atender clientes.</li>
                  <li>Participar de reuniões.</li>
                  <li>Fazer entrevistas de emprego.</li>
                  <li>Iniciar uma ligação telefônica.</li>
                  <li>Enviar mensagens ou e-mails.</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold mb-2">Por que os greetings são importantes?</p>
                <p className="mb-2">Os cumprimentos ajudam a:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Demonstrar educação.</li>
                  <li>Criar uma boa primeira impressão.</li>
                  <li>Iniciar conversas de forma natural.</li>
                  <li>Mostrar respeito.</li>
                  <li>Adaptar sua linguagem ao contexto (formal ou informal).</li>
                </ul>
              </div>

              <p>
                No inglês, especialmente no inglês americano, é muito comum iniciar qualquer conversa
                com um cumprimento antes de falar sobre o assunto principal.
              </p>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-200">
                  Leia o texto com atenção antes de responder as perguntas abaixo.
                </p>
              </div>
            </div>
          </div>

          {/* Quiz */}
          <div className="p-6">
            <h2 className="text-xl font-extrabold text-foreground mb-1">Quiz</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Responda todas as perguntas para concluir a lição.
            </p>

            <div className="space-y-4">
              {QUESTIONS.map((q) => {
                const chosen = answers[q.id];
                return (
                  <div key={q.id} className="rounded-xl border border-border overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground mr-2">{q.id}.</span>
                      <span className="text-sm font-semibold text-foreground">{q.text}</span>
                    </div>
                    <div className="divide-y divide-border">
                      {q.options.map((opt) => {
                        const isChosen = chosen === opt.label;
                        const isRight = opt.label === q.correct;
                        let optClass = 'w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition';
                        if (submitted) {
                          if (isRight) optClass += ' bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold';
                          else if (isChosen) optClass += ' bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400';
                          else optClass += ' text-muted-foreground opacity-60';
                        } else {
                          optClass += isChosen
                            ? ' bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 font-semibold'
                            : ' hover:bg-muted/50 text-foreground cursor-pointer';
                        }
                        return (
                          <button
                            key={opt.label}
                            disabled={submitted}
                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.label }))}
                            className={cn(optClass)}
                          >
                            <span className={cn(
                              'w-6 h-6 rounded-full border-2 text-xs font-black flex items-center justify-center shrink-0 uppercase',
                              submitted && isRight ? 'border-emerald-500 bg-emerald-500 text-white'
                                : submitted && isChosen ? 'border-red-500 bg-red-500 text-white'
                                : isChosen ? 'border-violet-500 bg-violet-500 text-white'
                                : 'border-muted-foreground/40 text-muted-foreground',
                            )}>
                              {opt.label}
                            </span>
                            <span className="flex-1">{opt.text}</span>
                            {submitted && isRight && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                            {submitted && isChosen && !isRight && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="mt-6">
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className={cn(
                    'w-full py-3 rounded-xl font-extrabold text-base transition',
                    allAnswered
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 shadow-lg'
                      : 'bg-muted text-muted-foreground cursor-not-allowed',
                  )}
                >
                  Verificar respostas
                </button>
              ) : allCorrect ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl px-4 py-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-extrabold text-emerald-700 dark:text-emerald-300 text-sm">Parabéns! Todas as respostas corretas.</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Você pode avançar para a próxima lição.</p>
                    </div>
                  </div>
                  <button
                    onClick={onComplete}
                    className="w-full py-3 rounded-xl font-extrabold text-base bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 shadow-lg transition flex items-center justify-center gap-2"
                  >
                    Próxima lição <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl px-4 py-3">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                      <p className="font-extrabold text-red-700 dark:text-red-300 text-sm">Algumas respostas estão incorretas.</p>
                      <p className="text-xs text-red-600 dark:text-red-400">Revise o texto e tente novamente.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="w-full py-3 rounded-xl font-extrabold text-base bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 shadow-lg transition"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

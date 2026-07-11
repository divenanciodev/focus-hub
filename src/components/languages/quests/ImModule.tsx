import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  Mic,
  Sparkles,
  Check,
  X,
  Play,
  Lightbulb,
  BookOpen,
  Lightbulb as Bulb,
  SkipForward,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SYNTAX_CHIP, SYNTAX_TEXT, classifyWord, type SyntaxCategory } from './syntaxColors';
import type { Quest } from './questData';

interface ImModuleProps {
  quest: Quest;
  onBack: () => void;
  onComplete: () => void;
}

type Stage = 'learn' | 'speak' | 'write';

interface VocabCard {
  word: string;
  emoji: string;
  phonetic: string;
  definition: string;
}

const VOCAB: VocabCard[] = [
  { word: 'happy', emoji: '😀', phonetic: '/ˈhæp.i/', definition: 'feeling good or joyful' },
  { word: 'tired', emoji: '😪', phonetic: '/ˈtaɪərd/', definition: 'needing rest or sleep' },
  { word: 'hungry', emoji: '🍔', phonetic: '/ˈhʌŋɡri/', definition: 'needing food' },
];

function speak(text: string, rate = 0.9) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function ImModule({ quest, onBack, onComplete }: ImModuleProps) {
  const [stage, setStage] = useState<Stage>('learn');
  const [showDescription, setShowDescription] = useState(false);

  const stageIdx = stage === 'learn' ? 0 : stage === 'speak' ? 1 : 2;
  const progress = ((stageIdx + 1) / 3) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-100 dark:bg-zinc-900 flex flex-col overflow-hidden">
      {/* Purple header */}
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-6 py-3 flex items-center gap-4 shadow-lg">
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
            <span className="font-extrabold text-sm">{stageIdx + 1}</span>
            <div className="w-16 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: `${progress}%` }} />
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

      {/* Course description control */}
      <div className="bg-white dark:bg-card border-b border-border px-6 py-4">
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
            <ChevronDown
              className={cn('w-4 h-4 transition-transform', showDescription && 'rotate-180')}
            />
          </button>
          <button
            onClick={() => {
              if (stage === 'learn') setStage('speak');
              else if (stage === 'speak') setStage('write');
              else onComplete();
            }}
            className="w-9 h-9 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center transition"
            aria-label="Próximo"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

<<<<<<< HEAD
=======
        {/* Course description control */}
        <div className="max-w-4xl mx-auto mt-3 flex items-center justify-center gap-2">
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
            <ChevronDown
              className={cn('w-4 h-4 transition-transform', showDescription && 'rotate-180')}
            />
          </button>
          <button
            onClick={() => {
              if (stage === 'learn') setStage('speak');
              else if (stage === 'speak') setStage('write');
              else onComplete();
            }}
            className="w-9 h-9 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center transition"
            aria-label="Próximo"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

>>>>>>> 225b28a3569d7ce17cbf9b4270fc1e661659890c
        {showDescription && (
          <div className="max-w-4xl mx-auto mt-3 rounded-xl border border-border bg-muted/40 p-4 animate-in fade-in slide-in-from-top-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              {quest.title}
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {quest.meaning}
            </p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg bg-background border border-border p-3">
                <div className="font-bold text-muted-foreground uppercase tracking-widest mb-1">Fórmula</div>
                <div className="font-mono text-foreground">{quest.formula}</div>
              </div>
              <div className="rounded-lg bg-background border border-border p-3">
                <div className="font-bold text-muted-foreground uppercase tracking-widest mb-1">Etapas</div>
                <div className="text-foreground">Learn › Speak › Write</div>
              </div>
              <div className="rounded-lg bg-background border border-border p-3">
                <div className="font-bold text-muted-foreground uppercase tracking-widest mb-1">Dica</div>
                <div className="text-foreground line-clamp-2">{quest.toneNote}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_1fr] gap-4 p-4 overflow-hidden">
        <TheoryPanel quest={quest} />

        <div className="min-h-0 overflow-auto">
          {stage === 'learn' && <LearnStage onNext={() => setStage('speak')} />}
          {stage === 'speak' && <SpeakStage onNext={() => setStage('write')} />}
          {stage === 'write' && <WriteStage onComplete={onComplete} />}
        </div>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  sub,
  active,
  done,
}: {
  n: number;
  title: string;
  sub: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold',
          active && 'bg-violet-500 text-white',
          done && 'bg-violet-500 text-white',
          !active && !done && 'bg-zinc-200 text-zinc-500',
        )}
      >
        {done ? <Check className="w-4 h-4" /> : n}
      </div>
      <div>
        <div className={cn('text-sm font-bold', active ? 'text-violet-600' : 'text-foreground')}>
          {n}. {title}
        </div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

function TheoryPanel({ quest }: { quest: Quest }) {
  return (
    <div className="bg-white dark:bg-card rounded-xl border border-border p-5 overflow-y-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-bold">
        <BookOpen className="w-3.5 h-3.5" /> Lesson
      </div>
      <h1 className="text-3xl font-extrabold text-foreground mt-3">{quest.title}</h1>
      <p className="text-xs text-muted-foreground mt-1">{quest.meaning}</p>

      <div className="mt-4 p-3 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30">
        <div className="text-[10px] font-bold text-violet-600 dark:text-violet-300 uppercase tracking-widest">Fórmula</div>
        <div className="text-sm font-bold text-foreground mt-1 font-mono">{quest.formula}</div>
      </div>

      <div className="mt-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Vocabulary</div>
        <div className="flex flex-wrap gap-1.5">
          {VOCAB.map((v) => (
            <span key={v.word} className="px-2.5 py-1 rounded-md text-xs font-mono bg-sky-100 text-sky-700 border border-sky-200">
              {v.word}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Real Use</div>
        <ul className="space-y-1.5">
          {quest.usage.map((s) => (
            <li key={s} className="text-sm font-mono text-foreground bg-muted/50 px-2.5 py-1.5 rounded">{s}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
        <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-200">{quest.toneNote}</p>
      </div>
    </div>
  );
}

function VocabCardGrid({ withSpeakBtn }: { withSpeakBtn?: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {VOCAB.map((v) => (
        <div key={v.word} className="bg-white dark:bg-card rounded-xl border border-border p-5 flex flex-col items-center text-center shadow-sm">
          <div className="text-7xl mb-3">{v.emoji}</div>
          <div className="text-2xl font-extrabold text-foreground">{v.word}</div>
          <div className="text-xs text-muted-foreground font-mono mt-1">{v.phonetic}</div>
          <div className="text-xs text-muted-foreground mt-1">{v.definition}</div>
          {withSpeakBtn ? (
            <Button
              variant="outline"
              className="mt-4 w-full border-violet-200 text-violet-600 hover:bg-violet-50 gap-2"
              onClick={() => speak(v.word, 0.85)}
            >
              <Mic className="w-4 h-4" /> Speak
            </Button>
          ) : (
            <button
              onClick={() => speak(v.word, 0.85)}
              className="mt-4 w-9 h-9 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center hover:bg-violet-200 transition"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
          {withSpeakBtn && (
            <div className="mt-2 w-full text-xs text-muted-foreground bg-violet-50 dark:bg-violet-500/10 rounded p-2">
              <span className="font-bold">Tip:</span> Say it like the audio
              <button
                onClick={() => speak(v.word, 0.85)}
                className="mx-auto mt-1 w-7 h-7 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center hover:bg-violet-200 transition"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function LearnStage({ onNext }: { onNext: () => void }) {
  return (
    <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
      <h2 className="text-xl font-extrabold text-foreground">Step 1 of 3: Learn</h2>
      <p className="text-sm text-muted-foreground mt-1">Listen to the words and repeat in your head.</p>

      <div className="mt-5">
        <VocabCardGrid />
      </div>

      <div className="flex justify-center mt-6">
        <Button onClick={onNext} className="bg-violet-500 hover:bg-violet-600 text-white font-bold gap-2">
          Next: Speak <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 flex items-start gap-2">
        <Bulb className="w-4 h-4 text-violet-500 mt-0.5" />
        <div>
          <div className="text-sm font-bold text-violet-700 dark:text-violet-200">Did you know?</div>
          <div className="text-xs text-violet-700 dark:text-violet-200">Building vocabulary is the first step to speaking fluently!</div>
        </div>
      </div>
    </div>
  );
}

function SpeakStage({ onNext }: { onNext: () => void }) {
  return (
    <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
      <h2 className="text-xl font-extrabold text-foreground">Step 2 of 3: Speak</h2>
      <p className="text-sm text-muted-foreground mt-1">Listen to the word and say it out loud.</p>

      <div className="mt-5">
        <VocabCardGrid withSpeakBtn />
      </div>

      <div className="flex justify-center mt-6">
        <Button onClick={onNext} className="bg-violet-500 hover:bg-violet-600 text-white font-bold gap-2">
          Next: Write <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 flex items-start gap-2">
        <Bulb className="w-4 h-4 text-violet-500 mt-0.5" />
        <div>
          <div className="text-sm font-bold text-violet-700 dark:text-violet-200">Remember!</div>
          <div className="text-xs text-violet-700 dark:text-violet-200">Practice speaking helps you become more confident in real conversations.</div>
        </div>
      </div>
    </div>
  );
}

const ACCEPTED = VOCAB.map((v) => v.word.toLowerCase());

function WriteStage({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<{ text: string; ok: boolean }[]>([]);
  const [draft, setDraft] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [hint, setHint] = useState(false);

  const suggestions = useMemo(() => ['happy', 'run', 'apple'], []);
  const totalLines = 3;

  const handleCheck = () => {
    const value = draft.trim().toLowerCase().replace(/\.$/, '');
    const m = value.match(/^i'?m (.+)$/);
    if (!m) {
      setFeedback({ ok: false, msg: '> Syntax Error: a frase deve começar com "I\'m ..."' });
      return;
    }
    const tail = m[1].trim();
    if (!ACCEPTED.includes(tail)) {
      setFeedback({ ok: false, msg: `> Syntax Error: "${tail}" não é um sentimento válido. Tente: ${ACCEPTED.join(', ')}` });
      return;
    }
    const final = `I'm ${tail}.`;
    speak(final);
    setLines((ls) => [...ls, { text: final, ok: true }]);
    setDraft('');
    setFeedback({ ok: true, msg: `> Correct Syntax!  "${final}"   +10 XP  +5 coins` });
    setHint(false);
  };

  const renderLine = (text: string) => {
    return text.split(/(\s+)/).map((tok, i) => {
      const clean = tok.trim().toLowerCase().replace(/[.,!?]/g, '');
      let cat: SyntaxCategory = 'plain';
      if (clean === "i'm") cat = 'pronoun';
      else if (clean) cat = classifyWord(tok);
      return (
        <span key={i} className={cn(SYNTAX_TEXT[cat], 'whitespace-pre')}>
          {tok}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <span className="ml-3 text-xs text-zinc-400 font-mono">syntax.en</span>
        </div>
        <div className="text-[10px] text-zinc-500 font-mono">line {Math.min(lines.length + 1, totalLines)} / {totalLines}</div>
      </div>

      <div className="flex-1 font-mono text-sm bg-zinc-950 p-4 overflow-auto min-h-[280px]">
        {lines.map((l, i) => (
          <div key={i} className="flex items-start gap-4 py-1 min-h-[28px]">
            <span className="text-zinc-600 select-none w-5 text-right">{i + 1}</span>
            <div className="flex-1 flex items-center flex-wrap gap-y-1">
              {renderLine(l.text)}
              <span className="ml-2 text-emerald-500">✓</span>
            </div>
          </div>
        ))}
        <div className="flex items-start gap-4 py-1 min-h-[28px]">
          <span className="text-violet-400 select-none w-5 text-right">{lines.length + 1}</span>
          <div className="flex-1 flex items-center">
            <span className={cn(SYNTAX_TEXT.pronoun, 'mr-1')}>I'm</span>
            <input
              autoFocus
              value={draft}
              onChange={(e) => { setDraft(e.target.value); setFeedback(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCheck(); } }}
              placeholder="____"
              className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-600 font-mono border-b border-dashed border-zinc-700"
            />
            <span className="text-zinc-300 ml-1">.</span>
          </div>
        </div>
        {Array.from({ length: Math.max(0, totalLines - lines.length - 1) }).map((_, i) => (
          <div key={`blank-${i}`} className="flex items-start gap-4 py-1 min-h-[28px]">
            <span className="text-zinc-700 select-none w-5 text-right">{lines.length + 2 + i}</span>
          </div>
        ))}
      </div>

      <div className="px-4 py-2.5 bg-zinc-900 border-t border-zinc-800 flex flex-wrap gap-2">
        {suggestions.map((w) => {
          const cat: SyntaxCategory = classifyWord(w);
          return (
            <button
              key={w}
              onClick={() => setDraft(w)}
              className={cn('px-3 py-1 rounded-md border font-mono text-xs hover:scale-105 transition', SYNTAX_CHIP[cat])}
            >
              {w}
            </button>
          );
        })}
      </div>

      <div className="px-4 py-3 bg-black border-t border-zinc-800 font-mono text-xs min-h-[48px]">
        {feedback ? (
          <div className={cn(feedback.ok ? 'text-emerald-400' : 'text-rose-400')}>{feedback.msg}</div>
        ) : hint ? (
          <div className="text-amber-300">{`> hint: digite I'm + (happy, tired ou hungry). Enter para validar.`}</div>
        ) : (
          <div className="text-zinc-500">{`> Syntax Module Loaded — pick a word and Check Syntax`}</div>
        )}
      </div>

      <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 flex flex-wrap items-center gap-2">
        <Button onClick={handleCheck} disabled={!draft.trim()} className="bg-amber-400 hover:bg-amber-500 text-black font-bold gap-2">
          <Play className="w-4 h-4" /> Check Syntax
        </Button>
        <Button variant="outline" onClick={() => setHint((s) => !s)} className="bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700 gap-2">
          <Lightbulb className="w-4 h-4" /> Hint
        </Button>
        <Button
          variant="outline"
          onClick={() => speak(draft ? `I'm ${draft}` : "I'm happy")}
          className="bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700 gap-2"
        >
          <Volume2 className="w-4 h-4" /> Speak
        </Button>
        <Button
          variant="ghost"
          onClick={onComplete}
          className="ml-auto text-zinc-300 hover:text-white hover:bg-zinc-800 gap-2"
        >
          <SkipForward className="w-4 h-4" /> Skip
        </Button>
        <Button
          onClick={onComplete}
          disabled={lines.length < 1}
          className="bg-violet-500 hover:bg-violet-600 text-white font-bold gap-2"
        >
          Concluir <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

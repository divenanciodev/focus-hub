import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Volume2, Mic, Sparkles, Check, X, Play, Lightbulb, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SYNTAX_CHIP, SYNTAX_TEXT, classifyWord, type SyntaxCategory } from './syntaxColors';
import type { Quest } from './questData';

interface ImGoodAtModuleProps {
  quest: Quest;
  onBack: () => void;
  onComplete: () => void;
}

type Stage = 'vocab' | 'speaking' | 'syntax';

interface VocabCard {
  word: string;
  type: 'noun' | 'verb_ing';
  emoji: string;
  phonetic: string;
  pronunciation_pt: string;
  translation: string;
}

const VOCAB: VocabCard[] = [
  { word: 'math', type: 'noun', emoji: '➗', phonetic: '/mæθ/', pronunciation_pt: 'méth', translation: 'matemática' },
  { word: 'chess', type: 'noun', emoji: '♟️', phonetic: '/tʃes/', pronunciation_pt: 'tchéss', translation: 'xadrez' },
  { word: 'sports', type: 'noun', emoji: '⚽', phonetic: '/spɔːrts/', pronunciation_pt: 'spórts', translation: 'esportes' },
  { word: 'drawing', type: 'verb_ing', emoji: '✏️', phonetic: '/ˈdrɔː.ɪŋ/', pronunciation_pt: 'dró-in', translation: 'desenhar' },
  { word: 'dancing', type: 'verb_ing', emoji: '💃', phonetic: '/ˈdæn.sɪŋ/', pronunciation_pt: 'dén-sing', translation: 'dançar' },
  { word: 'swimming', type: 'verb_ing', emoji: '🏊', phonetic: '/ˈswɪm.ɪŋ/', pronunciation_pt: 'suí-min', translation: 'nadar' },
  { word: 'reading', type: 'verb_ing', emoji: '📖', phonetic: '/ˈriː.dɪŋ/', pronunciation_pt: 'rí-din', translation: 'ler' },
  { word: 'writing', type: 'verb_ing', emoji: '✍️', phonetic: '/ˈraɪ.tɪŋ/', pronunciation_pt: 'rái-tin', translation: 'escrever' },
];

function speak(text: string, rate = 0.9) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function ImGoodAtModule({ quest, onBack, onComplete }: ImGoodAtModuleProps) {
  const [stage, setStage] = useState<Stage>('vocab');
  const [vocabIdx, setVocabIdx] = useState(0);
  const [speakIdx, setSpeakIdx] = useState(0);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-100 dark:bg-zinc-900 flex flex-col">
      {/* Purple header — same identity as QuestLesson */}
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-6 py-4 flex items-center gap-4 shadow-lg">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white text-violet-600 flex items-center justify-center shadow-md hover:scale-105 transition"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-white">
          <div className="text-xs font-bold uppercase tracking-widest text-white/80">
            Quest · {quest.shortTitle}
          </div>
          <div className="text-lg font-extrabold">{quest.title}</div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-white/90 text-xs font-mono">
          <StageDot active={stage === 'vocab'} label="vocab" />
          <span>›</span>
          <StageDot active={stage === 'speaking'} label="speak" />
          <span>›</span>
          <StageDot active={stage === 'syntax'} label="syntax" />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-4 p-4 overflow-hidden">
        {/* Theory panel — always visible */}
        <TheoryPanel quest={quest} />

        {/* Right side — switches by stage */}
        <div className="min-h-0 overflow-hidden">
          {stage === 'vocab' && (
            <VocabStage
              idx={vocabIdx}
              onPrev={() => setVocabIdx((i) => Math.max(0, i - 1))}
              onNext={() => {
                if (vocabIdx + 1 >= VOCAB.length) {
                  setSpeakIdx(0);
                  setStage('speaking');
                } else {
                  setVocabIdx((i) => i + 1);
                }
              }}
            />
          )}
          {stage === 'speaking' && (
            <SpeakingStage
              idx={speakIdx}
              onPrev={() => setSpeakIdx((i) => Math.max(0, i - 1))}
              onNext={() => {
                if (speakIdx + 1 >= VOCAB.length) {
                  setStage('syntax');
                } else {
                  setSpeakIdx((i) => i + 1);
                }
              }}
            />
          )}
          {stage === 'syntax' && <SyntaxStage onComplete={onComplete} />}
        </div>
      </div>
    </div>
  );
}

function StageDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={cn('px-2 py-0.5 rounded-full', active ? 'bg-white text-violet-700 font-bold' : 'text-white/70')}>
      {label}
    </span>
  );
}

function TheoryPanel({ quest }: { quest: Quest }) {
  return (
    <div className="bg-white dark:bg-card rounded-xl border border-border p-6 overflow-y-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-bold">
        <BookOpen className="w-3.5 h-3.5" /> Lição
      </div>
      <h1 className="text-3xl font-extrabold text-foreground mt-4">{quest.title}</h1>
      <p className="text-sm text-muted-foreground mt-1">I am good at = Eu sou bom/boa em</p>

      <div className="mt-5 p-3 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30">
        <div className="text-xs font-bold text-violet-600 dark:text-violet-300 uppercase tracking-wider">Estrutura</div>
        <div className="text-base font-bold text-foreground mt-1 font-mono">{quest.formula}</div>
      </div>

      <div className="mt-4">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Como funciona</div>
        <p className="text-sm text-foreground">Use <strong>good at</strong> para falar de algo que você faz bem.</p>
      </div>

      <div className="mt-4">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Tipos após "at"</div>
        <ul className="text-sm space-y-1 text-foreground list-disc pl-5">
          <li>Substantivos: <em>math, chess, sports</em></li>
          <li>Verbos com -ing: <em>drawing, swimming, dancing</em></li>
          <li>Áreas gerais: <em>video games, writing</em></li>
        </ul>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
        <div className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-1">Regra</div>
        <p className="text-xs text-amber-700 dark:text-amber-200">Após verbos, use geralmente <strong>verbo + ing</strong>.</p>
      </div>

      <div className="mt-5">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Exemplos</div>
        <ul className="space-y-1.5">
          {quest.usage.map((s) => (
            <li key={s} className="text-sm font-mono text-foreground bg-muted/50 px-2.5 py-1.5 rounded">{s}</li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex items-start gap-2 p-3 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30">
        <Sparkles className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-violet-700 dark:text-violet-200">Primeiro aprenda vocabulário, depois monte frases.</p>
      </div>
    </div>
  );
}

function VocabCardView({ card, total, idx }: { card: VocabCard; total: number; idx: number }) {
  const cat: SyntaxCategory = card.type === 'verb_ing' ? 'action' : 'plain';
  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <span className="ml-3 text-xs text-zinc-400 font-mono">vocab.en</span>
        </div>
        <div className="text-[10px] text-zinc-500 font-mono">card {idx + 1} / {total}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-5">
        <div className="text-8xl">{card.emoji}</div>
        <div className={cn('text-5xl font-extrabold font-mono', SYNTAX_TEXT[cat])}>{card.word}</div>
        <div className="flex flex-col items-center gap-1">
          <span className={cn('px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold border', SYNTAX_CHIP[cat])}>
            {card.type === 'verb_ing' ? 'verb + ing' : 'noun'}
          </span>
          <div className="text-zinc-400 font-mono text-sm mt-1">{card.phonetic}</div>
          <div className="text-zinc-500 text-xs italic">"{card.pronunciation_pt}"</div>
          <div className="text-zinc-300 text-sm mt-2">→ {card.translation}</div>
        </div>
        <Button
          onClick={() => speak(card.word, 0.85)}
          className="bg-violet-500 hover:bg-violet-600 text-white font-bold gap-2 mt-2"
        >
          <Volume2 className="w-4 h-4" /> Ouvir
        </Button>
      </div>
    </div>
  );
}

function VocabStage({ idx, onPrev, onNext }: { idx: number; onPrev: () => void; onNext: () => void }) {
  const card = VOCAB[idx];
  return (
    <div className="flex flex-col h-full gap-3">
      <VocabCardView card={card} total={VOCAB.length} idx={idx} />
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled={idx === 0}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Anterior
        </Button>
        <Button onClick={onNext} className="bg-amber-400 hover:bg-amber-500 text-black font-bold">
          {idx + 1 >= VOCAB.length ? 'Ir para Speaking' : 'Próximo'} <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function SpeakingStage({ idx, onPrev, onNext }: { idx: number; onPrev: () => void; onNext: () => void }) {
  const card = VOCAB[idx];
  const [feedback, setFeedback] = useState<'good' | 'try' | null>(null);
  const [recording, setRecording] = useState(false);

  const handleMic = () => {
    setRecording(true);
    setFeedback(null);
    // simulated capture — real STT would replace this; we just give positive feedback
    setTimeout(() => {
      setRecording(false);
      setFeedback(Math.random() > 0.15 ? 'good' : 'try');
    }, 1400);
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <VocabCardView card={card} total={VOCAB.length} idx={idx} />

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 flex items-center justify-center gap-4">
        <Button
          onClick={() => speak(card.word, 0.85)}
          variant="outline"
          className="bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700 gap-2"
        >
          <Volume2 className="w-4 h-4" /> Ouvir
        </Button>
        <button
          onClick={handleMic}
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-transform',
            recording ? 'bg-rose-500 animate-pulse scale-110' : 'bg-violet-500 hover:scale-105',
          )}
          aria-label="Gravar pronúncia"
        >
          <Mic className="w-7 h-7 text-white" />
        </button>
        <div className="min-w-[120px] text-sm font-bold">
          {feedback === 'good' && (
            <span className="text-emerald-400 inline-flex items-center gap-1"><Check className="w-4 h-4" /> Good!</span>
          )}
          {feedback === 'try' && (
            <span className="text-amber-400 inline-flex items-center gap-1"><X className="w-4 h-4" /> Try again</span>
          )}
          {!feedback && !recording && <span className="text-zinc-500">Repita a palavra</span>}
          {recording && <span className="text-zinc-300">Ouvindo...</span>}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled={idx === 0}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Anterior
        </Button>
        <Button onClick={onNext} className="bg-amber-400 hover:bg-amber-500 text-black font-bold">
          {idx + 1 >= VOCAB.length ? 'Ir para Syntax' : 'Próximo'} <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

interface SyntaxLine {
  text: string;
  ok: boolean;
}

const ACCEPTED_TAILS = VOCAB.map((v) => v.word.toLowerCase());

function SyntaxStage({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<SyntaxLine[]>([]);
  const [draft, setDraft] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [hint, setHint] = useState(false);

  const suggestions = useMemo(() => VOCAB.map((v) => v.word), []);

  const handleCheck = () => {
    const value = draft.trim().toLowerCase().replace(/\.$/, '');
    const m = value.match(/^i'?m good at (.+)$/);
    if (!m) {
      setFeedback({ ok: false, msg: '> Syntax Error: a frase deve começar com "I\'m good at ..."' });
      return;
    }
    const tail = m[1].trim();
    if (!ACCEPTED_TAILS.includes(tail)) {
      setFeedback({
        ok: false,
        msg: `> Syntax Error: "${tail}" não está no vocabulário. Tente: ${ACCEPTED_TAILS.slice(0, 4).join(', ')}...`,
      });
      return;
    }
    const final = `I'm good at ${tail}.`;
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
      else if (clean === 'good' || clean === 'at') cat = 'verb';
      else if (clean.endsWith('ing') && clean.length > 4) cat = 'action';
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
          <span className="ml-3 text-xs text-zinc-400 font-mono">syntax.en — good_at.js</span>
        </div>
        <div className="text-[10px] text-zinc-500 font-mono">{lines.length} line{lines.length === 1 ? '' : 's'}</div>
      </div>

      {/* Editor body — only shows created lines + active draft line */}
      <div className="flex-1 font-mono text-sm bg-zinc-950 p-4 overflow-auto">
        {lines.map((l, i) => (
          <div key={i} className="flex items-start gap-4 py-1 min-h-[28px]">
            <span className="text-zinc-600 select-none w-5 text-right">{i + 1}</span>
            <div className="flex-1 flex items-center flex-wrap gap-y-1">
              {renderLine(l.text)}
              <span className="ml-2 text-emerald-500">✓</span>
            </div>
          </div>
        ))}
        {/* Active draft line */}
        <div className="flex items-start gap-4 py-1 min-h-[28px]">
          <span className="text-violet-400 select-none w-5 text-right">{lines.length + 1}</span>
          <div className="flex-1 flex items-center">
            <input
              autoFocus
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setFeedback(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCheck();
                }
              }}
              placeholder="I'm good at ____."
              className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-600 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Suggestions (autocomplete from learned vocab) */}
      <div className="px-4 py-2.5 bg-zinc-900 border-t border-zinc-800 flex flex-wrap gap-2">
        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mr-1 self-center">vocab</span>
        {suggestions.map((w) => {
          const cat: SyntaxCategory = w.endsWith('ing') ? 'action' : 'plain';
          return (
            <button
              key={w}
              onClick={() => setDraft((d) => (d.trim().length ? `${d.replace(/\s*$/, '')} ${w}` : `I'm good at ${w}`))}
              className={cn('px-3 py-1 rounded-md border font-mono text-xs hover:scale-105 transition', SYNTAX_CHIP[cat])}
            >
              {w}
            </button>
          );
        })}
      </div>

      {/* Console */}
      <div className="px-4 py-3 bg-black border-t border-zinc-800 font-mono text-xs min-h-[64px]">
        {feedback ? (
          <div className={cn(feedback.ok ? 'text-emerald-400' : 'text-rose-400')}>{feedback.msg}</div>
        ) : hint ? (
          <div className="text-amber-300">{`> hint: digite I'm good at + (uma palavra do vocabulário). Enter para validar.`}</div>
        ) : (
          <div className="text-zinc-500">{`> Syntax Module — escreva sua frase e pressione Enter`}</div>
        )}
      </div>

      {/* Action bar */}
      <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 flex flex-wrap items-center gap-2">
        <Button onClick={handleCheck} disabled={!draft.trim()} className="bg-amber-400 hover:bg-amber-500 text-black font-bold gap-2">
          <Play className="w-4 h-4" /> Check Syntax
        </Button>
        <Button variant="outline" onClick={() => setHint((s) => !s)} className="bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700 gap-2">
          <Lightbulb className="w-4 h-4" /> Hint
        </Button>
        <Button
          variant="outline"
          onClick={() => speak(draft || "I'm good at drawing")}
          className="bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700 gap-2"
        >
          <Volume2 className="w-4 h-4" /> Speak
        </Button>
        <Button
          onClick={onComplete}
          disabled={lines.length < 2}
          className="ml-auto bg-violet-500 hover:bg-violet-600 text-white font-bold gap-2"
        >
          Concluir Quest <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
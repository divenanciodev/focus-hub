import type { SyntaxCategory } from './syntaxColors';

export interface ExerciseStep {
  prompt: string;            // e.g. "I'm ____."
  blank: string;             // correct answer, e.g. "happy"
  options: string[];         // multiple choice
  hint: string;
  category: SyntaxCategory;  // expected category for the blank
}

export interface ChallengeStep {
  promptEmoji: string;
  promptLabel: string;       // e.g. "sleepy person"
  expected: string;          // e.g. "I'm tired"
  pieces: string[];          // shuffled pool of word chips
}

export interface Quest {
  id: string;
  title: string;             // e.g. "I'm + feeling"
  shortTitle: string;        // for the map node, e.g. "I'm"
  meaning: string;
  formula: string;
  vocabulary: string[];
  toneNote: string;
  usage: string[];           // example sentences
  exercises: ExerciseStep[];
  challenge: ChallengeStep;
  xpReward: number;
  coinReward: number;
  unlocksSyntax?: { word: string; cat: SyntaxCategory };
  isBoss?: boolean;
}

export interface QuestWorld {
  id: string;
  title: string;
  subtitle: string;
  quests: Quest[];
  comingSoon?: boolean;
}

export const WORLDS: QuestWorld[] = [
  {
    id: 'self-mode',
    title: 'Estruturas em Inglês I',
    subtitle: 'Self Mode',
    quests: [
      {
        id: 'im',
        shortTitle: "I'm",
        title: "I'm",
        meaning: "I am = Eu sou / Eu estou",
        formula: "I'm + feeling / description / action",
        vocabulary: ['happy', 'tired', 'hungry'],
        toneNote: 'Foque em comunicar primeiro, gramática perfeita depois.',
        usage: ["I'm happy", "I'm tired", "I'm hungry"],
        exercises: [
          { prompt: "I'm ____.", blank: 'happy', options: ['happy', 'run', 'apple'], hint: 'Escolha um sentimento.', category: 'feeling' },
          { prompt: "I'm ____.", blank: 'tired', options: ['table', 'tired', 'blue'], hint: 'Como você se sente após uma maratona?', category: 'feeling' },
          { prompt: "I'm ____.", blank: 'hungry', options: ['hungry', 'window', 'green'], hint: 'Você quer comida.', category: 'feeling' },
        ],
        challenge: {
          promptEmoji: '😴',
          promptLabel: 'sleepy person',
          expected: "I'm tired",
          pieces: ["I'm", 'tired', 'happy', 'apple'],
        },
        xpReward: 30,
        coinReward: 10,
        unlocksSyntax: { word: "I'm", cat: 'pronoun' },
      },
      {
        id: 'im-feeling',
        shortTitle: 'feeling',
        title: "I'm + feeling",
        meaning: 'Expressar emoções e estados.',
        formula: "I'm + (feeling word)",
        vocabulary: ['excited', 'bored', 'nervous', 'fine'],
        toneNote: 'Sentimentos são adjetivos — sem -ing aqui.',
        usage: ["I'm excited", "I'm bored", "I'm fine"],
        exercises: [
          { prompt: "I'm ____.", blank: 'excited', options: ['excited', 'eat', 'chair'], hint: 'Animado para algo.', category: 'feeling' },
          { prompt: "I'm ____.", blank: 'bored', options: ['bored', 'door', 'run'], hint: 'Sem nada para fazer.', category: 'feeling' },
        ],
        challenge: {
          promptEmoji: '😟',
          promptLabel: 'nervous person',
          expected: "I'm nervous",
          pieces: ["I'm", 'nervous', 'happy', 'pizza'],
        },
        xpReward: 35,
        coinReward: 12,
        unlocksSyntax: { word: 'feeling', cat: 'feeling' },
      },
      {
        id: 'im-action',
        shortTitle: 'action',
        title: "I'm + action",
        meaning: 'Falar do que está fazendo agora.',
        formula: "I'm + verb-ing",
        vocabulary: ['eating', 'studying', 'running'],
        toneNote: 'Ações em curso usam verbo + ing.',
        usage: ["I'm eating", "I'm studying", "I'm running"],
        exercises: [
          { prompt: "I'm ____.", blank: 'studying', options: ['studying', 'study', 'student'], hint: 'Verbo no gerúndio (-ing).', category: 'action' },
          { prompt: "I'm ____.", blank: 'eating', options: ['eat', 'eating', 'ate'], hint: 'Ação acontecendo agora.', category: 'action' },
        ],
        challenge: {
          promptEmoji: '🏃',
          promptLabel: 'running person',
          expected: "I'm running",
          pieces: ["I'm", 'running', 'run', 'happy'],
        },
        xpReward: 40,
        coinReward: 15,
        unlocksSyntax: { word: 'verb-ing', cat: 'action' },
      },
      {
        id: 'im-from',
        shortTitle: 'from',
        title: "I'm + from",
        meaning: 'Dizer sua origem.',
        formula: "I'm from + (place)",
        vocabulary: ['Brazil', 'USA', 'home'],
        toneNote: 'Use o nome do país sem artigo.',
        usage: ["I'm from Brazil", "I'm from the USA"],
        exercises: [
          { prompt: "I'm from ____.", blank: 'Brazil', options: ['Brazil', 'happy', 'eating'], hint: 'Um país.', category: 'location' },
        ],
        challenge: {
          promptEmoji: '🇧🇷',
          promptLabel: 'Brazilian flag',
          expected: "I'm from Brazil",
          pieces: ["I'm", 'from', 'Brazil', 'tired'],
        },
        xpReward: 35,
        coinReward: 12,
        unlocksSyntax: { word: 'from', cat: 'location' },
      },
      {
        id: 'im-age',
        shortTitle: 'age',
        title: "I'm + age",
        meaning: 'Dizer sua idade.',
        formula: "I'm + (number) + years old",
        vocabulary: ['years', 'old'],
        toneNote: 'Boss da Seção I — junte tudo!',
        usage: ["I'm 25 years old", "I'm 18 years old"],
        exercises: [
          { prompt: "I'm 25 years ____.", blank: 'old', options: ['old', 'new', 'young'], hint: 'Expressão fixa.', category: 'plain' },
        ],
        challenge: {
          promptEmoji: '🎂',
          promptLabel: 'birthday cake',
          expected: "I'm 25 years old",
          pieces: ["I'm", '25', 'years', 'old', 'happy'],
        },
        xpReward: 60,
        coinReward: 25,
        isBoss: true,
        unlocksSyntax: { word: 'age', cat: 'plain' },
      },
      {
        id: 'im-good-at',
        shortTitle: 'good at',
        title: "I'm good at",
        meaning: 'Expressar habilidades, talentos ou áreas em que você é bom.',
        formula: "I'm good at + noun / activity / verb+ing",
        vocabulary: ['math', 'drawing', 'dancing', 'chess', 'swimming', 'reading', 'writing', 'sports'],
        toneNote: "Após 'at', use substantivo ou verbo + ing (gerúndio).",
        usage: ["I'm good at math.", "I'm good at dancing.", "I'm good at chess.", "I'm good at drawing."],
        // Custom flow handles its own steps; these are placeholders for type compat.
        exercises: [
          { prompt: "I'm good at ____.", blank: 'math', options: ['math', 'happy', 'tired'], hint: 'Uma área de estudo.', category: 'plain' },
        ],
        challenge: {
          promptEmoji: '🎨',
          promptLabel: 'someone drawing',
          expected: "I'm good at drawing",
          pieces: ["I'm", 'good', 'at', 'drawing', 'happy'],
        },
        xpReward: 50,
        coinReward: 20,
        unlocksSyntax: { word: 'good at', cat: 'plain' },
      },
    ],
  },
  {
    id: 'action-mode',
    title: 'Estruturas em Inglês II',
    subtitle: 'Action Mode',
    quests: [],
    comingSoon: true,
  },
  {
    id: 'internet-mode',
    title: 'Estruturas em Inglês III',
    subtitle: 'Internet Mode',
    quests: [],
    comingSoon: true,
  },
];
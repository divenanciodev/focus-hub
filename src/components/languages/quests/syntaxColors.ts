export type SyntaxCategory =
  | 'pronoun'
  | 'verb'
  | 'feeling'
  | 'action'
  | 'location'
  | 'question'
  | 'plain';

// Tailwind text colors per category. Background variants are derived in components.
export const SYNTAX_TEXT: Record<SyntaxCategory, string> = {
  pronoun: 'text-violet-400',
  verb: 'text-emerald-400',
  feeling: 'text-sky-400',
  action: 'text-amber-300',
  location: 'text-orange-400',
  question: 'text-pink-400',
  plain: 'text-zinc-200',
};

export const SYNTAX_CHIP: Record<SyntaxCategory, string> = {
  pronoun: 'bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/30',
  verb: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
  feeling: 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30',
  action: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
  location: 'bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-500/30',
  question: 'bg-pink-500/15 text-pink-600 dark:text-pink-300 border-pink-500/30',
  plain: 'bg-muted text-foreground border-border',
};

const PRONOUNS = new Set(['i', 'you', 'he', 'she', 'we', 'they', 'it', "i'm"]);
const VERBS = new Set(['am', 'is', 'are', "'m", "'s", "'re"]);
const FEELINGS = new Set([
  'happy', 'tired', 'hungry', 'sad', 'angry', 'bored', 'excited', 'nervous',
  'sleepy', 'thirsty', 'cold', 'hot', 'fine', 'good', 'great', 'okay',
]);
const LOCATIONS = new Set(['from', 'at', 'in', 'home', 'work', 'school', 'brazil', 'usa']);
const QUESTIONS = new Set(['what', 'where', 'who', 'how', 'why', 'when', '?']);

export function classifyWord(raw: string): SyntaxCategory {
  const w = raw.toLowerCase().replace(/[.,!?]/g, '');
  if (!w) return 'plain';
  if (PRONOUNS.has(w)) return 'pronoun';
  if (VERBS.has(w)) return 'verb';
  if (FEELINGS.has(w)) return 'feeling';
  if (LOCATIONS.has(w)) return 'location';
  if (QUESTIONS.has(w)) return 'question';
  if (w.endsWith('ing') && w.length > 4) return 'action';
  return 'plain';
}

export function classifyTokens(text: string): { word: string; cat: SyntaxCategory }[] {
  return text.split(/(\s+)/).map((token) => {
    if (/^\s+$/.test(token)) return { word: token, cat: 'plain' as SyntaxCategory };
    return { word: token, cat: classifyWord(token) };
  });
}
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Play, Plus, ThumbsUp, ChevronLeft, ChevronRight,
  X, Volume2, VolumeX, Info, Star, Clock, BookOpen, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ── TYPES ── */
type Level = 'Beginner' | 'Intermediate' | 'Advanced';
type Episode = {
  id: string; number: number; title: string; duration: string;
  description: string; thumbnail: string; level: Level;
  watched: boolean; progress: number; vocabulary: string[];
};
type Series = {
  id: string; title: string; description: string; longDescription: string;
  thumbnail: string; backdrop: string; level: Level; category: string;
  rating: number; seasons: number; episodes: Episode[]; tags: string[]; year: number;
};

/* ── DATA ── */
const SERIES: Series[] = [
  {
    id: 's1', title: 'Daily Conversations', year: 2024, rating: 4.8, seasons: 2,
    category: 'Speaking', level: 'Beginner', tags: ['Speaking', 'Everyday'],
    thumbnail: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&q=80',
    backdrop: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&q=80',
    description: 'Master everyday English through real-life dialogues.',
    longDescription: 'Learn how native speakers communicate in real situations — at work, restaurants, airports, and more. Each episode focuses on practical vocabulary and natural expressions.',
    episodes: [
      { id: 'e1', number: 1, title: 'At the Coffee Shop', duration: '8 min', description: 'Order coffee and make small talk like a native.', thumbnail: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=300&q=80', level: 'Beginner', watched: true, progress: 100, vocabulary: ['latte', 'to-go', 'barista', 'decaf'] },
      { id: 'e2', number: 2, title: 'Meeting New People', duration: '10 min', description: 'Introduce yourself confidently at social events.', thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&q=80', level: 'Beginner', watched: true, progress: 100, vocabulary: ['pleased to meet you', 'what do you do', 'originally from'] },
      { id: 'e3', number: 3, title: 'At the Supermarket', duration: '9 min', description: 'Navigate grocery shopping and ask for help finding items.', thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80', level: 'Beginner', watched: false, progress: 40, vocabulary: ['aisle', 'cashier', 'receipt', 'discount'] },
      { id: 'e4', number: 4, title: 'Catching a Taxi', duration: '7 min', description: 'Get around the city using taxis and rideshare apps.', thumbnail: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300&q=80', level: 'Beginner', watched: false, progress: 0, vocabulary: ['drop off', 'fare', 'detour', 'tip'] },
      { id: 'e5', number: 5, title: 'Booking a Hotel', duration: '11 min', description: 'Check in, ask about amenities, and handle requests.', thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=80', level: 'Beginner', watched: false, progress: 0, vocabulary: ['reservation', 'checkout', 'amenities', 'concierge'] },
    ],
  },
  {
    id: 's2', title: 'Business English Pro', year: 2024, rating: 4.9, seasons: 3,
    category: 'Business', level: 'Intermediate', tags: ['Business', 'Writing'],
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    backdrop: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
    description: 'Excel in professional environments with corporate English.',
    longDescription: 'From boardroom presentations to email writing, this series covers everything you need to sound professional and confident at work.',
    episodes: [
      { id: 'e6', number: 1, title: 'Email Etiquette', duration: '12 min', description: 'Write clear, professional emails that get responses.', thumbnail: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=300&q=80', level: 'Intermediate', watched: false, progress: 0, vocabulary: ['regarding', 'follow-up', 'cc', 'sincerely'] },
      { id: 'e7', number: 2, title: 'Leading Meetings', duration: '15 min', description: 'Chair meetings, manage discussions, and summarize decisions.', thumbnail: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=300&q=80', level: 'Intermediate', watched: false, progress: 0, vocabulary: ['agenda', 'minutes', 'adjourn', 'consensus'] },
      { id: 'e8', number: 3, title: 'Negotiation Skills', duration: '14 min', description: 'Negotiate deals and contracts with confidence.', thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300&q=80', level: 'Intermediate', watched: false, progress: 0, vocabulary: ['counter-offer', 'leverage', 'compromise', 'terms'] },
    ],
  },
  {
    id: 's3', title: 'Grammar Unlocked', year: 2023, rating: 4.7, seasons: 1,
    category: 'Grammar', level: 'Beginner', tags: ['Grammar', 'Foundations'],
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80',
    backdrop: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80',
    description: 'Finally understand English grammar through story-driven lessons.',
    longDescription: 'Say goodbye to boring grammar textbooks. Each episode uses compelling stories to make grammar rules stick naturally.',
    episodes: [
      { id: 'e9', number: 1, title: 'Past vs Present Perfect', duration: '13 min', description: 'The most confusing tenses explained simply.', thumbnail: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=300&q=80', level: 'Beginner', watched: false, progress: 0, vocabulary: ['already', 'just', 'since', 'for'] },
      { id: 'e10', number: 2, title: 'Modal Verbs', duration: '10 min', description: 'Can, could, would, should — master them all.', thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&q=80', level: 'Beginner', watched: false, progress: 0, vocabulary: ['might', 'ought to', 'shall', 'must'] },
    ],
  },
  {
    id: 's4', title: 'American Slang & Culture', year: 2024, rating: 4.6, seasons: 2,
    category: 'Culture', level: 'Advanced', tags: ['Slang', 'Idioms', 'Informal'],
    thumbnail: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400&q=80',
    backdrop: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200&q=80',
    description: 'Sound like a native with idioms, slang, and cultural references.',
    longDescription: 'Understand movies, TV shows, and real conversations with Americans. This series dives into informal language, pop culture, and regional expressions.',
    episodes: [
      { id: 'e11', number: 1, title: 'Sports Idioms', duration: '11 min', description: '"Ball is in your court" and 20 other sports-based idioms.', thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&q=80', level: 'Advanced', watched: false, progress: 0, vocabulary: ['ball park', 'touch base', 'step up', 'slam dunk'] },
      { id: 'e12', number: 2, title: 'Office Slang', duration: '9 min', description: 'The unofficial language of American workplaces.', thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80', level: 'Advanced', watched: false, progress: 0, vocabulary: ['bandwidth', 'synergy', 'circle back', 'deep dive'] },
    ],
  },
  {
    id: 's5', title: 'Pronunciation Mastery', year: 2023, rating: 4.5, seasons: 1,
    category: 'Pronunciation', level: 'Intermediate', tags: ['Pronunciation', 'Speaking'],
    thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80',
    backdrop: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=80',
    description: 'Train your ear and mouth to speak with a clear accent.',
    longDescription: 'Phonetics, stress patterns, and connected speech — this series gives you the tools to be understood clearly by any English speaker.',
    episodes: [
      { id: 'e13', number: 1, title: 'The TH Sound', duration: '8 min', description: 'Master the trickiest sound in English.', thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&q=80', level: 'Intermediate', watched: false, progress: 0, vocabulary: ['think', 'that', 'there', 'through'] },
      { id: 'e14', number: 2, title: 'Word Stress Patterns', duration: '10 min', description: 'Place stress on the right syllable every time.', thumbnail: 'https://images.unsplash.com/photo-1547451045-0ce15ac8acc9?w=300&q=80', level: 'Intermediate', watched: false, progress: 0, vocabulary: ['PERmit vs perMIT', 'REcord vs reCORD'] },
    ],
  },
];

const CATEGORIES = ['All', 'Speaking', 'Business', 'Grammar', 'Culture', 'Pronunciation'];
const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced'];

/* ── HELPERS ── */
const levelStyle: Record<Level, string> = {
  Beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Advanced: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

function LvlBadge({ level }: { level: Level }) {
  return (
    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', levelStyle[level])}>
      {level}
    </span>
  );
}

/* ── SERIES CARD ── */
function SeriesCard({ s, onClick }: { s: Series; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const done = s.episodes.filter(e => e.watched).length;
  return (
    <div className="flex-shrink-0 w-40 sm:w-44 cursor-pointer group" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}>
      <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-zinc-800">
        <img src={s.thumbnail} alt={s.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {done > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-600">
            <div className="h-full bg-red-500" style={{ width: `${(done / s.episodes.length) * 100}%` }} />
          </div>
        )}
        <div className="absolute top-2 left-2"><LvlBadge level={s.level} /></div>
        <div className={cn('absolute inset-0 flex items-center justify-center transition-opacity', hov ? 'opacity-100' : 'opacity-0')}>
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <p className="text-sm font-semibold text-white truncate">{s.title}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{s.episodes.length} ep · {s.seasons}S</p>
      </div>
    </div>
  );
}

/* ── CAROUSEL ROW ── */
function Row({ title, items, onSelect }: { title: string; items: Series[]; onSelect: (s: Series) => void }) {
  const [off, setOff] = useState(0);
  const vis = 5;
  return (
    <div className="mb-8">
      <h3 className="text-white font-bold text-base mb-3 px-6 md:px-10">{title}</h3>
      <div className="relative px-6 md:px-10">
        {off > 0 && (
          <button onClick={() => setOff(o => Math.max(0, o - 1))} className="absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-black/70 to-transparent flex items-center justify-start pl-1">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}
        <div className="flex gap-3 overflow-hidden">
          {items.slice(off, off + vis + 1).map(s => <SeriesCard key={s.id} s={s} onClick={() => onSelect(s)} />)}
        </div>
        {off + vis < items.length && (
          <button onClick={() => setOff(o => Math.min(items.length - vis, o + 1))} className="absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-black/70 to-transparent flex items-center justify-end pr-1">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── EPISODE ROW ── */
function EpItem({ ep, onPlay }: { ep: Episode; onPlay: () => void }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors" onClick={onPlay}>
      <div className="relative flex-shrink-0 w-32 rounded-md overflow-hidden aspect-video bg-zinc-800">
        <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" />
        {ep.progress > 0 && ep.progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-600"><div className="h-full bg-red-500" style={{ width: `${ep.progress}%` }} /></div>
        )}
        {ep.watched && <div className="absolute top-1 right-1"><CheckCircle2 className="w-4 h-4 text-emerald-400" /></div>}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center">
            <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-zinc-400 text-xs font-bold">{ep.number}.</span>
          <span className="text-white text-sm font-semibold truncate">{ep.title}</span>
          <LvlBadge level={ep.level} />
        </div>
        <p className="text-zinc-400 text-xs line-clamp-2">{ep.description}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-zinc-500 text-xs"><Clock className="w-3 h-3" />{ep.duration}</span>
          <span className="flex items-center gap-1 text-zinc-500 text-xs"><BookOpen className="w-3 h-3" />{ep.vocabulary.length} words</span>
        </div>
      </div>
    </div>
  );
}

/* ── SERIES DETAIL MODAL ── */
function SeriesModal({ s, onClose, onPlay }: { s: Series; onClose: () => void; onPlay: (ep: Episode) => void }) {
  const [inList, setInList] = useState(false);
  const [liked, setLiked] = useState(false);
  const nextEp = s.episodes.find(e => !e.watched) ?? s.episodes[0];
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="relative w-full sm:max-w-2xl bg-[#181818] rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="relative h-52 sm:h-64 flex-shrink-0">
          <img src={s.backdrop} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/30 to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <h2 className="text-white text-2xl font-extrabold mb-2">{s.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" className="bg-white text-black hover:bg-white/90 font-bold rounded-md px-5 h-9" onClick={() => onPlay(nextEp)}>
                <Play className="w-4 h-4 mr-1.5 fill-black" /> Play
              </Button>
              <button onClick={() => setInList(v => !v)} className={cn('w-8 h-8 rounded-full border-2 flex items-center justify-center transition', inList ? 'border-white bg-white/20' : 'border-zinc-400 hover:border-white')}>
                {inList ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
              </button>
              <button onClick={() => setLiked(v => !v)} className={cn('w-8 h-8 rounded-full border-2 flex items-center justify-center transition', liked ? 'border-purple-400 bg-purple-500/20' : 'border-zinc-400 hover:border-white')}>
                <ThumbsUp className={cn('w-4 h-4', liked ? 'text-purple-400' : 'text-white')} />
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          <div className="flex items-center gap-3 flex-wrap text-sm">
            <span className="text-emerald-400 font-bold">{s.rating} ★</span>
            <span className="text-zinc-300">{s.year}</span>
            <span className="text-zinc-300">{s.seasons} Season{s.seasons > 1 ? 's' : ''}</span>
            <LvlBadge level={s.level} />
            {s.tags.map(t => <span key={t} className="text-zinc-500 text-xs">#{t}</span>)}
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed">{s.longDescription}</p>
          <div>
            <h4 className="text-white font-bold text-base mb-1">Episodes</h4>
            <div className="divide-y divide-white/5">
              {s.episodes.map(ep => <EpItem key={ep.id} ep={ep} onPlay={() => onPlay(ep)} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── VIDEO PLAYER ── */
function VideoPlayer({ ep, s, onClose }: { ep: Episode; s: Series; onClose: () => void }) {
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(ep.progress);
  const [showVocab, setShowVocab] = useState(false);
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 flex items-center justify-center">
        <img src={ep.thumbnail} alt="" className="w-full h-full object-cover opacity-30 absolute inset-0" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/40 flex items-center justify-center cursor-pointer hover:bg-white/20 transition">
            <Play className="w-10 h-10 text-white fill-white ml-1.5" />
          </div>
          <p className="text-white/50 text-sm">Preview mode</p>
        </div>
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent z-20">
          <button onClick={onClose} className="flex items-center gap-2 text-white hover:text-white/70 transition">
            <ChevronLeft className="w-5 h-5" /><span className="text-sm font-medium">Back</span>
          </button>
          <div className="text-center">
            <p className="text-white text-sm font-bold">{s.title}</p>
            <p className="text-zinc-400 text-xs">Ep {ep.number} — {ep.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowVocab(v => !v)} className={cn('px-3 py-1.5 rounded-full text-xs font-bold border transition', showVocab ? 'bg-purple-500/30 border-purple-400 text-purple-300' : 'border-white/30 text-white/60 hover:border-white/60')}>
              <BookOpen className="w-3.5 h-3.5 inline mr-1" />Vocab
            </button>
            <button onClick={() => setMuted(v => !v)} className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white hover:border-white transition">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {/* Vocab panel */}
        {showVocab && (
          <div className="absolute right-4 top-16 w-52 bg-black/90 backdrop-blur-md rounded-xl border border-white/10 p-4 z-20">
            <p className="text-white font-bold text-sm mb-3">Key Vocabulary</p>
            <div className="space-y-1.5">
              {ep.vocabulary.map(w => (
                <div key={w} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white text-sm">{w}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/50 text-xs">0:00</span>
            <div className="flex-1 h-1.5 bg-white/20 rounded-full cursor-pointer" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setProgress(Math.round(((e.clientX - r.left) / r.width) * 100)); }}>
              <div className="h-full bg-red-500 rounded-full relative" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow" />
              </div>
            </div>
            <span className="text-white/50 text-xs">{ep.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <LvlBadge level={ep.level} />
            <span className="text-white/50 text-xs truncate">{ep.description}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── HERO BANNER ── */
function Hero({ s, onPlay, onInfo }: { s: Series; onPlay: () => void; onInfo: () => void }) {
  return (
    <div className="relative w-full h-[50vw] max-h-[460px] min-h-[280px] overflow-hidden">
      <img src={s.backdrop} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
      <div className="absolute bottom-10 left-6 md:left-10 max-w-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-500 font-extrabold text-xs tracking-widest uppercase">LearnFlix</span>
          <span className="text-zinc-400 text-xs">SERIES</span>
        </div>
        <h1 className="text-white text-3xl md:text-4xl font-extrabold mb-2 leading-tight">{s.title}</h1>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-emerald-400 font-bold text-sm">{s.rating} ★</span>
          <LvlBadge level={s.level} />
          <span className="text-zinc-300 text-sm">{s.seasons}S · {s.episodes.length} ep</span>
        </div>
        <p className="text-zinc-200 text-sm leading-relaxed mb-4 line-clamp-2">{s.description}</p>
        <div className="flex items-center gap-3">
          <Button onClick={onPlay} className="bg-white text-black hover:bg-white/90 font-bold rounded-md px-6 h-10">
            <Play className="w-4 h-4 mr-2 fill-black" /> Play
          </Button>
          <Button onClick={onInfo} variant="outline" className="border-white/40 text-white hover:bg-white/10 font-bold rounded-md px-5 h-10 bg-white/10">
            <Info className="w-4 h-4 mr-2" /> More Info
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── ROOT COMPONENT ── */
export function LearnFlix() {
  const [detail, setDetail] = useState<Series | null>(null);
  const [playing, setPlaying] = useState<{ ep: Episode; s: Series } | null>(null);
  const [catFilter, setCatFilter] = useState('All');
  const [lvlFilter, setLvlFilter] = useState<Level | 'All'>('All');
  const [search, setSearch] = useState('');

  const featured = SERIES[0];

  const filtered = SERIES.filter(s => {
    if (catFilter !== 'All' && s.category !== catFilter) return false;
    if (lvlFilter !== 'All' && s.level !== lvlFilter) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const byLevel = (lv: Level) => SERIES.filter(s => s.level === lv);
  const inProgress = SERIES.filter(s => s.episodes.some(e => e.progress > 0 && e.progress < 100));

  const play = (s: Series, ep?: Episode) => {
    const target = ep ?? s.episodes.find(e => !e.watched) ?? s.episodes[0];
    setPlaying({ ep: target, s });
    setDetail(null);
  };

  if (playing) return <VideoPlayer ep={playing.ep} s={playing.s} onClose={() => setPlaying(null)} />;

  const filtering = search || catFilter !== 'All' || lvlFilter !== 'All';

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-y-auto">
      {/* Nav */}
      <div className="sticky top-0 z-20 flex items-center gap-4 px-6 md:px-10 py-3 bg-gradient-to-b from-[#0a0a0a] to-transparent">
        <span className="text-red-500 font-extrabold text-lg tracking-tight shrink-0">LEARNFLIX</span>
        <div className="hidden md:flex items-center gap-4 text-sm text-zinc-300 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)} className={cn('hover:text-white transition font-medium', catFilter === cat && 'text-white font-bold')}>
              {cat}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5 flex-wrap">
          {(['All', ...LEVELS] as const).map(lv => (
            <button key={lv} onClick={() => setLvlFilter(lv)} className={cn('text-[11px] px-2.5 py-1 rounded-full border transition font-medium', lvlFilter === lv ? (lv === 'All' ? 'border-white text-white bg-white/10' : levelStyle[lv as Level]) : 'border-zinc-600 text-zinc-400 hover:border-zinc-400')}>
              {lv}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-6 md:px-10 pb-3 -mt-1">
        <input type="text" placeholder="Search series…" value={search} onChange={e => setSearch(e.target.value)} className="w-full max-w-xs bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition" />
      </div>

      {/* Hero (only when no filter) */}
      {!filtering && <Hero s={featured} onPlay={() => play(featured)} onInfo={() => setDetail(featured)} />}

      {/* Content */}
      {filtering ? (
        <div className="px-6 md:px-10 py-6">
          <p className="text-zinc-400 text-sm mb-4">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(s => <SeriesCard key={s.id} s={s} onClick={() => setDetail(s)} />)}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-zinc-500">
                <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No series match your filters.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="pt-6 pb-12">
          {inProgress.length > 0 && <Row title="▶ Continue Watching" items={inProgress} onSelect={setDetail} />}
          <Row title="🟢 Beginner — Start Here" items={byLevel('Beginner')} onSelect={setDetail} />
          <Row title="🟡 Intermediate — Level Up" items={byLevel('Intermediate')} onSelect={setDetail} />
          <Row title="🔴 Advanced — Master English" items={byLevel('Advanced')} onSelect={setDetail} />
          <Row title="All Series" items={SERIES} onSelect={setDetail} />
        </div>
      )}

      {/* Detail modal */}
      {detail && <SeriesModal s={detail} onClose={() => setDetail(null)} onPlay={ep => play(detail, ep)} />}
    </div>
  );
}

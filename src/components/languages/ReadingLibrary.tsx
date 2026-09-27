import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Search,
  BookOpen,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Library,
  BookMarked,
  Sparkles,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import heroBooks from '@/assets/reading-library/hero-books.png';
import heroShelf from '@/assets/reading-library/hero-shelf.png';

interface ReadingLibraryProps {
  languageName: string;
  onOpenEstante: () => void;
}

type Level = 'Iniciante' | 'Intermediário' | 'Avançado';

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  level: Level;
  badge?: 'Mais lidos' | 'Em alta' | 'Novo';
  rating: number;
  minutes: number;
  gradient: string;
  synopsis: string;
  excerpt: string;
}

const BOOKS: LibraryBook[] = [
  // ---- Série iniciação ----
  {
    id: 'little-prince',
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    level: 'Iniciante',
    badge: 'Mais lidos',
    rating: 4.8,
    minutes: 12,
    gradient: 'from-sky-500 to-indigo-600',
    synopsis:
      'A pilot crashes in the desert and meets a mysterious little boy from a tiny planet. A gentle story about friendship, love and the things that truly matter.',
    excerpt:
      'The first night, the pilot fell asleep on the sand, a thousand miles from any village.\n\n"Please... draw me a sheep," said a small voice at sunrise.\n\nHe jumped up and stared. A very small person, with golden hair, was looking at him with enormous, serious eyes.',
  },
  {
    id: 'animal-farm',
    title: 'Animal Farm',
    author: 'George Orwell',
    level: 'Iniciante',
    badge: 'Mais lidos',
    rating: 4.7,
    minutes: 15,
    gradient: 'from-red-500 to-rose-700',
    synopsis:
      'The animals of a farm chase the farmer away and decide to run the place themselves. A short, sharp classic about power — easy words, big ideas.',
    excerpt:
      'Mr. Jones, of the Manor Farm, had locked the hen-houses for the night but was too drunk to remember to shut the pop-holes.\n\nOld Major, the prize boar, called every animal together:\n\n"Man is the only creature that consumes without producing. Remove Man, and the produce of our labour would be our own."',
  },
  {
    id: 'frankenstein',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    level: 'Intermediário',
    rating: 4.6,
    minutes: 18,
    gradient: 'from-emerald-600 to-teal-800',
    synopsis:
      'A young scientist builds a living creature — and then abandons it. The Gothic classic that invented science fiction, told in clear, atmospheric English.',
    excerpt:
      'I am by birth a Genevese, and my family is one of the most distinguished of that republic.\n\nNo one can conceive the anguish I suffered during the remainder of the night, which I spent, cold and wet, in the open air.\n\nBy the dim light of the moon, I saw the dull yellow eye of the creature open; it breathed hard, and a convulsive motion agitated its limbs.',
  },
  {
    id: 'dracula',
    title: 'Dracula',
    author: 'Bram Stoker',
    level: 'Intermediário',
    rating: 4.5,
    minutes: 20,
    gradient: 'from-zinc-700 to-red-900',
    synopsis:
      'Letters, diaries and newspaper clippings tell the story of Count Dracula, who leaves his castle in the mountains for the foggy streets of London.',
    excerpt:
      '3 May. Bistritz. Left Munich at 8:35 P. M.\n\nThe impression I had was that we were leaving the West and entering the East.\n\n"Welcome to my house! Enter freely and of your own will!" The Count stopped, and I could not help noticing that as his hand touched mine, it was cold as ice — more like the hand of a dead man than a living one.',
  },
  {
    id: 'sherlock',
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    level: 'Intermediário',
    badge: 'Mais lidos',
    rating: 4.9,
    minutes: 16,
    gradient: 'from-amber-500 to-orange-700',
    synopsis:
      'Twelve short mysteries solved by the world\'s most famous detective. Perfect for reading one story at a time, in simple and elegant Victorian English.',
    excerpt:
      'To Sherlock Holmes she is always the woman.\n\n"I have heard, Mr. Holmes, that you can see what other people only look at."\n\n"You see, but you do not observe," said Holmes, lighting his pipe. "The distinction is clear. For example, you have frequently seen the steps which lead up from the hall to this room. How many are there?"',
  },
  {
    id: 'wizard-oz',
    title: 'The Wonderful Wizard of Oz',
    author: 'L. Frank Baum',
    level: 'Iniciante',
    badge: 'Novo',
    rating: 4.4,
    minutes: 14,
    gradient: 'from-fuchsia-500 to-purple-700',
    synopsis:
      'A cyclone carries Dorothy and her little dog to a magical land. With the Scarecrow, the Tin Woodman and the Lion, she walks the yellow brick road to find her way home.',
    excerpt:
      'Dorothy lived in the midst of the great Kansas prairies, with Uncle Henry and Aunt Em.\n\nThen, with a sudden rush of wind, the house whirled slowly around, round and round, into the sky.\n\n"You are welcome, most noble Sorceress, to the land of the Munchkins," said a sweet voice. "I am the Witch of the North."',
  },
  // ---- Recomendações ----
  {
    id: 'then-there-were-none',
    title: 'And Then There Were None',
    author: 'Agatha Christie',
    level: 'Intermediário',
    badge: 'Em alta',
    rating: 4.8,
    minutes: 17,
    gradient: 'from-slate-600 to-slate-900',
    synopsis:
      'Ten strangers are invited to an island. One by one, they begin to die — and nobody can leave. The best-selling mystery novel of all time.',
    excerpt:
      'The voice said: "Ladies and gentlemen! You are charged with the following crimes —"\n\nEach one of them, in turn, remembered the moment when that recording began.\n\nOutside, the sea was perfectly calm. Inside, ten people were very, very quiet.',
  },
  {
    id: 'christmas-carol',
    title: 'A Christmas Carol',
    author: 'Charles Dickens',
    level: 'Iniciante',
    rating: 4.7,
    minutes: 13,
    gradient: 'from-red-600 to-emerald-700',
    synopsis:
      'Ebenezer Scrooge hates Christmas — until three spirits show him his past, his present and his future in a single night.',
    excerpt:
      'Marley was dead: to begin with. There is no doubt whatever about that.\n\nOld Marley was as dead as a door-nail.\n\n"Bah!" said Scrooge, "Humbug!" His partner\'s ghost, dragging the chain he had forged in life, had other plans for the night.',
  },
  {
    id: 'moby-dick',
    title: 'Moby Dick',
    author: 'Herman Melville',
    level: 'Avançado',
    rating: 4.3,
    minutes: 22,
    gradient: 'from-blue-700 to-slate-900',
    synopsis:
      '"Call me Ishmael." A sailor joins the whaling ship Pequod and its captain, Ahab, who hunts one enormous white whale across the oceans.',
    excerpt:
      'Call me Ishmael. Some years ago — never mind how long precisely — having little or no money in my purse, I thought I would sail about a little and see the watery part of the world.\n\nWhenever I find myself growing grim about the mouth, I account it high time to get to sea.',
  },
  {
    id: 'red-fern',
    title: 'Where the Red Fern Grows',
    author: 'Wilson Rawls',
    level: 'Iniciante',
    badge: 'Em alta',
    rating: 4.6,
    minutes: 15,
    gradient: 'from-orange-500 to-amber-700',
    synopsis:
      'A boy in the Ozark mountains saves every coin to buy two hunting dogs, Old Dan and Little Ann. A moving story about growing up in the American countryside.',
    excerpt:
      'I sat down on an old sycamore log and thought about the two little pups I wanted more than anything on earth.\n\nIt would take fifty dollars. I had fifty cents in an old Prince Albert tobacco can.\n\nBut I had a plan. And I had two hands.',
  },
  {
    id: 'tom-sawyer',
    title: 'The Adventures of Tom Sawyer',
    author: 'Mark Twain',
    level: 'Iniciante',
    badge: 'Mais lidos',
    rating: 4.5,
    minutes: 16,
    gradient: 'from-lime-600 to-green-800',
    synopsis:
      'Tom hates school, loves adventures and knows exactly how to trick his friends into painting a fence for him. Funny, fast and full of everyday English.',
    excerpt:
      '"Tom!" No answer. "TOM!" No answer.\n\nThe old lady pulled her spectacles down and looked over them, about the room.\n\nTom had skipped school and gone swimming — and he was about to pay for it, the way boys in St. Petersburg always did: with a bucket of whitewash and a very long fence.',
  },
  {
    id: 'pride-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    level: 'Avançado',
    rating: 4.8,
    minutes: 21,
    gradient: 'from-rose-400 to-pink-700',
    synopsis:
      'Elizabeth Bennet is clever, independent and completely unimpressed by the proud, rich Mr. Darcy — which is, of course, exactly the problem.',
    excerpt:
      'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.\n\n"He is just what a young man ought to be," said Mrs. Bennet. "Sensible, good humoured, lively — and I never in my life saw such beautiful manners!"',
  },
  {
    id: 'alice',
    title: 'Alice\'s Adventures in Wonderland',
    author: 'Lewis Carroll',
    level: 'Iniciante',
    rating: 4.6,
    minutes: 12,
    gradient: 'from-violet-500 to-indigo-800',
    synopsis:
      'Alice follows a White Rabbit down a hole and lands in a world where nothing makes sense — a tea party without time, a grinning cat, a very angry Queen.',
    excerpt:
      'Alice was beginning to get very tired of sitting by her sister, when suddenly a White Rabbit with pink eyes ran close by her.\n\nThe Rabbit actually took a watch out of its waistcoat-pocket, and then hurried on.\n\n"So the Rabbit was late," thought Alice. Nothing, anywhere, was going to be normal again.',
  },
  {
    id: 'peter-pan',
    title: 'Peter Pan',
    author: 'J. M. Barrie',
    level: 'Iniciante',
    badge: 'Novo',
    rating: 4.5,
    minutes: 12,
    gradient: 'from-teal-500 to-emerald-800',
    synopsis:
      'The boy who never grows up flies through the nursery window and takes Wendy, John and Michael to Neverland, where pirates, fairies and lost boys wait.',
    excerpt:
      'All children, except one, grow up.\n\n"Second to the right, and straight on till morning," said Peter Pan.\n\nThe three children flew out of the window, over the treetops, and on — on towards the sea of stars where Neverland lay, shaped like no island anyone had ever seen.',
  },
  {
    id: 'gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    level: 'Avançado',
    rating: 4.4,
    minutes: 19,
    gradient: 'from-yellow-500 to-amber-800',
    synopsis:
      'On Long Island, mysterious millionaire Jay Gatsby throws the parties everyone talks about — all for one person who may never walk through the door.',
    excerpt:
      'In my younger and more vulnerable years my father gave me some advice: "Whenever you feel like criticising anyone, remember that all the people in this world haven\'t had the advantages that you\'ve had."\n\nGatsby believed in the green light, the orgastic future that year by year recedes before us.',
  },
  {
    id: 'treasure-island',
    title: 'Treasure Island',
    author: 'Robert Louis Stevenson',
    level: 'Intermediário',
    rating: 4.5,
    minutes: 17,
    gradient: 'from-cyan-600 to-blue-900',
    synopsis:
      'A treasure map, a one-legged cook and a mutiny on the high seas. The adventure novel that gave us pirates with parrots and "yo-ho-ho".',
    excerpt:
      'Squire Trelawney, Dr. Livesey, and the rest of these gentlemen having asked me to write down the whole particulars about Treasure Island, I take up my pen in the year of grace 17—.\n\nI remember him as if it were yesterday, as he came plodding to the inn door, his sea-chest following behind him in a hand-barrow: a tall, strong, heavy, nut-brown man, his tarry pigtail falling over his shoulders.',
  },
];

const SERIES = BOOKS.slice(0, 6);
const RECOMMENDED = BOOKS.slice(6);

const LEVEL_COLORS: Record<Level, string> = {
  Iniciante: 'text-emerald-700 border-emerald-300 bg-emerald-50',
  'Intermediário': 'text-amber-700 border-amber-300 bg-amber-50',
  'Avançado': 'text-rose-700 border-rose-300 bg-rose-50',
};

export function ReadingLibrary({ languageName, onOpenEstante }: ReadingLibraryProps) {
  const [query, setQuery] = useState('');
  const [openBook, setOpenBook] = useState<LibraryBook | null>(null);
  const [page, setPage] = useState(0);
  const [showAllRecommended, setShowAllRecommended] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return BOOKS.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.level.toLowerCase().includes(q),
    );
  }, [query]);

  const openReader = (b: LibraryBook) => {
    setOpenBook(b);
    setPage(0);
  };

  const readerPages = openBook
    ? [
        { title: 'Sobre este livro', content: openBook.synopsis },
        { title: 'Capítulo 1', content: openBook.excerpt },
      ]
    : [];

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 space-y-8">
        {/* ================= HERO ================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-purple-500 to-fuchsia-500 shadow-lg">
          {/* Left illustration */}
          <img
            src={heroBooks}
            alt=""
            aria-hidden
            className="hidden md:block absolute left-4 bottom-0 h-40 lg:h-48 object-contain drop-shadow-xl select-none pointer-events-none"
          />
          {/* Right illustration */}
          <img
            src={heroShelf}
            alt=""
            aria-hidden
            className="hidden md:block absolute right-4 bottom-0 h-44 lg:h-52 object-contain drop-shadow-xl select-none pointer-events-none"
          />

          <div className="relative px-6 py-8 md:py-10 md:px-56 lg:px-64 text-center text-white">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold drop-shadow">Biblioteca de Leitura</h1>
            </div>
            <p className="mt-2 font-bold text-white/95">
              Leia em inglês, aprenda sem perceber
            </p>
            <p className="mt-1 text-sm text-white/75 max-w-md mx-auto">
              Histórias clássicas adaptadas para o seu nível — leia um capítulo por dia e colete XPs enquanto lê.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
              <Button
                onClick={() => openReader(BOOKS[0])}
                className="bg-white hover:bg-white/90 text-purple-700 font-bold rounded-full shadow"
              >
                <BookMarked className="w-4 h-4 mr-2" />
                Continuar lendo
              </Button>
              <Button
                variant="ghost"
                onClick={onOpenEstante}
                className="bg-white/15 hover:bg-white/25 text-white font-semibold rounded-full"
              >
                <Library className="w-4 h-4 mr-2" />
                Minha estante
              </Button>
            </div>
          </div>
        </div>

        {/* ================= SEARCH ================= */}
        <div className="bg-background border border-border rounded-2xl shadow-sm p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquise o seu livro aqui..."
                className="pl-9 h-11 rounded-xl border-0 focus-visible:ring-1 focus-visible:ring-ring bg-transparent"
              />
            </div>
            <Button className="h-11 px-6 rounded-xl bg-purple-500 hover:bg-purple-600">
              <Search className="w-4 h-4 mr-1" />
              Buscar
            </Button>
          </div>
        </div>

        {/* ================= RESULTS / SECTIONS ================= */}
        {filtered ? (
          <section>
            <SectionHeader
              title={`Resultados para "${query.trim()}"`}
              icon={<Search className="w-4 h-4" />}
            />
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhum livro encontrado. Tente outro título ou autor.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filtered.map((b) => (
                  <BookCard key={b.id} book={b} onOpen={() => openReader(b)} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Série iniciação */}
            <section>
              <SectionHeader
                title="Série iniciação"
                icon={<Sparkles className="w-4 h-4 text-purple-500" />}
              />
              <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
                {SERIES.map((b) => (
                  <div key={b.id} className="shrink-0 w-36 md:w-40">
                    <BookCard book={b} onOpen={() => openReader(b)} />
                  </div>
                ))}
              </div>
            </section>

            {/* Recomendações */}
            <section>
              <SectionHeader
                title="Recomendações"
                icon={<Flame className="w-4 h-4 text-fuchsia-500" />}
                action={
                  <button
                    onClick={() => setShowAllRecommended((v) => !v)}
                    className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                  >
                    {showAllRecommended ? 'Ver menos' : 'Ver tudo'}
                  </button>
                }
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {(showAllRecommended ? RECOMMENDED : RECOMMENDED.slice(0, 6)).map((b) => (
                  <BookCard key={b.id} book={b} onOpen={() => openReader(b)} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* ================= READER ================= */}
      <Dialog open={!!openBook} onOpenChange={(o) => { if (!o) setOpenBook(null); }}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
          {openBook && (
            <div className="flex flex-col">
              {/* Reader header */}
              <div className={cn('relative bg-gradient-to-br px-5 py-5 text-white', openBook.gradient)}>
                <button
                  onClick={() => setOpenBook(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4 pr-10">
                  <div className="w-16 h-24 rounded-md bg-white/15 border border-white/30 flex flex-col items-center justify-center text-center px-1 shrink-0">
                    <span className="text-[10px] font-bold leading-tight line-clamp-3">{openBook.title}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold leading-tight">{openBook.title}</h3>
                    <p className="text-sm text-white/80">{openBook.author}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                        <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                        {openBook.rating.toFixed(1)}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                        <BookOpen className="w-3 h-3" />
                        ~{openBook.minutes} min
                      </span>
                      <span className="inline-flex bg-white/20 rounded-full px-2 py-0.5">
                        {openBook.level}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reader body */}
              <div className="bg-background px-6 md:px-10 py-8 min-h-[340px]">
                <h4 className="text-sm font-semibold text-purple-600 mb-3 uppercase tracking-wide">
                  {readerPages[page]?.title}
                </h4>
                <div className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap font-serif">
                  {readerPages[page]?.content}
                </div>
                <p className="mt-6 text-xs text-muted-foreground italic">
                  {page === 0
                    ? 'Continue para o Capítulo 1 →'
                    : 'Fim da prévia — em breve, mais capítulos!'}
                </p>
              </div>

              {/* Reader nav */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-xs text-muted-foreground tabular-nums">
                  Página {page + 1} de {readerPages.length}
                </span>
                <Button
                  size="sm"
                  className="bg-purple-500 hover:bg-purple-600"
                  onClick={() => setPage((p) => Math.min(readerPages.length - 1, p + 1))}
                  disabled={page >= readerPages.length - 1}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------- Section header ------------------------- */

function SectionHeader({
  title,
  icon,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg md:text-xl font-extrabold text-foreground">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* --------------------------- Book card --------------------------- */

function BookCard({ book, onOpen }: { book: LibraryBook; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
    >
      {/* CSS cover */}
      <div
        className={cn(
          'relative aspect-[7/10] w-full rounded-lg overflow-hidden bg-gradient-to-br shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all',
          book.gradient,
        )}
      >
        <div className="absolute inset-1.5 border border-white/30 rounded-[4px] pointer-events-none" />
        <div className="absolute left-0 inset-y-0 w-2 bg-black/25" />
        <div className="absolute inset-0 flex flex-col justify-between px-3 py-4 pl-5">
          <h4 className="text-[13px] font-extrabold text-white leading-tight drop-shadow line-clamp-4">
            {book.title}
          </h4>
          <div>
            <div className="h-px bg-white/40 mb-1.5" />
            <p className="text-[10px] uppercase tracking-wider text-white/85 line-clamp-1">
              {book.author}
            </p>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-2 space-y-1.5">
        <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
          {book.title}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {book.badge && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-purple-500 rounded-full px-2 py-0.5">
              {book.badge === 'Mais lidos' && <Star className="w-2.5 h-2.5 fill-white" />}
              {book.badge}
            </span>
          )}
          <span
            className={cn(
              'inline-flex items-center text-[10px] font-semibold border rounded-full px-2 py-0.5',
              LEVEL_COLORS[book.level],
            )}
          >
            Nível {book.level.toLowerCase()}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
          {book.rating.toFixed(1)}
          <span className="mx-0.5">·</span>
          <BookOpen className="w-3 h-3" />
          ~{book.minutes} min
        </div>
      </div>
    </button>
  );
}

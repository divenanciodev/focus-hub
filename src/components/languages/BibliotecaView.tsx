import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Library,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BibliotecaViewProps {
  languageName: string;
}

interface BookPage {
  title?: string;
  content: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  spineColor: string; // hsl or hex
  description?: string;
  pages: BookPage[];
  createdAt: number;
}

const STORAGE_PREFIX = 'biblioteca:books:v1:';

const SPINE_PALETTE = [
  '#3f3f46', // zinc-700
  '#52525b', // zinc-600
  '#6b7280', // gray-500
  '#78716c', // stone-500
  '#a1a1aa', // zinc-400
  '#404040', // neutral-700
  '#1f2937', // slate-800
  '#475569', // slate-600
  '#292524', // stone-800
];

function randSpine() {
  return SPINE_PALETTE[Math.floor(Math.random() * SPINE_PALETTE.length)];
}

function loadBooks(key: string): Book[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Book[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveBooks(key: string, books: Book[]) {
  try {
    localStorage.setItem(key, JSON.stringify(books));
  } catch {
    // ignore
  }
}

export function BibliotecaView({ languageName }: BibliotecaViewProps) {
  const storageKey = `${STORAGE_PREFIX}${languageName}`;

  const [books, setBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [openBook, setOpenBook] = useState<Book | null>(null);
  const [spread, setSpread] = useState(0); // page spread (pair index)

  // form state
  const [fTitle, setFTitle] = useState('');
  const [fAuthor, setFAuthor] = useState('');
  const [fDescription, setFDescription] = useState('');
  const [fContent, setFContent] = useState('');

  useEffect(() => {
    setBooks(loadBooks(storageKey));
  }, [storageKey]);

  useEffect(() => {
    saveBooks(storageKey, books);
  }, [books, storageKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.description || '').toLowerCase().includes(q),
    );
  }, [books, query]);

  // chunk into shelves (books per shelf)
  const shelves = useMemo(() => {
    const perShelf = 8;
    const rows: Book[][] = [];
    for (let i = 0; i < filtered.length; i += perShelf) {
      rows.push(filtered.slice(i, i + perShelf));
    }
    // Always show at least 3 empty shelves
    while (rows.length < 3) rows.push([]);
    return rows;
  }, [filtered]);

  const resetForm = () => {
    setFTitle('');
    setFAuthor('');
    setFDescription('');
    setFContent('');
  };

  const handleAdd = () => {
    const title = fTitle.trim();
    if (!title) return;
    // Split content into pages: separator "---" or every ~600 chars fallback
    const raw = fContent.trim();
    let pages: BookPage[] = [];
    if (raw.includes('---')) {
      pages = raw
        .split(/\n?---\n?/g)
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .map((chunk) => ({ content: chunk }));
    } else if (raw.length === 0) {
      pages = [{ content: '' }];
    } else {
      // chunk by paragraphs, group up to ~600 chars per page
      const paragraphs = raw.split(/\n{2,}/g).map((p) => p.trim()).filter(Boolean);
      let buf = '';
      for (const p of paragraphs) {
        if ((buf + '\n\n' + p).length > 700 && buf) {
          pages.push({ content: buf.trim() });
          buf = p;
        } else {
          buf = buf ? buf + '\n\n' + p : p;
        }
      }
      if (buf) pages.push({ content: buf.trim() });
      if (pages.length === 0) pages = [{ content: raw }];
    }

    const book: Book = {
      id: crypto.randomUUID(),
      title,
      author: fAuthor.trim() || 'Anônimo',
      spineColor: randSpine(),
      description: fDescription.trim() || undefined,
      pages,
      createdAt: Date.now(),
    };
    setBooks((prev) => [book, ...prev]);
    setAddOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const openBookView = (b: Book) => {
    setOpenBook(b);
    setSpread(0);
  };

  // total spreads (2 pages per spread)
  const totalSpreads = openBook ? Math.max(1, Math.ceil(openBook.pages.length / 2)) : 0;
  const leftPage = openBook ? openBook.pages[spread * 2] : undefined;
  const rightPage = openBook ? openBook.pages[spread * 2 + 1] : undefined;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      {/* Sub-header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Library className="w-5 h-5 text-foreground" />
            <h2 className="font-semibold text-foreground">Biblioteca de {languageName}</h2>
          </div>

          <div className="flex-1 max-w-md ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar livros…"
              className="pl-9 h-9"
            />
          </div>

          <Button size="sm" onClick={() => setAddOpen(true)} className="shrink-0">
            <Plus className="w-4 h-4 mr-1" />
            Adicionar livro
          </Button>
        </div>
      </div>

      {/* Shelves */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-10">
        {books.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground">Nenhum livro ainda</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione seu primeiro livro para começar sua biblioteca.
            </p>
            <Button size="sm" onClick={() => setAddOpen(true)} className="mt-4">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar livro
            </Button>
          </div>
        )}

        {shelves.map((row, idx) => (
          <Shelf key={idx} books={row} onOpen={openBookView} onDelete={handleDelete} />
        ))}
      </div>

      {/* Add Book Modal */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo livro</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Título *</label>
              <Input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="Ex.: A Arte da Gramática" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Autor</label>
              <Input value={fAuthor} onChange={(e) => setFAuthor(e.target.value)} placeholder="Ex.: Anônimo" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Descrição</label>
              <Input value={fDescription} onChange={(e) => setFDescription(e.target.value)} placeholder="Curta descrição" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Conteúdo (use <code className="px-1 rounded bg-muted">---</code> para separar páginas)
              </label>
              <Textarea
                value={fContent}
                onChange={(e) => setFContent(e.target.value)}
                rows={8}
                placeholder={"Página 1...\n---\nPágina 2..."}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setAddOpen(false); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={!fTitle.trim()}>Salvar livro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Book Reader */}
      <Dialog open={!!openBook} onOpenChange={(o) => { if (!o) setOpenBook(null); }}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden border-border">
          {openBook && (
            <div className="flex flex-col bg-background">
              {/* Book header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{openBook.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {openBook.author}{openBook.description ? ` · ${openBook.description}` : ''}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpenBook(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Book spread */}
              <div className="relative bg-muted/40 py-8 px-4 md:px-10">
                <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-0 shadow-lg rounded-md overflow-hidden border border-border bg-[hsl(var(--card))]">
                  <BookPageView page={leftPage} pageNumber={spread * 2 + 1} side="left" />
                  <BookPageView page={rightPage} pageNumber={spread * 2 + 2} side="right" />
                </div>

                {/* Nav arrows */}
                <div className="flex items-center justify-between mt-4 max-w-4xl mx-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSpread((s) => Math.max(0, s - 1))}
                    disabled={spread === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Página {spread * 2 + 1}
                    {rightPage ? `–${spread * 2 + 2}` : ''} de {openBook.pages.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSpread((s) => Math.min(totalSpreads - 1, s + 1))}
                    disabled={spread >= totalSpreads - 1}
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------------- Shelf --------------------------- */

function Shelf({
  books,
  onOpen,
  onDelete,
}: {
  books: Book[];
  onOpen: (b: Book) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="relative">
      {/* Books row */}
      <div className="flex items-end gap-2 min-h-[220px] px-3 pb-1">
        {books.map((b) => (
          <BookSpine key={b.id} book={b} onOpen={() => onOpen(b)} onDelete={() => onDelete(b.id)} />
        ))}
        {books.length === 0 && (
          <div className="text-xs text-muted-foreground italic py-16 mx-auto">
            Prateleira vazia
          </div>
        )}
      </div>

      {/* Wooden shelf plank */}
      <div className="relative">
        <div
          className="h-3 rounded-sm border-t border-border shadow-[0_6px_10px_-6px_hsl(0_0%_0%_/_0.25)]"
          style={{
            background:
              'linear-gradient(180deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground) / 0.15) 100%)',
          }}
        />
        <div className="h-1 bg-foreground/5" />
      </div>
    </div>
  );
}

/* ------------------------- Book Spine ------------------------ */

function BookSpine({
  book,
  onOpen,
  onDelete,
}: {
  book: Book;
  onOpen: () => void;
  onDelete: () => void;
}) {
  // Randomize height/width slightly, seeded by id for stability
  const seed = useMemo(() => {
    let s = 0;
    for (let i = 0; i < book.id.length; i++) s = (s * 31 + book.id.charCodeAt(i)) >>> 0;
    return s;
  }, [book.id]);
  const height = 160 + (seed % 50); // 160-210
  const width = 32 + ((seed >> 3) % 20); // 32-52

  return (
    <div className="relative group" style={{ height, width }}>
      <button
        onClick={onOpen}
        title={`${book.title} — ${book.author}`}
        className={cn(
          'relative w-full h-full rounded-sm overflow-hidden',
          'shadow-[inset_-6px_0_10px_-6px_rgba(0,0,0,0.35),inset_6px_0_10px_-6px_rgba(255,255,255,0.15)]',
          'transition-transform duration-200 origin-bottom hover:-translate-y-2 hover:shadow-lg',
          'focus:outline-none focus:ring-2 focus:ring-ring',
        )}
        style={{ backgroundColor: book.spineColor }}
      >
        {/* Spine bands */}
        <div className="absolute inset-x-0 top-2 h-[6px] bg-white/10" />
        <div className="absolute inset-x-0 bottom-2 h-[6px] bg-white/10" />

        {/* Vertical title */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          <span className="text-[11px] font-semibold text-white/90 px-2 line-clamp-1 tracking-wide">
            {book.title}
          </span>
        </div>
      </button>

      {/* Delete on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm"
        title="Excluir livro"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

/* -------------------------- Book Page ------------------------ */

function BookPageView({
  page,
  pageNumber,
  side,
}: {
  page?: BookPage;
  pageNumber: number;
  side: 'left' | 'right';
}) {
  return (
    <div
      className={cn(
        'relative min-h-[420px] px-8 py-10 bg-[hsl(var(--card))]',
        side === 'left'
          ? 'border-r border-border shadow-[inset_-10px_0_20px_-15px_rgba(0,0,0,0.25)]'
          : 'shadow-[inset_10px_0_20px_-15px_rgba(0,0,0,0.25)]',
      )}
    >
      {page ? (
        <>
          {page.title && (
            <h4 className="text-sm font-semibold text-foreground mb-3">{page.title}</h4>
          )}
          <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-serif">
            {page.content || <span className="text-muted-foreground italic">Página em branco</span>}
          </div>
          <div className="absolute bottom-3 inset-x-0 text-center text-[10px] text-muted-foreground tabular-nums">
            {pageNumber}
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
          — fim —
        </div>
      )}
    </div>
  );
}
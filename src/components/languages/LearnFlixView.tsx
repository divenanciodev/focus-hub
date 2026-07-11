import { useEffect, useMemo, useState } from 'react';
import { Plus, Play, Search, Trash2, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface LearnFlixVideo {
  id: string;
  title: string;
  url: string;
  category: string;
  thumbnail: string;
  description?: string;
  addedAt: number;
}

const STORAGE_KEY = 'learnflix:videos:v1';

const DEFAULT_CATEGORIES = [
  'Continuar assistindo',
  'Populares',
  'Vocabulário',
  'Gramática',
  'Conversação',
  'Cultura',
];

function parseYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1) || null;
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || null;
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || null;
    }
    return null;
  } catch {
    return null;
  }
}

function ytThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function loadVideos(): LearnFlixVideo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function LearnFlixView({ languageName }: { languageName: string }) {
  const [videos, setVideos] = useState<LearnFlixVideo[]>([]);
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [playing, setPlaying] = useState<LearnFlixVideo | null>(null);

  // Form
  const [fTitle, setFTitle] = useState('');
  const [fUrl, setFUrl] = useState('');
  const [fCategory, setFCategory] = useState(DEFAULT_CATEGORIES[1]);
  const [fDesc, setFDesc] = useState('');
  const [fThumb, setFThumb] = useState('');

  useEffect(() => {
    setVideos(loadVideos());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  }, [videos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return videos;
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        (v.description ?? '').toLowerCase().includes(q),
    );
  }, [videos, query]);

  const categories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    filtered.forEach((v) => set.add(v.category));
    return Array.from(set);
  }, [filtered]);

  const featured = filtered[0] ?? null;

  const resetForm = () => {
    setFTitle('');
    setFUrl('');
    setFCategory(DEFAULT_CATEGORIES[1]);
    setFDesc('');
    setFThumb('');
  };

  const handleAdd = () => {
    if (!fTitle.trim() || !fUrl.trim()) return;
    const ytId = parseYouTubeId(fUrl);
    const thumb = fThumb.trim() || (ytId ? ytThumb(ytId) : '');
    const newVideo: LearnFlixVideo = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: fTitle.trim(),
      url: fUrl.trim(),
      category: fCategory.trim() || 'Populares',
      description: fDesc.trim() || undefined,
      thumbnail: thumb,
      addedAt: Date.now(),
    };
    setVideos((prev) => [newVideo, ...prev]);
    resetForm();
    setAddOpen(false);
  };

  const handleDelete = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const playingId = playing ? parseYouTubeId(playing.url) : null;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-background text-foreground">
      {/* Sub-header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 md:px-10 pt-4 pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center">
              <Film className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                LearnFlix
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Sua biblioteca de vídeos em {languageName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-secondary border border-border rounded-md px-3 py-1.5">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar vídeos..."
                className="bg-transparent outline-none text-sm w-40 md:w-56 placeholder:text-muted-foreground text-foreground"
              />
            </div>
            <Button
              onClick={() => setAddOpen(true)}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" /> Adicionar vídeo
            </Button>
          </div>
        </div>
      </div>

      {/* Featured banner */}
      {featured ? (
        <FeaturedBanner video={featured} onPlay={() => setPlaying(featured)} />
      ) : (
        <EmptyBanner onAdd={() => setAddOpen(true)} />
      )}

      {/* Rows */}
      <div className="pb-20 mt-8 space-y-10">
        {categories.map((cat) => {
          const items = filtered.filter((v) => v.category === cat);
          if (items.length === 0) return null;
          return (
            <VideoRow
              key={cat}
              title={cat}
              items={items}
              onPlay={setPlaying}
              onDelete={handleDelete}
            />
          );
        })}

        {filtered.length === 0 && videos.length > 0 && (
          <div className="text-center text-muted-foreground py-16">
            Nenhum vídeo corresponde à sua busca.
          </div>
        )}
      </div>

      {/* Add modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar vídeo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Título *">
              <input
                value={fTitle}
                onChange={(e) => setFTitle(e.target.value)}
                placeholder="Ex: 100 verbos essenciais"
                className="input"
              />
            </Field>
            <Field label="URL do vídeo (YouTube) *">
              <input
                value={fUrl}
                onChange={(e) => setFUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="input"
              />
            </Field>
            <Field label="Categoria">
              <input
                value={fCategory}
                onChange={(e) => setFCategory(e.target.value)}
                list="learnflix-cats"
                className="input"
              />
              <datalist id="learnflix-cats">
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Thumbnail (opcional)">
              <input
                value={fThumb}
                onChange={(e) => setFThumb(e.target.value)}
                placeholder="URL de imagem (auto para YouTube)"
                className="input"
              />
            </Field>
            <Field label="Descrição (opcional)">
              <textarea
                value={fDesc}
                onChange={(e) => setFDesc(e.target.value)}
                rows={3}
                className="input resize-none"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setAddOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!fTitle.trim() || !fUrl.trim()}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Player */}
      <Dialog open={!!playing} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {playing && (
            <div>
              <div className="aspect-video w-full bg-secondary">
                {playingId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${playingId}?autoplay=1`}
                    title={playing.title}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm p-6 text-center">
                    Formato de URL não suportado no player embutido.
                    <br />
                    <a href={playing.url} target="_blank" rel="noreferrer" className="underline text-foreground mt-2 inline-block">
                      Abrir em nova aba
                    </a>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold">{playing.title}</h3>
                <div className="text-xs text-muted-foreground mt-1">{playing.category}</div>
                {playing.description && (
                  <p className="text-sm text-foreground/80 mt-3 whitespace-pre-wrap">{playing.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        .input {
          width: 100%;
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          color: hsl(var(--foreground));
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus { border-color: hsl(var(--ring)); box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function FeaturedBanner({ video, onPlay }: { video: LearnFlixVideo; onPlay: () => void }) {
  return (
    <div className="relative h-[42vh] min-h-[260px] w-full overflow-hidden border-b border-border">
      {video.thumbnail ? (
        <img
          src={video.thumbnail}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-secondary" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
      <div className="relative z-10 h-full flex flex-col justify-end px-4 md:px-10 pb-10 max-w-3xl">
        <div className="text-xs text-muted-foreground font-medium tracking-widest uppercase mb-2">
          Em destaque
        </div>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground">{video.title}</h2>
        {video.description && (
          <p className="mt-3 text-sm md:text-base text-muted-foreground line-clamp-3">{video.description}</p>
        )}
        <div className="mt-5 flex gap-3">
          <Button onClick={onPlay}>
            <Play className="w-4 h-4 mr-2" /> Assistir
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyBanner({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="relative h-[40vh] min-h-[260px] w-full overflow-hidden bg-secondary border-b border-border flex items-center justify-center">
      <div className="text-center px-4">
        <Film className="w-14 h-14 mx-auto text-muted-foreground mb-3" />
        <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">Sua LearnFlix está vazia</h2>
        <p className="mt-2 text-muted-foreground">Adicione seu primeiro vídeo para começar.</p>
        <Button onClick={onAdd} className="mt-5">
          <Plus className="w-4 h-4 mr-2" /> Adicionar vídeo
        </Button>
      </div>
    </div>
  );
}

function VideoRow({
  title,
  items,
  onPlay,
  onDelete,
}: {
  title: string;
  items: LearnFlixVideo[];
  onPlay: (v: LearnFlixVideo) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="px-4 md:px-10">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">{title}</h3>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3">
        {items.map((v) => (
          <VideoCard key={v.id} video={v} onPlay={() => onPlay(v)} onDelete={() => onDelete(v.id)} />
        ))}
      </div>
    </section>
  );
}

function VideoCard({
  video,
  onPlay,
  onDelete,
}: {
  video: LearnFlixVideo;
  onPlay: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        'group relative shrink-0 w-56 md:w-64 aspect-video rounded-md overflow-hidden bg-secondary border border-border',
        'cursor-pointer transition-all hover:border-foreground/30 hover:shadow-md',
      )}
      onClick={onPlay}
    >
      {video.thumbnail ? (
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-secondary flex items-center justify-center">
          <Film className="w-10 h-10 text-muted-foreground" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="text-sm font-medium line-clamp-2 text-white">{video.title}</div>
        <div className="text-[10px] uppercase tracking-wider text-white/70 mt-0.5">
          {video.category}
        </div>
      </div>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-7 h-7 rounded-md bg-black/70 hover:bg-black/90 flex items-center justify-center text-white"
          title="Remover"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
        <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
          <Play className="w-5 h-5 fill-black" />
        </div>
      </div>
    </div>
  );
}
import { useEffect, useMemo, useState } from 'react';
import { Plus, Play, Search, Trash2, X, Film } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-72px)] bg-black text-white">
      {/* Sub-header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-black via-black/90 to-transparent px-4 md:px-10 pt-4 pb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Learn<span className="text-red-600">Flix</span>
              </h1>
              <p className="text-xs md:text-sm text-white/60">
                Sua biblioteca de vídeos em {languageName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5">
              <Search className="w-4 h-4 text-white/60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar vídeos..."
                className="bg-transparent outline-none text-sm w-40 md:w-56 placeholder:text-white/40"
              />
            </div>
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full"
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
      <div className="pb-20 mt-6 space-y-10">
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
          <div className="text-center text-white/60 py-16">
            Nenhum vídeo corresponde à sua busca.
          </div>
        )}
      </div>

      {/* Add modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Adicionar vídeo</DialogTitle>
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
              <Button variant="ghost" onClick={() => setAddOpen(false)} className="text-white hover:bg-white/10">
                Cancelar
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!fTitle.trim() || !fUrl.trim()}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Player */}
      <Dialog open={!!playing} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="bg-black border-neutral-800 text-white max-w-4xl p-0 overflow-hidden">
          {playing && (
            <div>
              <div className="aspect-video w-full bg-black">
                {playingId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${playingId}?autoplay=1`}
                    title={playing.title}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/60 text-sm p-6 text-center">
                    Formato de URL não suportado no player embutido.
                    <br />
                    <a href={playing.url} target="_blank" rel="noreferrer" className="underline text-red-400 mt-2 inline-block">
                      Abrir em nova aba
                    </a>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold">{playing.title}</h3>
                <div className="text-xs text-white/50 mt-1">{playing.category}</div>
                {playing.description && (
                  <p className="text-sm text-white/80 mt-3 whitespace-pre-wrap">{playing.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        .input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus { border-color: #ef4444; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function FeaturedBanner({ video, onPlay }: { video: LearnFlixVideo; onPlay: () => void }) {
  return (
    <div className="relative h-[46vh] min-h-[280px] w-full overflow-hidden">
      {video.thumbnail ? (
        <img
          src={video.thumbnail}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-neutral-900 to-black" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
      <div className="relative z-10 h-full flex flex-col justify-end px-4 md:px-10 pb-10 max-w-3xl">
        <div className="text-xs text-red-500 font-bold tracking-widest uppercase mb-2">
          Em destaque
        </div>
        <h2 className="text-3xl md:text-5xl font-black drop-shadow-lg">{video.title}</h2>
        {video.description && (
          <p className="mt-3 text-sm md:text-base text-white/80 line-clamp-3">{video.description}</p>
        )}
        <div className="mt-5 flex gap-3">
          <Button onClick={onPlay} className="bg-white text-black hover:bg-white/90 font-bold">
            <Play className="w-4 h-4 mr-2 fill-black" /> Assistir
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyBanner({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="relative h-[40vh] min-h-[260px] w-full overflow-hidden bg-gradient-to-br from-red-900 via-neutral-900 to-black flex items-center justify-center">
      <div className="text-center px-4">
        <Film className="w-14 h-14 mx-auto text-red-500 mb-3" />
        <h2 className="text-2xl md:text-4xl font-black">Sua LearnFlix está vazia</h2>
        <p className="mt-2 text-white/70">Adicione seu primeiro vídeo para começar.</p>
        <Button onClick={onAdd} className="mt-5 bg-red-600 hover:bg-red-700 text-white font-bold">
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
      <h3 className="text-lg md:text-xl font-bold mb-3">{title}</h3>
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
        'group relative shrink-0 w-56 md:w-64 aspect-video rounded-lg overflow-hidden bg-neutral-800',
        'cursor-pointer transition-transform hover:scale-[1.04] hover:z-10 shadow-lg',
      )}
      onClick={onPlay}
    >
      {video.thumbnail ? (
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-red-800 to-neutral-900 flex items-center justify-center">
          <Film className="w-10 h-10 text-white/60" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="text-sm font-bold line-clamp-2">{video.title}</div>
        <div className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">
          {video.category}
        </div>
      </div>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-7 h-7 rounded-full bg-black/70 hover:bg-red-600 flex items-center justify-center"
          title="Remover"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
        <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg">
          <Play className="w-5 h-5 fill-black" />
        </div>
      </div>
    </div>
  );
}

// Prevent unused-import warning for X in some setups
void X;
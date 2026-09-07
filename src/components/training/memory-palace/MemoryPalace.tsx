import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Plus,
  Type,
  Brush,
  Eraser,
  Move,
  Save,
  Trash2,
  Home,
} from 'lucide-react';
import castelo from '@/assets/memory-palace/castelo.png';
import casa from '@/assets/memory-palace/casa.png';

type Tool = 'texto' | 'pincel' | 'borracha' | 'mover';

interface PalaceItem {
  id: string;
  kind: 'image' | 'text';
  src?: string;
  text?: string;
  x: number;
  y: number;
  width?: number;
}

interface Palace {
  id: string;
  name: string;
  items: PalaceItem[];
  drawing?: string | null;
}

const STORAGE_KEY = 'memory-palaces';
const CANVAS_W = 1200;
const CANVAS_H = 700;

const imageLibrary = [
  { label: 'Adicionar Castelo', src: castelo, width: 620 },
  { label: 'Adicionar Casa', src: casa, width: 320 },
];

function loadPalaces(): Palace[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Palace[]) : [];
  } catch {
    return [];
  }
}

export function MemoryPalace() {
  const [palaces, setPalaces] = useState<Palace[]>(() => loadPalaces());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>('pincel');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(false);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);

  const active = palaces.find((p) => p.id === activeId) || null;

  useEffect(() => {
    if (!activeId && palaces.length > 0) setActiveId(palaces[0].id);
  }, [palaces, activeId]);

  // Load saved strokes when switching palace
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (active?.drawing) {
      const img = new window.Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = active.drawing;
    }
  }, [activeId, active?.drawing]);

  const persist = (next: Palace[]) => {
    setPalaces(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  };

  const updateActive = (patch: Partial<Palace>) => {
    if (!active) return;
    persist(palaces.map((p) => (p.id === active.id ? { ...p, ...patch } : p)));
  };

  const handleCreate = () => {
    const name = newName.trim() || `Palácio da Memória ${palaces.length + 1}`;
    const palace: Palace = { id: crypto.randomUUID(), name, items: [], drawing: null };
    persist([...palaces, palace]);
    setActiveId(palace.id);
    setNewName('');
    setCreating(false);
  };

  const handleDelete = (id: string) => {
    const next = palaces.filter((p) => p.id !== id);
    persist(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  };

  const addImage = (src: string, width: number) => {
    if (!active) {
      toast.error('Crie um palácio primeiro');
      return;
    }
    const item: PalaceItem = {
      id: crypto.randomUUID(),
      kind: 'image',
      src,
      width,
      x: CANVAS_W / 2 - width / 2,
      y: CANVAS_H / 2 - width / 3,
    };
    updateActive({ items: [...active.items, item] });
  };

  const stagePoint = (e: React.MouseEvent) => {
    const rect = stageRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  };

  const paint = (x: number, y: number) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    if (tool === 'borracha') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 24;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'hsl(0 0% 20%)';
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!active) return;
    const { x, y } = stagePoint(e);

    if (tool === 'texto') {
      const text = window.prompt('Texto do local (ex.: Entrada Principal - Chaves)');
      if (!text) return;
      updateActive({
        items: [...active.items, { id: crypto.randomUUID(), kind: 'text', text, x, y }],
      });
      return;
    }

    if (tool === 'pincel' || tool === 'borracha') {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      drawingRef.current = true;
      ctx.beginPath();
      ctx.moveTo(x, y);
      paint(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragRef.current && tool === 'mover' && active) {
      const { x, y } = stagePoint(e);
      const { id, dx, dy } = dragRef.current;
      updateActive({
        items: active.items.map((it) =>
          it.id === id ? { ...it, x: x - dx, y: y - dy } : it
        ),
      });
      return;
    }
    if (!drawingRef.current) return;
    const { x, y } = stagePoint(e);
    paint(x, y);
  };

  const endInteraction = () => {
    drawingRef.current = false;
    dragRef.current = null;
  };

  const startDrag = (e: React.MouseEvent, item: PalaceItem) => {
    if (tool !== 'mover') return;
    e.stopPropagation();
    const { x, y } = stagePoint(e);
    dragRef.current = { id: item.id, dx: x - item.x, dy: y - item.y };
  };

  const handleSave = () => {
    if (!active) return;
    const data = canvasRef.current?.toDataURL('image/png') ?? null;
    updateActive({ drawing: data });
    toast.success('Palácio salvo!');
  };

  const tools: { id: Tool; label: string; icon: React.ElementType }[] = [
    { id: 'texto', label: 'Texto', icon: Type },
    { id: 'pincel', label: 'Pincel', icon: Brush },
    { id: 'borracha', label: 'Borracha', icon: Eraser },
    { id: 'mover', label: 'Mover', icon: Move },
  ];

  return (
    <div className="space-y-4">
      {/* Palaces list */}
      <div className="flex flex-wrap items-center gap-2">
        {palaces.map((p) => (
          <div
            key={p.id}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
              p.id === activeId
                ? 'border-foreground/30 bg-secondary'
                : 'border-border bg-card hover:border-foreground/20'
            )}
          >
            <button
              className="flex items-center gap-2"
              onClick={() => setActiveId(p.id)}
            >
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{p.name}</span>
            </button>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Excluir ${p.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {creating ? (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Nome do palácio (ex.: Castelo Medieval)"
            className="max-w-xs"
          />
          <Button size="sm" onClick={handleCreate}>
            Criar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>
            Cancelar
          </Button>
        </div>
      ) : (
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Novo Palácio da Memória
        </Button>
      )}

      {/* Editor */}
      {active && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="mr-2 text-xs uppercase tracking-wide text-muted-foreground">
                Adicionar imagem
              </span>
              {imageLibrary.map((img) => (
                <button
                  key={img.label}
                  onClick={() => addImage(img.src, img.width)}
                  className="flex flex-col items-center gap-1 rounded-lg border border-border p-2 hover:border-foreground/30 hover:bg-secondary/50"
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    loading="lazy"
                    className="h-10 w-14 object-contain"
                  />
                  <span className="text-[11px] text-muted-foreground">{img.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              {tools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-[11px] transition-colors',
                    tool === t.id
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/60'
                  )}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
              <button
                onClick={handleSave}
                className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-[11px] text-muted-foreground hover:bg-secondary/60"
              >
                <Save className="h-4 w-4" />
                Salvar
              </button>
            </div>
          </div>

          {/* Stage */}
          <div
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={endInteraction}
            onMouseLeave={endInteraction}
            className={cn(
              'relative w-full select-none bg-background',
              tool === 'mover' ? 'cursor-move' : 'cursor-crosshair'
            )}
            style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
          >
            {active.items.map((item) =>
              item.kind === 'image' ? (
                <img
                  key={item.id}
                  src={item.src}
                  alt=""
                  loading="lazy"
                  onMouseDown={(e) => startDrag(e, item)}
                  className="absolute object-contain"
                  style={{
                    left: `${(item.x / CANVAS_W) * 100}%`,
                    top: `${(item.y / CANVAS_H) * 100}%`,
                    width: `${((item.width ?? 300) / CANVAS_W) * 100}%`,
                  }}
                />
              ) : (
                <span
                  key={item.id}
                  onMouseDown={(e) => startDrag(e, item)}
                  className="absolute rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground shadow-sm"
                  style={{
                    left: `${(item.x / CANVAS_W) * 100}%`,
                    top: `${(item.y / CANVAS_H) * 100}%`,
                  }}
                >
                  {item.text}
                </span>
              )
            )}
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="pointer-events-none absolute inset-0 h-full w-full"
            />
          </div>

          <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
            Dica: use <strong>Texto</strong> para nomear locais, <strong>Pincel</strong> para
            marcar caminhos, <strong>Mover</strong> para reposicionar e <strong>Salvar</strong>{' '}
            para guardar o palácio.
          </div>
        </div>
      )}

      {!active && palaces.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
          <Home className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p>Nenhum palácio da memória criado ainda</p>
          <p className="text-sm">Crie o primeiro para começar a associar lugares e conteúdos</p>
        </div>
      )}
    </div>
  );
}

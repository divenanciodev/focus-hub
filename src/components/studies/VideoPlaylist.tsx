import { useState } from 'react';
import { VideoLink } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  ExternalLink,
  Trash2,
  Edit2,
  Play,
  CheckCircle2,
  Circle,
  Loader2,
  StickyNote,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlaylistProps {
  videos: VideoLink[];
  onUpdateVideos: (videos: VideoLink[]) => void;
}

const getYouTubeThumbnail = (url: string): string => {
  try {
    const urlObj = new URL(url);
    let videoId = '';
    
    if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v') || '';
    } else if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1);
    }
    
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
  } catch {
    // Invalid URL
  }
  return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop';
};

const getVideoTitle = (url: string): string => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube')) {
      return 'Vídeo do YouTube';
    }
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'Vídeo';
  }
};

export function VideoPlaylist({ videos, onUpdateVideos }: VideoPlaylistProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoLink | null>(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);

  const handleOpenModal = (video?: VideoLink) => {
    if (video) {
      setEditingVideo(video);
      setUrl(video.url);
      setTitle(video.title);
      setNotes(video.notes);
    } else {
      setEditingVideo(null);
      setUrl('');
      setTitle('');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!url.trim()) return;

    const videoData: VideoLink = {
      id: editingVideo?.id || Date.now().toString(),
      url: url.trim(),
      title: title.trim() || getVideoTitle(url),
      thumbnail: getYouTubeThumbnail(url),
      status: editingVideo?.status || 'not_started',
      notes: notes.trim(),
    };

    if (editingVideo) {
      onUpdateVideos(videos.map(v => v.id === editingVideo.id ? videoData : v));
    } else {
      onUpdateVideos([...videos, videoData]);
    }

    setIsModalOpen(false);
    setUrl('');
    setTitle('');
    setNotes('');
    setEditingVideo(null);
  };

  const handleDelete = (id: string) => {
    onUpdateVideos(videos.filter(v => v.id !== id));
  };

  const handleStatusChange = (id: string, status: VideoLink['status']) => {
    onUpdateVideos(videos.map(v => v.id === id ? { ...v, status } : v));
  };

  const getStatusIcon = (status: VideoLink['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'in_progress':
        return <Loader2 className="w-4 h-4 text-warning" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: VideoLink['status']) => {
    switch (status) {
      case 'completed':
        return 'Visto';
      case 'in_progress':
        return 'Em andamento';
      default:
        return 'Não iniciado';
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => handleOpenModal()}>
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Vídeo
      </Button>

      {videos.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum vídeo adicionado ainda.</p>
          <p className="text-sm">Adicione vídeos do YouTube ou outras plataformas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-secondary/50 rounded-xl overflow-hidden border border-border hover:border-foreground/20 transition-all"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/90 text-black rounded-full p-3 hover:bg-white transition-colors"
                  >
                    <Play className="w-6 h-6" />
                  </a>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-sm text-foreground line-clamp-2">
                    {video.title}
                  </h4>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleOpenModal(video)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <Select
                    value={video.status}
                    onValueChange={(value) => handleStatusChange(video.id, value as VideoLink['status'])}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(video.status)}
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">
                        <div className="flex items-center gap-2">
                          <Circle className="w-3 h-3" />
                          Não iniciado
                        </div>
                      </SelectItem>
                      <SelectItem value="in_progress">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-3 h-3" />
                          Em andamento
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" />
                          Visto
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                {video.notes && (
                  <div className="space-y-1">
                    <button
                      onClick={() => setExpandedNotes(expandedNotes === video.id ? null : video.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <StickyNote className="w-3 h-3" />
                      {expandedNotes === video.id ? 'Ocultar notas' : 'Ver notas'}
                    </button>
                    {expandedNotes === video.id && (
                      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        {video.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Abrir vídeo
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingVideo ? 'Editar Vídeo' : 'Adicionar Vídeo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">URL do Vídeo</label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Título (opcional)</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do vídeo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Anotações</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Suas anotações sobre este vídeo..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!url.trim()}>
              {editingVideo ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
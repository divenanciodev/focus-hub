import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Trash2,
  Edit2,
  Target,
  Flame,
  Star,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TestedTopic {
  id: string;
  theme: string;
  topic: string;
  frequency: 'very_high' | 'high' | 'medium' | 'low';
  notes?: string;
}

interface MostTestedTopicsProps {
  topics: TestedTopic[];
  onUpdateTopics: (topics: TestedTopic[]) => void;
}

const frequencyConfig = {
  very_high: {
    label: 'Muito Alta',
    icon: <Flame className="w-4 h-4" />,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-l-red-500',
  },
  high: {
    label: 'Alta',
    icon: <Star className="w-4 h-4" />,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-l-amber-500',
  },
  medium: {
    label: 'Média',
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-l-blue-500',
  },
  low: {
    label: 'Baixa',
    icon: null,
    color: 'text-muted-foreground',
    bg: 'bg-muted/50',
    border: 'border-l-muted-foreground',
  },
};

export function MostTestedTopics({ topics, onUpdateTopics }: MostTestedTopicsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TestedTopic | null>(null);
  const [theme, setTheme] = useState('');
  const [topic, setTopic] = useState('');
  const [frequency, setFrequency] = useState<TestedTopic['frequency']>('medium');
  const [notes, setNotes] = useState('');

  const handleOpenModal = (topicItem?: TestedTopic) => {
    if (topicItem) {
      setEditingTopic(topicItem);
      setTheme(topicItem.theme);
      setTopic(topicItem.topic);
      setFrequency(topicItem.frequency);
      setNotes(topicItem.notes || '');
    } else {
      setEditingTopic(null);
      setTheme('');
      setTopic('');
      setFrequency('medium');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!theme.trim() || !topic.trim()) return;

    const topicData: TestedTopic = {
      id: editingTopic?.id || Date.now().toString(),
      theme: theme.trim(),
      topic: topic.trim(),
      frequency,
      notes: notes.trim() || undefined,
    };

    if (editingTopic) {
      onUpdateTopics(topics.map(t => t.id === editingTopic.id ? topicData : t));
    } else {
      onUpdateTopics([...topics, topicData]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTheme('');
    setTopic('');
    setFrequency('medium');
    setNotes('');
    setEditingTopic(null);
  };

  const handleDelete = (id: string) => {
    onUpdateTopics(topics.filter(t => t.id !== id));
  };

  // Group topics by theme
  const groupedTopics = topics.reduce((acc, topic) => {
    if (!acc[topic.theme]) {
      acc[topic.theme] = [];
    }
    acc[topic.theme].push(topic);
    return acc;
  }, {} as Record<string, TestedTopic[]>);

  // Get unique themes for autocomplete
  const existingThemes = [...new Set(topics.map(t => t.theme))];

  return (
    <div className="space-y-4">
      <Button onClick={() => handleOpenModal()}>
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Assunto
      </Button>

      {topics.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum assunto adicionado ainda.</p>
          <p className="text-sm">Adicione os assuntos mais cobrados organizados por tema.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTopics).map(([themeName, themeTopics]) => (
            <div key={themeName} className="space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                {themeName}
                <Badge variant="outline" className="text-xs">
                  {themeTopics.length} {themeTopics.length === 1 ? 'assunto' : 'assuntos'}
                </Badge>
              </h4>
              <div className="space-y-2 pl-6">
                {themeTopics
                  .sort((a, b) => {
                    const order = { very_high: 0, high: 1, medium: 2, low: 3 };
                    return order[a.frequency] - order[b.frequency];
                  })
                  .map((topicItem) => {
                    const config = frequencyConfig[topicItem.frequency];
                    return (
                      <div
                        key={topicItem.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border-l-4 transition-all hover:bg-secondary group',
                          config.border
                        )}
                      >
                        <div className={cn('flex items-center gap-2', config.color)}>
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">
                            {topicItem.topic}
                          </p>
                          {topicItem.notes && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {topicItem.notes}
                            </p>
                          )}
                        </div>
                        <Badge className={cn('text-xs', config.bg, config.color)} variant="secondary">
                          {config.label}
                        </Badge>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenModal(topicItem)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(topicItem.id)}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
              {editingTopic ? 'Editar Assunto' : 'Adicionar Assunto'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tema</label>
              <Input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex: Português, Matemática, Direito..."
                list="existing-themes"
              />
              <datalist id="existing-themes">
                {existingThemes.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Assunto</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Concordância Verbal, Regra de Três..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Frequência de Cobrança</label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as TestedTopic['frequency'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very_high">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-500" />
                      Muito Alta
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      Alta
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      Média
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      Baixa
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Observações (opcional)</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dicas ou observações sobre o assunto..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!theme.trim() || !topic.trim()}>
              {editingTopic ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

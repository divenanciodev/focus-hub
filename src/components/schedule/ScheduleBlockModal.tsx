import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScheduleBlock } from '@/types/schedule';
import { BookOpen, Dumbbell } from 'lucide-react';

const activityTypes = [
  'Estudo',
  'Revisão',
  'Simulado',
  'Exercícios',
  'Leitura',
  'Descanso',
  'Outro',
];

interface ScheduleBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block?: ScheduleBlock | null;
  onSave: (block: ScheduleBlock) => void;
  onDelete?: () => void;
}

export function ScheduleBlockModal({
  open,
  onOpenChange,
  block,
  onSave,
  onDelete,
}: ScheduleBlockModalProps) {
  const navigate = useNavigate();
  const [subject, setSubject] = useState(block?.subject || '');
  const [activityTypeSelection, setActivityTypeSelection] = useState(() => {
    if (!block?.activityType) return '';
    return activityTypes.includes(block.activityType) ? block.activityType : 'Outro';
  });
  const [customActivityType, setCustomActivityType] = useState(() => {
    if (!block?.activityType) return '';
    return activityTypes.includes(block.activityType) ? '' : block.activityType;
  });
  const [color, setColor] = useState(block?.color || '#3b82f6');
  const [duration, setDuration] = useState(block?.duration?.toString() || '60');

  const finalActivityType = activityTypeSelection === 'Outro' ? customActivityType : activityTypeSelection;

  useEffect(() => {
    if (open && block) {
      setSubject(block.subject || '');
      const isPreset = activityTypes.includes(block.activityType || '');
      setActivityTypeSelection(isPreset ? (block.activityType || '') : 'Outro');
      setCustomActivityType(isPreset ? '' : (block.activityType || ''));
      setColor(block.color || '#3b82f6');
      setDuration(block.duration?.toString() || '60');
    } else if (open && !block) {
      setSubject('');
      setActivityTypeSelection('');
      setCustomActivityType('');
      setColor('#3b82f6');
      setDuration('60');
    }
  }, [open, block]);

  const handleSave = () => {
    if (!subject.trim()) return;
    onSave({
      id: block?.id || Date.now().toString(),
      subject: subject.trim(),
      activityType: finalActivityType.trim() || 'Estudo',
      color,
      duration: parseInt(duration) || 60,
    });
    onOpenChange(false);
  };

  const handleNavigateToStudies = () => {
    onOpenChange(false);
    navigate('/estudos');
  };

  const handleNavigateToTraining = () => {
    onOpenChange(false);
    navigate('/treinos');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {block ? 'Editar Bloco' : 'Adicionar Bloco'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Matéria</Label>
            <Input
              id="subject"
              placeholder="Ex: Matemática, Português..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Atividade</Label>
            <Select value={activityTypeSelection} onValueChange={setActivityTypeSelection}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activityTypeSelection === 'Outro' && (
              <Input
                placeholder="Digite o tipo de atividade..."
                value={customActivityType}
                onChange={(e) => setCustomActivityType(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duração (minutos)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="180"
              step="15"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-12 rounded-full cursor-pointer border-0 p-0 overflow-hidden"
                style={{ 
                  WebkitAppearance: 'none',
                  appearance: 'none',
                }}
              />
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Clique para escolher</span>
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#000000"
                  className="w-28 h-8 text-xs font-mono"
                />
              </div>
              <div
                className="w-10 h-10 rounded-lg border border-border shadow-sm"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>

          {block && subject.trim() && (
            <div className="space-y-2 pt-2 border-t border-border">
              <Label>Navegação Rápida</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNavigateToStudies}
                  className="flex-1"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Ir para Estudos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNavigateToTraining}
                  className="flex-1"
                >
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Ir para Treinos
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {block && onDelete && (
            <Button variant="destructive" onClick={onDelete} className="mr-auto">
              Excluir
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!subject.trim()}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
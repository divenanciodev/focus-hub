import { useState } from 'react';
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
import { ScheduleBlock, activityTypes, subjectColors } from '@/types/schedule';
import { cn } from '@/lib/utils';

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
  const [subject, setSubject] = useState(block?.subject || '');
  const [activityType, setActivityType] = useState<ScheduleBlock['activityType']>(
    block?.activityType || 'study'
  );
  const [color, setColor] = useState(block?.color || subjectColors[0]);
  const [duration, setDuration] = useState(block?.duration?.toString() || '60');

  const handleSave = () => {
    if (!subject.trim()) return;
    onSave({
      id: block?.id || Date.now().toString(),
      subject: subject.trim(),
      activityType,
      color,
      duration: parseInt(duration) || 60,
    });
    onOpenChange(false);
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
            <Select value={activityType} onValueChange={(v) => setActivityType(v as ScheduleBlock['activityType'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <div className="flex flex-wrap gap-2">
              {subjectColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    color === c && "ring-2 ring-offset-2 ring-foreground"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
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

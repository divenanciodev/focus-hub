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
import { Schedule } from '@/types/schedule';

interface CreateScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (schedule: Omit<Schedule, 'id' | 'blocks'>) => void;
}

const objectives = [
  'ENEM',
  'Vestibular',
  'Concurso Público',
  'Faculdade',
  'Medicina',
  'OAB',
  'Outro',
];

export function CreateScheduleModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateScheduleModalProps) {
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('8');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [blockDuration, setBlockDuration] = useState('60');
  const [restDuration, setRestDuration] = useState('15');

  const handleSubmit = () => {
    if (!name.trim() || !objective) return;
    onSubmit({
      name: name.trim(),
      objective,
      hoursPerDay: parseInt(hoursPerDay),
      startTime,
      endTime,
      blockDuration: parseInt(blockDuration),
      restDuration: parseInt(restDuration),
    });
    onOpenChange(false);
    // Reset form
    setName('');
    setObjective('');
    setHoursPerDay('8');
    setStartTime('08:00');
    setEndTime('18:00');
    setBlockDuration('60');
    setRestDuration('15');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Cronograma de Estudos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Cronograma</Label>
            <Input
              id="name"
              placeholder="Ex: Meu Cronograma ENEM 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Objetivo</Label>
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o objetivo" />
              </SelectTrigger>
              <SelectContent>
                {objectives.map((obj) => (
                  <SelectItem key={obj} value={obj}>
                    {obj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Horário Inicial</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Horário Final</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="blockDuration">Tempo de Estudo (min)</Label>
              <Select value={blockDuration} onValueChange={setBlockDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1h30</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="restDuration">Tempo de Descanso (min)</Label>
              <Select value={restDuration} onValueChange={setRestDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutos</SelectItem>
                  <SelectItem value="10">10 minutos</SelectItem>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="20">20 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hoursPerDay">Horas por Dia</Label>
            <Input
              id="hoursPerDay"
              type="number"
              min="1"
              max="16"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !objective}>
            Criar Cronograma
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

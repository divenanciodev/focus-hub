import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

interface CreateTrainingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    discipline: string;
    subject: string;
    questionCount: number;
    timeMinutes: number;
  }) => void;
}

export function CreateTrainingModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateTrainingModalProps) {
  const [name, setName] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [subject, setSubject] = useState('');
  const [questionCount, setQuestionCount] = useState('10');
  const [timeMinutes, setTimeMinutes] = useState('30');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && discipline && subject) {
      onSubmit({
        name,
        discipline,
        subject,
        questionCount: parseInt(questionCount),
        timeMinutes: parseInt(timeMinutes),
      });
      setName('');
      setDiscipline('');
      setSubject('');
      setQuestionCount('10');
      setTimeMinutes('30');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Treino</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do treino</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Treino de Constitucional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discipline">Disciplina</Label>
            <Select value={discipline} onValueChange={setDiscipline}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a disciplina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Direito Constitucional">Direito Constitucional</SelectItem>
                <SelectItem value="Português">Português</SelectItem>
                <SelectItem value="Matemática Financeira">Matemática Financeira</SelectItem>
                <SelectItem value="Raciocínio Lógico">Raciocínio Lógico</SelectItem>
                <SelectItem value="Informática">Informática</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Princípios Fundamentais"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="questionCount">Questões</Label>
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeMinutes">Tempo (min)</Label>
              <Select value={timeMinutes} onValueChange={setTimeMinutes}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="45">45</SelectItem>
                  <SelectItem value="60">60</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name || !discipline || !subject}>
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

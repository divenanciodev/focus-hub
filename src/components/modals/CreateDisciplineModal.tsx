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

interface CreateDisciplineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; subject: string; grade: string }) => void;
}

export function CreateDisciplineModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateDisciplineModalProps) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && subject && grade) {
      onSubmit({ name, subject, grade });
      setName('');
      setSubject('');
      setGrade('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Disciplina</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da disciplina</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Direito Constitucional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o assunto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Direito">Direito</SelectItem>
                <SelectItem value="Línguas">Línguas</SelectItem>
                <SelectItem value="Exatas">Exatas</SelectItem>
                <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                <SelectItem value="Conhecimentos Gerais">Conhecimentos Gerais</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade">Grau de escolaridade</Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o grau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fundamental">Fundamental</SelectItem>
                <SelectItem value="Médio">Médio</SelectItem>
                <SelectItem value="Superior">Superior</SelectItem>
                <SelectItem value="Pós-graduação">Pós-graduação</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name || !subject || !grade}>
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

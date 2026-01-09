import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BankSubfolder } from '@/types/linkBank';

interface CreateSubfolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (subfolder: Omit<BankSubfolder, 'id' | 'links' | 'createdAt'>) => void;
  editingSubfolder?: BankSubfolder | null;
}

export function CreateSubfolderModal({ open, onOpenChange, onSubmit, editingSubfolder }: CreateSubfolderModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingSubfolder) {
      setName(editingSubfolder.name);
      setDescription(editingSubfolder.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [editingSubfolder, open]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingSubfolder ? 'Editar Subpasta' : 'Nova Subpasta'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da subpasta *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Criação de Logos"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo desta subpasta..."
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={!name.trim()}>
              {editingSubfolder ? 'Salvar' : 'Criar Subpasta'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

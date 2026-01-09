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
import { BankLink } from '@/types/linkBank';

interface CreateLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (link: Omit<BankLink, 'id' | 'createdAt'>) => void;
  editingLink?: BankLink | null;
}

export function CreateLinkModal({ open, onOpenChange, onSubmit, editingLink }: CreateLinkModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (editingLink) {
      setName(editingLink.name);
      setUrl(editingLink.url);
      setDescription(editingLink.description || '');
      setImageUrl(editingLink.imageUrl || '');
    } else {
      setName('');
      setUrl('');
      setDescription('');
      setImageUrl('');
    }
  }, [editingLink, open]);

  const handleSubmit = () => {
    if (!name.trim() || !url.trim()) return;
    
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    onSubmit({ 
      name: name.trim(), 
      url: finalUrl, 
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingLink ? 'Editar Link' : 'Novo Link'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do link *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Canva - Criar Logos"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.canva.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Para que serve este link..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL da imagem (opcional)</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              Se não informar, será usado o ícone do site automaticamente
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={!name.trim() || !url.trim()}>
              {editingLink ? 'Salvar' : 'Adicionar Link'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

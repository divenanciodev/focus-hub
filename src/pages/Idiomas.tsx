import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Languages, Trash2, Edit2, ChevronRight } from 'lucide-react';
import { useLanguages } from '@/hooks/useLanguages';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

const EMOJI_OPTIONS = ['🇺🇸', '🇬🇧', '🇪🇸', '🇫🇷', '🇩🇪', '🇮🇹', '🇯🇵', '🇨🇳', '🇰🇷', '🇧🇷', '🇵🇹', '🌐'];

export default function Idiomas() {
  const navigate = useNavigate();
  const { languages, loading, addLanguage, updateLanguage, deleteLanguage } = useLanguages();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    icon: '🌐',
    category: '',
    objective: '',
  });

  const resetForm = () => {
    setFormData({ name: '', icon: '🌐', category: '', objective: '' });
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    
    await addLanguage({
      name: formData.name,
      icon: formData.icon,
      category: formData.category || undefined,
      objective: formData.objective || undefined,
      color: '#000000',
      isActive: true,
      sortOrder: languages.length,
    });
    
    resetForm();
    setCreateModalOpen(false);
  };

  const handleEdit = async () => {
    if (!selectedLanguage || !formData.name.trim()) return;
    
    await updateLanguage(selectedLanguage, {
      name: formData.name,
      icon: formData.icon,
      category: formData.category || undefined,
      objective: formData.objective || undefined,
    });
    
    resetForm();
    setEditModalOpen(false);
    setSelectedLanguage(null);
  };

  const openEditModal = (lang: typeof languages[0]) => {
    setSelectedLanguage(lang.id);
    setFormData({
      name: lang.name,
      icon: lang.icon,
      category: lang.category || '',
      objective: lang.objective || '',
    });
    setEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este idioma e todo seu conteúdo?')) {
      await deleteLanguage(id);
    }
  };

  const handleOpenLanguage = (id: string) => {
    navigate(`/idiomas/${id}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title="Idiomas" 
        description="Aprenda idiomas através de estruturas práticas e fluência oral"
      />

      <div className="flex justify-end mb-6">
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setCreateModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Idioma
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Idioma</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Ícone</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className={cn(
                        'w-10 h-10 text-xl rounded-lg border-2 transition-all',
                        formData.icon === emoji
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="name">Nome do Idioma *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Inglês"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: English Speaking Basics"
                />
              </div>
              <div>
                <Label htmlFor="objective">Objetivo</Label>
                <Input
                  id="objective"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  placeholder="Ex: Fluência oral através de sentence patterns"
                />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!formData.name.trim()}>
                Criar Idioma
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {languages.length === 0 ? (
        <EmptyState
          icon={<Languages className="w-12 h-12 text-muted-foreground" />}
          title="Nenhum idioma cadastrado"
          description="Adicione seu primeiro idioma para começar a estudar"
          action={
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Idioma
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {languages.map((lang) => (
            <Card
              key={lang.id}
              className="group cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleOpenLanguage(lang.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{lang.icon}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{lang.name}</h3>
                      {lang.category && (
                        <p className="text-sm text-muted-foreground">{lang.category}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(lang);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(lang.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                {lang.objective && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{lang.objective}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Idioma</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Ícone</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={cn(
                      'w-10 h-10 text-xl rounded-lg border-2 transition-all',
                      formData.icon === emoji
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-name">Nome do Idioma *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Categoria</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-objective">Objetivo</Label>
              <Input
                id="edit-objective"
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              />
            </div>
            <Button onClick={handleEdit} className="w-full" disabled={!formData.name.trim()}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

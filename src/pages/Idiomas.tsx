import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Languages, Trash2, Edit2 } from 'lucide-react';
import { useLanguages } from '@/hooks/useLanguages';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { LanguagePanel } from '@/components/languages/LanguagePanel';
import type { Language } from '@/types/languages';

const EMOJI_OPTIONS = ['🇺🇸', '🇬🇧', '🇪🇸', '🇫🇷', '🇩🇪', '🇮🇹', '🇯🇵', '🇨🇳', '🇰🇷', '🇧🇷', '🇵🇹', '🌐'];

export default function Idiomas() {
  const { languages, loading, addLanguage, updateLanguage, deleteLanguage, refetch } = useLanguages();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | null>(null);
  const [openLanguage, setOpenLanguage] = useState<Language | null>(null);
  
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
    if (!selectedLanguageId || !formData.name.trim()) return;
    
    await updateLanguage(selectedLanguageId, {
      name: formData.name,
      icon: formData.icon,
      category: formData.category || undefined,
      objective: formData.objective || undefined,
    });
    
    resetForm();
    setEditModalOpen(false);
    setSelectedLanguageId(null);
  };

  const openEditModal = (lang: Language, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLanguageId(lang.id);
    setFormData({
      name: lang.name,
      icon: lang.icon,
      category: lang.category || '',
      objective: lang.objective || '',
    });
    setEditModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este idioma e todo seu conteúdo?')) {
      await deleteLanguage(id);
    }
  };

  const handleOpenLanguage = (lang: Language) => {
    setOpenLanguage(lang);
  };

  const handleClosePanel = () => {
    setOpenLanguage(null);
  };

  const handlePanelUpdate = () => {
    refetch();
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
              className="group cursor-pointer hover:shadow-md transition-shadow hover:border-primary/50"
              onClick={() => handleOpenLanguage(lang)}
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
                      onClick={(e) => openEditModal(lang, e)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => handleDelete(lang.id, e)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

      {/* Language Panel */}
      {openLanguage && (
        <LanguagePanel
          language={openLanguage}
          onClose={handleClosePanel}
          onUpdate={handlePanelUpdate}
        />
      )}
    </MainLayout>
  );
}

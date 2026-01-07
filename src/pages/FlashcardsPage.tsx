import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlashcardGroup } from '@/types/flashcards';
import { FlashcardCreator } from '@/components/flashcards/FlashcardCreator';
import { FlashcardGroupList } from '@/components/flashcards/FlashcardGroupList';
import { FlashcardPractice } from '@/components/flashcards/FlashcardPractice';
import { Plus, PenTool, Play, Layers } from 'lucide-react';
import { toast } from 'sonner';

export default function FlashcardsPage() {
  const [activeTab, setActiveTab] = useState<'criar' | 'praticar'>('praticar');
  const [groups, setGroups] = useState<FlashcardGroup[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FlashcardGroup | undefined>();
  const [studyingGroup, setStudyingGroup] = useState<FlashcardGroup | null>(null);

  const handleSaveGroup = (group: FlashcardGroup) => {
    if (editingGroup) {
      setGroups(groups.map(g => g.id === group.id ? group : g));
    } else {
      setGroups([group, ...groups]);
    }
    setIsCreating(false);
    setEditingGroup(undefined);
    setActiveTab('praticar');
  };

  const handleEditGroup = (group: FlashcardGroup) => {
    setEditingGroup(group);
    setIsCreating(true);
    setActiveTab('criar');
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
    toast.success('Grupo de flashcards excluído');
  };

  const handleStudyComplete = () => {
    if (studyingGroup) {
      setGroups(groups.map(g => 
        g.id === studyingGroup.id 
          ? { ...g, lastStudied: new Date() }
          : g
      ));
    }
    setStudyingGroup(null);
  };

  // Practice mode
  if (studyingGroup) {
    return (
      <FlashcardPractice
        group={studyingGroup}
        onClose={() => setStudyingGroup(null)}
        onComplete={handleStudyComplete}
      />
    );
  }

  // Creation mode
  if (isCreating) {
    return (
      <div className="fade-in">
        <FlashcardCreator
          onSave={handleSaveGroup}
          onCancel={() => {
            setIsCreating(false);
            setEditingGroup(undefined);
          }}
          editingGroup={editingGroup}
        />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Flashcards"
        description="Crie e pratique com cartões de memorização interativos"
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'criar' | 'praticar')} className="mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="praticar" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Praticar ({groups.length})
          </TabsTrigger>
          <TabsTrigger value="criar" className="flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Criar
          </TabsTrigger>
        </TabsList>

        {/* TAB: Praticar */}
        <TabsContent value="praticar" className="mt-6">
          {groups.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum grupo de flashcards
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Crie seu primeiro grupo de flashcards para começar a estudar
              </p>
              <Button onClick={() => { setActiveTab('criar'); setIsCreating(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Flashcards
              </Button>
            </div>
          ) : (
            <FlashcardGroupList
              groups={groups}
              onStudy={setStudyingGroup}
              onEdit={handleEditGroup}
              onDelete={handleDeleteGroup}
            />
          )}
        </TabsContent>

        {/* TAB: Criar */}
        <TabsContent value="criar" className="mt-6">
          <div className="text-center py-16 border border-dashed border-border rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <PenTool className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Criar Novo Grupo de Flashcards
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Organize seus cartões de estudo em grupos por tema ou disciplina
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Flashcards
            </Button>
          </div>

          {/* Existing groups for reference */}
          {groups.length > 0 && (
            <div className="mt-8">
              <h3 className="font-medium text-foreground mb-4">Grupos existentes</h3>
              <FlashcardGroupList
                groups={groups}
                onStudy={setStudyingGroup}
                onEdit={handleEditGroup}
                onDelete={handleDeleteGroup}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}


import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { CreateDisciplineModalEnhanced } from '@/components/modals/CreateDisciplineModalEnhanced';
import { DisciplineSearch } from '@/components/studies/DisciplineSearch';
import { useDisciplines } from '@/contexts/DisciplinesContext';
import { Discipline, StudyPlan } from '@/types';
import { Plus, BookOpen, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SearchFilters {
  query: string;
  color: string | null;
  days: string[];
  hoursRange: string | null;
}

export default function Estudos() {
  const navigate = useNavigate();
  const { disciplines, addDiscipline, updateDiscipline, deleteDiscipline } = useDisciplines();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [disciplineToDelete, setDisciplineToDelete] = useState<Discipline | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    color: null,
    days: [],
    hoursRange: null,
  });

  const handleCreateDiscipline = (data: {
    name: string;
    subject: string;
    specificSubject: string;
    grade: string;
    tags: string[];
    color: string;
    studyPlan: StudyPlan;
  }) => {
    addDiscipline(data);
  };

  const handleEditDiscipline = (data: {
    name: string;
    subject: string;
    specificSubject: string;
    grade: string;
    tags: string[];
    color: string;
    studyPlan: StudyPlan;
  }) => {
    if (editingDiscipline) {
      updateDiscipline(editingDiscipline.id, data);
      toast.success('Disciplina atualizada com sucesso!');
      setEditingDiscipline(null);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, discipline: Discipline) => {
    e.stopPropagation();
    setDisciplineToDelete(discipline);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, discipline: Discipline) => {
    e.stopPropagation();
    setEditingDiscipline(discipline);
    setIsEditModalOpen(true);
  };

  const confirmDelete = () => {
    if (disciplineToDelete) {
      deleteDiscipline(disciplineToDelete.id);
      toast.success('Disciplina excluída com sucesso!');
      setDisciplineToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  // Collect all tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    disciplines.forEach(d => {
      d.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [disciplines]);

  // Filter disciplines
  const filteredDisciplines = useMemo(() => {
    return disciplines.filter(d => {
      // Query filter (name, subject, specificSubject, tags)
      if (searchFilters.query) {
        const queryLower = searchFilters.query.toLowerCase();
        const matchesName = d.name.toLowerCase().includes(queryLower);
        const matchesSubject = d.subject.toLowerCase().includes(queryLower);
        const matchesSpecific = d.specificSubject?.toLowerCase().includes(queryLower);
        const matchesTags = d.tags?.some(tag => tag.toLowerCase().includes(queryLower));
        
        if (!matchesName && !matchesSubject && !matchesSpecific && !matchesTags) {
          return false;
        }
      }

      // Color filter
      if (searchFilters.color && d.color !== searchFilters.color) {
        return false;
      }

      // Days filter
      if (searchFilters.days.length > 0 && d.studyPlan) {
        const hasDays = searchFilters.days.some(day => d.studyPlan?.days.includes(day));
        if (!hasDays) return false;
      }

      // Hours range filter
      if (searchFilters.hoursRange && d.studyPlan) {
        const hours = d.studyPlan.hoursPerDay;
        if (searchFilters.hoursRange === '1-2' && (hours < 1 || hours > 2)) return false;
        if (searchFilters.hoursRange === '2-4' && (hours < 2 || hours > 4)) return false;
        if (searchFilters.hoursRange === '4+' && hours < 4) return false;
      }

      return true;
    });
  }, [disciplines, searchFilters]);


  return (
    <div className="fade-in">
      <PageHeader
        title="Estudos"
        description="Gerencie suas disciplinas e materiais de estudo"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar disciplina
          </Button>
        }
      />

      {/* Search & Filters */}
      <div className="mb-6">
        <DisciplineSearch onSearch={setSearchFilters} allTags={allTags} />
      </div>

      {disciplines.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhuma disciplina cadastrada"
          description="Comece criando sua primeira disciplina para organizar seus estudos."
          actionLabel="Criar disciplina"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : filteredDisciplines.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhuma disciplina encontrada com os filtros aplicados.</p>
          <Button variant="link" onClick={() => setSearchFilters({ query: '', color: null, days: [], hoursRange: null })}>
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDisciplines.map((discipline) => (
            <div
              key={discipline.id}
              onClick={() => navigate(`/estudos/${discipline.id}`)}
              className="bg-card border-2 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
              style={{
                borderColor: discipline.color || 'var(--border)',
              }}
            >
              {/* Image placeholder */}
              <div 
                className="h-32 w-full flex items-center justify-center"
                style={{
                  backgroundColor: discipline.color ? `${discipline.color}15` : 'hsl(var(--secondary))',
                }}
              >
                <BookOpen 
                  className="w-12 h-12 opacity-30" 
                  style={{ color: discipline.color || 'currentColor' }}
                />
              </div>

              <div className="p-4">
                {/* Header with name and actions */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground line-clamp-2">{discipline.name}</h3>
                  
                  {/* Edit/Delete buttons - visible on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                    <button
                      onClick={(e) => handleEditClick(e, discipline)}
                      className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, discipline)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <ProgressBar value={discipline.progress} showLabel color={discipline.color} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateDisciplineModalEnhanced
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateDiscipline}
      />

      {/* Edit Modal */}
      <CreateDisciplineModalEnhanced
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setEditingDiscipline(null);
        }}
        onSubmit={handleEditDiscipline}
        initialData={editingDiscipline || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir disciplina?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A disciplina "{disciplineToDelete?.name}" e todos os seus dados serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateDisciplineModalEnhanced } from '@/components/modals/CreateDisciplineModalEnhanced';
import { DisciplineSearch } from '@/components/studies/DisciplineSearch';
import { mockDisciplines } from '@/data/mockData';
import { Discipline, StudyPlan } from '@/types';
import { Plus, BookOpen, Clock, TrendingUp, Calendar } from 'lucide-react';
import { weekDays } from '@/types/schedule';

interface SearchFilters {
  query: string;
  color: string | null;
  days: string[];
  hoursRange: string | null;
}

export default function Estudos() {
  const navigate = useNavigate();
  const [disciplines, setDisciplines] = useState<Discipline[]>(mockDisciplines);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
    const newDiscipline: Discipline = {
      id: Date.now().toString(),
      name: data.name,
      subject: data.subject,
      specificSubject: data.specificSubject,
      grade: data.grade,
      progress: 0,
      hoursStudied: 0,
      createdAt: new Date(),
      tags: data.tags,
      color: data.color,
      studyPlan: data.studyPlan,
    };
    setDisciplines([newDiscipline, ...disciplines]);
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

  const getStudyDaysLabel = (days: string[]) => {
    if (days.length === 7) return 'Todos os dias';
    if (days.length === 0) return 'Sem dias definidos';
    return days.map(d => weekDays.find(wd => wd.key === d)?.label.slice(0, 3)).join(', ');
  };

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
              className="bg-card border-2 rounded-xl p-5 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: discipline.color || 'var(--border)',
                backgroundColor: discipline.color ? `${discipline.color}08` : undefined,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  {/* Hierarchy */}
                  <p className="text-xs text-muted-foreground mb-1">
                    {discipline.subject}
                    {discipline.specificSubject && ` > ${discipline.specificSubject}`}
                  </p>
                  <h3 className="font-semibold text-foreground truncate">{discipline.name}</h3>
                </div>
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded ml-2 flex-shrink-0">
                  {discipline.grade}
                </span>
              </div>

              {/* Tags */}
              {discipline.tags && discipline.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {discipline.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {discipline.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{discipline.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <ProgressBar value={discipline.progress} showLabel color={discipline.color} />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{discipline.hoursStudied}h estudadas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{discipline.progress}%</span>
                  </div>
                </div>

                {/* Study Plan Info */}
                {discipline.studyPlan && discipline.studyPlan.days.length > 0 && (
                  <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>📅 {getStudyDaysLabel(discipline.studyPlan.days)}</span>
                      <span>{discipline.studyPlan.hoursPerDay}h/dia</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateDisciplineModalEnhanced
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateDiscipline}
      />
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useContests, Contest } from '@/hooks/useContests';
import { useSimulados } from '@/hooks/useSimulados';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Calendar,
  Building2,
  Target,
  Search,
  Play,
  Pencil,
  Trash2,
  Loader2,
  FileQuestion,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/empty-state';

export default function Concursos() {
  const navigate = useNavigate();
  const { contests, loading, addContest, updateContest, deleteContest } = useContests();
  const { simulados, loading: loadingSimulados } = useSimulados();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Form state
  const [newContest, setNewContest] = useState({
    name: '',
    position: '',
    institution: '',
    examDate: '',
  });

  const handleCreateContest = async () => {
    if (newContest.name && newContest.position && newContest.examDate) {
      if (editingContest) {
        await updateContest(editingContest.id, {
          name: newContest.name,
          position: newContest.position,
          institution: newContest.institution,
          examDate: new Date(newContest.examDate),
        });
        toast.success('Concurso atualizado!');
      } else {
        await addContest({
          name: newContest.name,
          position: newContest.position,
          institution: newContest.institution,
          examDate: new Date(newContest.examDate),
          status: 'active',
        });
        toast.success('Concurso criado!');
      }
      setNewContest({ name: '', position: '', institution: '', examDate: '' });
      setEditingContest(null);
      setIsCreateModalOpen(false);
    }
  };

  const handleEditContest = (contest: Contest) => {
    setEditingContest(contest);
    setNewContest({
      name: contest.name,
      position: contest.position || '',
      institution: contest.institution || '',
      examDate: contest.examDate ? contest.examDate.toISOString().split('T')[0] : '',
    });
    setIsCreateModalOpen(true);
  };

  const handleDeleteContest = async (contestId: string) => {
    await deleteContest(contestId);
    toast.success('Concurso excluído!');
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingContest(null);
    setNewContest({ name: '', position: '', institution: '', examDate: '' });
  };

  // Filter simulados based on search and difficulty
  const filteredSimulados = simulados.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.discipline?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesDifficulty = difficultyFilter === 'all' || s.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diff = new Date(date).getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Concursos"
        description="Gerencie seus concursos e acesse simulados"
      />

      <Tabs defaultValue="meus" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="meus">Meus Concursos</TabsTrigger>
          <TabsTrigger value="banco">Banco de Simulados</TabsTrigger>
        </TabsList>

        <TabsContent value="meus" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo concurso
            </Button>
          </div>

          {contests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum concurso cadastrado</p>
              <p className="text-sm">Clique em "Novo concurso" para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contests.map((contest) => {
                const daysUntil = contest.examDate ? getDaysUntil(contest.examDate) : 0;
                const isPast = daysUntil < 0;

                return (
                  <div
                    key={contest.id}
                    className="bg-card border border-border rounded-xl p-6 hover:border-foreground/20 hover:shadow-md transition-all duration-200 flex flex-col h-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-semibold text-foreground text-lg">{contest.name}</h3>
                        <p className="text-sm text-muted-foreground">{contest.position}</p>
                      </div>
                      <span className={cn(
                        'text-xs px-2.5 py-1 rounded-full font-medium shrink-0',
                        isPast
                          ? 'bg-muted text-muted-foreground'
                          : daysUntil <= 30
                            ? 'bg-warning/10 text-warning'
                            : 'bg-success/10 text-success'
                      )}>
                        {isPast ? 'Realizado' : `${daysUntil} dias`}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 shrink-0" />
                        <span className="truncate">{contest.institution || 'Não informado'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>{contest.examDate ? formatDate(contest.examDate) : 'Não informado'}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium text-foreground">0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>

                    {/* Spacer to push buttons to bottom */}
                    <div className="flex-1" />

                    {/* Action Buttons - Fixed at bottom */}
                    <div className="pt-4 border-t border-border flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-none"
                        onClick={() => handleEditContest(contest)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-none text-destructive hover:text-destructive"
                        onClick={() => handleDeleteContest(contest.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Cronograma
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => navigate('/treinos')}>
                        <Target className="w-4 h-4 mr-1" />
                        Treinos
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="banco" className="mt-0">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar simulados..."
                className="pl-9"
              />
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loadingSimulados ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSimulados.length === 0 ? (
            <EmptyState
              icon={FileQuestion}
              title="Nenhum simulado encontrado"
              description="Crie simulados na página de Treinos para praticá-los aqui"
              actionLabel="Ir para Treinos"
              onAction={() => navigate('/treinos')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSimulados.map((simulado) => (
                <div
                  key={simulado.id}
                  className="bg-card border border-border rounded-xl p-6 hover:border-foreground/20 hover:shadow-md transition-all duration-200 flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-semibold text-foreground">{simulado.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{simulado.discipline || 'Geral'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                      {simulado.questions.length} questões
                    </span>
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                      {simulado.timeMinutes} min
                    </span>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded',
                      simulado.difficulty === 'easy' && 'bg-success/10 text-success',
                      simulado.difficulty === 'medium' && 'bg-warning/10 text-warning',
                      simulado.difficulty === 'hard' && 'bg-destructive/10 text-destructive'
                    )}>
                      {simulado.difficulty === 'easy' ? 'Fácil' : simulado.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                    </span>
                  </div>

                  <div className="flex-1" />

                  <div className="pt-4 border-t border-border">
                    <Button size="sm" className="w-full" onClick={() => navigate(`/treinos/${simulado.id}`)}>
                      <Play className="w-4 h-4 mr-2" />
                      Resolver simulado
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Contest Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingContest ? 'Editar Concurso' : 'Novo Concurso'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do concurso</Label>
              <Input
                value={newContest.name}
                onChange={(e) => setNewContest({ ...newContest, name: e.target.value })}
                placeholder="Ex: Concurso TRT-SP"
              />
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input
                value={newContest.position}
                onChange={(e) => setNewContest({ ...newContest, position: e.target.value })}
                placeholder="Ex: Analista Judiciário"
              />
            </div>
            <div className="space-y-2">
              <Label>Instituição</Label>
              <Input
                value={newContest.institution}
                onChange={(e) => setNewContest({ ...newContest, institution: e.target.value })}
                placeholder="Ex: TRT"
              />
            </div>
            <div className="space-y-2">
              <Label>Data da prova</Label>
              <Input
                type="date"
                value={newContest.examDate}
                onChange={(e) => setNewContest({ ...newContest, examDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleCreateContest}>
              {editingContest ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

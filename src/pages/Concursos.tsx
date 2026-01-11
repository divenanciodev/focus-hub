import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useContests, Contest, ContestMateria, EvaluationCriteria } from '@/hooks/useContests';
import { useSimulados } from '@/hooks/useSimulados';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContestMateriasEditor } from '@/components/concursos/ContestMateriasEditor';
import { EvaluationCriteriaEditor } from '@/components/concursos/EvaluationCriteriaEditor';
import { EditalUpload } from '@/components/concursos/EditalUpload';
import { SimuladoQuestionsEditor } from '@/components/concursos/SimuladoQuestionsEditor';
import { SimuladoQuestion } from '@/types/training';
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
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
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

// Formata valor para moeda brasileira
const formatCurrency = (value: string): string => {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  
  // Converte para centavos e formata
  const amount = parseInt(numbers, 10);
  const formatted = (amount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  
  return formatted;
};

// Remove formatação para salvar apenas números
const parseCurrency = (value: string): string => {
  return value.replace(/\D/g, '');
};

interface NewContestForm {
  name: string;
  position: string;
  institution: string;
  examDate: string;
  isPreparingOnly: boolean;
  bancaUrl: string;
  editalUrl: string;
  situacao: string;
  cargos: string;
  escolaridade: string;
  carreiras: string;
  lotacao: string;
  vagas: string;
  remuneracao: string;
  inscricoesPeriodo: string;
  taxaInscricao: string;
  materias: ContestMateria[];
  evaluationCriteria: EvaluationCriteria[];
  simuladoQuestions: SimuladoQuestion[];
  simuladoTimeMinutes: number;
  existingSimuladoId?: string;
}

const INITIAL_FORM: NewContestForm = {
  name: '',
  position: '',
  institution: '',
  examDate: '',
  isPreparingOnly: false,
  bancaUrl: '',
  editalUrl: '',
  situacao: '',
  cargos: '',
  escolaridade: '',
  carreiras: '',
  lotacao: '',
  vagas: '',
  remuneracao: '',
  inscricoesPeriodo: '',
  taxaInscricao: '',
  materias: [],
  evaluationCriteria: [],
  simuladoQuestions: [],
  simuladoTimeMinutes: 60,
};

export default function Concursos() {
  const navigate = useNavigate();
  const { contests, loading, addContest, updateContest, deleteContest } = useContests();
  const { simulados, loading: loadingSimulados, addSimulado, updateSimulado } = useSimulados();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1);

  // Form state
  const [newContest, setNewContest] = useState<NewContestForm>(INITIAL_FORM);

  const toggleCardExpanded = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateContest = async () => {
    if (!newContest.name || !newContest.position) {
      toast.error('Preencha nome e cargo');
      return;
    }

    if (!newContest.isPreparingOnly && !newContest.examDate) {
      toast.error('Informe a data da prova ou marque como "preparação"');
      return;
    }

    const contestData = {
      name: newContest.name,
      position: newContest.position,
      institution: newContest.institution,
      examDate: newContest.examDate ? new Date(newContest.examDate) : null,
      status: 'active' as const,
      isPreparingOnly: newContest.isPreparingOnly,
      bancaUrl: newContest.bancaUrl || undefined,
      editalUrl: newContest.editalUrl || undefined,
      situacao: newContest.situacao || undefined,
      cargos: newContest.cargos || undefined,
      escolaridade: newContest.escolaridade || undefined,
      carreiras: newContest.carreiras || undefined,
      lotacao: newContest.lotacao || undefined,
      vagas: newContest.vagas || undefined,
      remuneracao: newContest.remuneracao || undefined,
      inscricoesPeriodo: newContest.inscricoesPeriodo || undefined,
      taxaInscricao: newContest.taxaInscricao || undefined,
      materias: newContest.materias,
      evaluationCriteria: newContest.evaluationCriteria,
    };

    if (editingContest) {
      await updateContest(editingContest.id, contestData);
    } else {
      await addContest(contestData);
    }

    // Create or update simulado if there are questions
    if (newContest.simuladoQuestions.length > 0) {
      // Filter questions that have at least the statement filled
      const validQuestions = newContest.simuladoQuestions.filter(
        (q) => q.statement?.trim()
      );

      if (validQuestions.length > 0) {
        // Ensure each question has proper structure
        const processedQuestions = validQuestions.map((q) => ({
          ...q,
          options: q.options?.filter((o) => o.trim()) || [],
        }));

        const simuladoData = {
          name: `Simulado - ${newContest.name}`,
          discipline: newContest.position,
          subject: newContest.institution || 'Geral',
          questions: processedQuestions,
          timeMinutes: newContest.simuladoTimeMinutes || 60,
          difficulty: 'medium' as const,
          status: 'pending' as const,
        };

        // If editing an existing simulado, update it instead of creating a new one
        if (newContest.existingSimuladoId) {
          const success = await updateSimulado(newContest.existingSimuladoId, simuladoData);
          if (success) {
            toast.success(`Simulado atualizado com ${processedQuestions.length} questões!`);
          }
        } else {
          const result = await addSimulado(simuladoData);
          if (result) {
            toast.success(`Simulado criado com ${processedQuestions.length} questões!`);
          }
        }
      } else {
        toast.warning('Nenhuma questão válida para criar simulado. Preencha o enunciado.');
      }
    }

    setNewContest(INITIAL_FORM);
    setEditingContest(null);
    setIsCreateModalOpen(false);
    setModalStep(1);
  };

  const handleEditContest = (contest: Contest) => {
    setEditingContest(contest);
    
    // Find existing simulado for this contest
    const existingSimulado = simulados.find(
      (s) => s.name === `Simulado - ${contest.name}`
    );
    
    setNewContest({
      name: contest.name,
      position: contest.position || '',
      institution: contest.institution || '',
      examDate: contest.examDate ? contest.examDate.toISOString().split('T')[0] : '',
      isPreparingOnly: contest.isPreparingOnly,
      bancaUrl: contest.bancaUrl || '',
      editalUrl: contest.editalUrl || '',
      situacao: contest.situacao || '',
      cargos: contest.cargos || '',
      escolaridade: contest.escolaridade || '',
      carreiras: contest.carreiras || '',
      lotacao: contest.lotacao || '',
      vagas: contest.vagas || '',
      remuneracao: contest.remuneracao || '',
      inscricoesPeriodo: contest.inscricoesPeriodo || '',
      taxaInscricao: contest.taxaInscricao || '',
      materias: contest.materias || [],
      evaluationCriteria: contest.evaluationCriteria || [],
      simuladoQuestions: existingSimulado?.questions || [],
      simuladoTimeMinutes: existingSimulado?.timeMinutes || 60,
      existingSimuladoId: existingSimulado?.id,
    });
    setIsCreateModalOpen(true);
    setModalStep(1);
  };

  const handleDeleteContest = async (contestId: string) => {
    await deleteContest(contestId);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingContest(null);
    setNewContest(INITIAL_FORM);
    setModalStep(1);
  };

  const handleNextStep = () => {
    if (modalStep === 1) {
      if (!newContest.name || !newContest.position) {
        toast.error('Preencha nome e cargo antes de continuar');
        return;
      }
      if (!newContest.isPreparingOnly && !newContest.examDate) {
        toast.error('Informe a data da prova ou marque como "preparação"');
        return;
      }
      setModalStep(2);
    } else if (modalStep === 2) {
      setModalStep(3);
    }
  };

  const handlePrevStep = () => {
    if (modalStep === 2) {
      setModalStep(1);
    } else if (modalStep === 3) {
      setModalStep(2);
    }
  };

  // Filter simulados based on search and difficulty
  const filteredSimulados = simulados.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const getDaysUntil = (date: Date | null) => {
    if (!date) return null;
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
      <PageHeader title="Concursos" description="Gerencie seus concursos e acesse simulados" />

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
            <div className="space-y-3">
              {contests.map((contest) => {
                const daysUntil = getDaysUntil(contest.examDate);
                const isPast = daysUntil !== null && daysUntil < 0;

                return (
                  <div
                    key={contest.id}
                    className="bg-card border border-border rounded-lg p-4 hover:border-foreground/20 transition-all duration-200 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">{contest.name}</h3>
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-medium',
                            contest.isPreparingOnly
                              ? 'bg-primary/10 text-primary'
                              : isPast
                                ? 'bg-muted text-muted-foreground'
                                : daysUntil !== null && daysUntil <= 30
                                  ? 'bg-warning/10 text-warning'
                                  : 'bg-success/10 text-success'
                          )}
                        >
                          {contest.isPreparingOnly
                            ? 'Preparação'
                            : isPast
                              ? 'Realizado'
                              : `${daysUntil} dias`}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {contest.position} • {contest.institution || 'Instituição não informada'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditContest(contest)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteContest(contest.id)}
                      >
                        <Trash2 className="w-4 h-4" />
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
              {filteredSimulados.map((simulado) => {
                const progressPercent = simulado.status === 'completed' ? 100 : 0;
                const isExpanded = expandedCards.has(simulado.id);
                
                // Find associated contest by name pattern
                const associatedContest = contests.find(
                  (c) => simulado.name === `Simulado - ${c.name}`
                );
                
                // Agrupa questões por critérios e calcula a nota ponderada
                const questionsByCriteria: Record<string, { 
                  name: string; 
                  total: number; 
                  correct: number;
                  weight: number;
                  maxPoints: number;
                }> = {};
                
                simulado.questions.forEach((q) => {
                  const key = q.criteriaName || 'Sem categoria';
                  if (!questionsByCriteria[key]) {
                    // Busca peso e pontos nos critérios do concurso associado
                    let weight = 1;
                    let maxPoints = 1;
                    if (associatedContest?.evaluationCriteria) {
                      for (const criteria of associatedContest.evaluationCriteria) {
                        const item = criteria.items?.find((i) => i.content === key);
                        if (item) {
                          weight = item.weight || 1;
                          maxPoints = item.totalPoints || item.questions || 1;
                          break;
                        }
                      }
                    }
                    questionsByCriteria[key] = { name: key, total: 0, correct: 0, weight, maxPoints };
                  }
                  questionsByCriteria[key].total++;
                  if (q.isCorrect) {
                    questionsByCriteria[key].correct++;
                  }
                });
                
                // Calcula nota ponderada com base nos pesos dos critérios
                let totalWeightedScore = 0;
                let totalMaxScore = 0;
                Object.values(questionsByCriteria).forEach((cat) => {
                  if (cat.total > 0) {
                    // Proporção de acertos * pontos máximos da categoria
                    const categoryScore = (cat.correct / cat.total) * cat.maxPoints;
                    totalWeightedScore += categoryScore;
                    totalMaxScore += cat.maxPoints;
                  }
                });
                
                const weightedScorePercent = totalMaxScore > 0 
                  ? Math.round((totalWeightedScore / totalMaxScore) * 100) 
                  : (simulado.score || 0);
                
                return (
                  <div
                    key={simulado.id}
                    className="bg-card border border-border rounded-xl p-4 hover:border-foreground/20 hover:shadow-md transition-all duration-200 flex flex-col"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-semibold text-foreground text-base">{simulado.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {simulado.discipline || 'Geral'}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'text-xs px-2.5 py-1 rounded-full font-medium shrink-0',
                          simulado.status === 'completed'
                            ? 'bg-success/10 text-success'
                            : 'bg-primary/10 text-primary'
                        )}
                      >
                        {simulado.status === 'completed' ? 'Concluído' : 'Pendente'}
                      </span>
                    </div>

                    {/* Contest Info - Institution */}
                    {associatedContest && (
                      <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
                        {associatedContest.institution && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 shrink-0" />
                            <span className="truncate">{associatedContest.institution}</span>
                          </div>
                        )}
                        {associatedContest.bancaUrl && (
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 shrink-0" />
                            <a
                              href={associatedContest.bancaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate"
                            >
                              Banca Organizadora
                            </a>
                          </div>
                        )}
                        {associatedContest.editalUrl && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 shrink-0" />
                            <a
                              href={associatedContest.editalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate"
                            >
                              Ver Edital
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Info badges */}
                    <div className="flex flex-wrap gap-2 mb-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <FileQuestion className="w-4 h-4 shrink-0" />
                        <span>{simulado.questions.length} questões</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>{simulado.timeMinutes} min</span>
                      </div>
                    </div>

                    {/* Difficulty and Score */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={cn(
                          'text-xs px-2 py-1 rounded',
                          simulado.difficulty === 'easy' && 'bg-success/10 text-success',
                          simulado.difficulty === 'medium' && 'bg-warning/10 text-warning',
                          simulado.difficulty === 'hard' && 'bg-destructive/10 text-destructive'
                        )}
                      >
                        {simulado.difficulty === 'easy'
                          ? 'Fácil'
                          : simulado.difficulty === 'medium'
                            ? 'Médio'
                            : 'Difícil'}
                      </span>
                      {simulado.status === 'completed' && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          Nota Ponderada: {weightedScorePercent}%
                        </span>
                      )}
                    </div>

                    {/* Conteúdo por Matéria - sempre visível se houver dados */}
                    {Object.keys(questionsByCriteria).length > 0 && Object.keys(questionsByCriteria).some(k => k !== 'Sem categoria') && (
                      <div className="mb-3 p-2 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-foreground mb-2">Conteúdos cobrados:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(questionsByCriteria)
                            .filter(([key]) => key !== 'Sem categoria')
                            .map(([key, data]) => (
                              <span
                                key={key}
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded-full",
                                  simulado.status === 'completed'
                                    ? data.correct === data.total
                                      ? 'bg-success/10 text-success'
                                      : data.correct / data.total >= 0.5
                                        ? 'bg-warning/10 text-warning'
                                        : 'bg-destructive/10 text-destructive'
                                    : 'bg-primary/10 text-primary'
                                )}
                              >
                                {key} ({data.correct}/{data.total})
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium text-foreground">{progressPercent}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>

                    {/* Ver Detalhes Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between mb-2"
                      onClick={() => toggleCardExpanded(simulado.id)}
                    >
                      <span className="text-xs">
                        {isExpanded ? 'Ocultar detalhes' : 'Ver detalhes'}
                        {simulado.subject && ` (${simulado.subject})`}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="space-y-2 text-xs text-muted-foreground border-t border-border pt-3 mb-3">
                        {simulado.subject && (
                          <div className="flex justify-between">
                            <span>Matéria:</span>
                            <span className="text-foreground font-medium">{simulado.subject}</span>
                          </div>
                        )}
                        {simulado.discipline && (
                          <div className="flex justify-between">
                            <span>Disciplina:</span>
                            <span className="text-foreground">{simulado.discipline}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Total de questões:</span>
                          <span className="text-foreground">{simulado.questions.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tempo limite:</span>
                          <span className="text-foreground">{simulado.timeMinutes} minutos</span>
                        </div>
                        {simulado.status === 'completed' && (
                          <>
                            <div className="flex justify-between">
                              <span>Pontuação simples:</span>
                              <span className="text-foreground">{simulado.score || 0}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Nota ponderada:</span>
                              <span className="text-foreground font-bold text-success">{weightedScorePercent}%</span>
                            </div>
                          </>
                        )}
                        
                        {/* Detalhamento por Matéria */}
                        {Object.keys(questionsByCriteria).length > 0 && (
                          <>
                            <div className="border-t border-border my-2 pt-2">
                              <span className="font-medium text-foreground">Desempenho por Matéria:</span>
                            </div>
                            {Object.entries(questionsByCriteria).map(([key, data]) => {
                              const percent = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                              return (
                                <div key={key} className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="truncate max-w-[60%]">{key}</span>
                                    <span className={cn(
                                      "font-medium",
                                      simulado.status === 'completed'
                                        ? percent >= 70 ? 'text-success' : percent >= 50 ? 'text-warning' : 'text-destructive'
                                        : 'text-foreground'
                                    )}>
                                      {data.correct}/{data.total} ({percent}%)
                                    </span>
                                  </div>
                                  {simulado.status === 'completed' && (
                                    <Progress value={percent} className="h-1" />
                                  )}
                                </div>
                              );
                            })}
                          </>
                        )}
                        
                        {/* Contest Details */}
                        {associatedContest && (
                          <>
                            <div className="border-t border-border my-2 pt-2">
                              <span className="font-medium text-foreground">Dados do Concurso:</span>
                            </div>
                            {associatedContest.inscricoesPeriodo && (
                              <div className="flex justify-between">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Inscrições:
                                </span>
                                <span className="text-foreground">{associatedContest.inscricoesPeriodo}</span>
                              </div>
                            )}
                            {associatedContest.vagas && (
                              <div className="flex justify-between">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  Vagas:
                                </span>
                                <span className="text-foreground">{associatedContest.vagas}</span>
                              </div>
                            )}
                            {associatedContest.remuneracao && (
                              <div className="flex justify-between">
                                <span>Remuneração:</span>
                                <span className="text-foreground font-medium">{associatedContest.remuneracao}</span>
                              </div>
                            )}
                            {associatedContest.taxaInscricao && (
                              <div className="flex justify-between">
                                <span>Taxa de inscrição:</span>
                                <span className="text-foreground">{associatedContest.taxaInscricao}</span>
                              </div>
                            )}
                            {associatedContest.escolaridade && (
                              <div className="flex justify-between">
                                <span>Escolaridade:</span>
                                <span className="text-foreground">{associatedContest.escolaridade}</span>
                              </div>
                            )}
                            {associatedContest.cargos && (
                              <div className="flex justify-between">
                                <span>Cargos:</span>
                                <span className="text-foreground">{associatedContest.cargos}</span>
                              </div>
                            )}
                            {associatedContest.lotacao && (
                              <div className="flex justify-between">
                                <span>Lotação:</span>
                                <span className="text-foreground">{associatedContest.lotacao}</span>
                              </div>
                            )}
                            {associatedContest.situacao && (
                              <div className="flex justify-between">
                                <span>Situação:</span>
                                <span className="text-foreground">{associatedContest.situacao}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-auto pt-3 border-t border-border">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => navigate(`/treinos/${simulado.id}`)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {simulado.status === 'completed' ? 'Refazer simulado' : 'Resolver simulado'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Contest Modal - Three Steps */}
      <Dialog open={isCreateModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingContest ? 'Editar Concurso' : 'Novo Concurso'}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                — Etapa {modalStep} de 3
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                  modalStep >= 1
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                1
              </div>
              <span className="text-xs text-muted-foreground">Dados Gerais</span>
            </div>
            <div className="flex-1 h-1 bg-muted rounded self-start mt-4">
              <div
                className={cn(
                  'h-full rounded transition-all',
                  modalStep >= 2 ? 'bg-primary w-full' : 'bg-primary w-0'
                )}
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                  modalStep >= 2
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                2
              </div>
              <span className="text-xs text-muted-foreground">Critérios</span>
            </div>
            <div className="flex-1 h-1 bg-muted rounded self-start mt-4">
              <div
                className={cn(
                  'h-full rounded transition-all',
                  modalStep >= 3 ? 'bg-primary w-full' : 'bg-primary w-0'
                )}
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                  modalStep >= 3
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                3
              </div>
              <span className="text-xs text-muted-foreground">Simulado</span>
            </div>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            {modalStep === 1 ? (
              <div className="space-y-4 pb-4 px-3">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do concurso *</Label>
                    <Input
                      value={newContest.name}
                      onChange={(e) => setNewContest({ ...newContest, name: e.target.value })}
                      placeholder="Ex: Concurso TRT-SP"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo *</Label>
                    <Input
                      value={newContest.position}
                      onChange={(e) => setNewContest({ ...newContest, position: e.target.value })}
                      placeholder="Ex: Analista Judiciário"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Instituição</Label>
                    <Input
                      value={newContest.institution}
                      onChange={(e) => setNewContest({ ...newContest, institution: e.target.value })}
                      placeholder="Ex: TRT"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Situação atual</Label>
                    <Input
                      value={newContest.situacao}
                      onChange={(e) => setNewContest({ ...newContest, situacao: e.target.value })}
                      placeholder="Ex: Edital publicado"
                    />
                  </div>
                </div>

                {/* Date options */}
                <div className="space-y-3 p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Apenas preparação para área</Label>
                      <p className="text-xs text-muted-foreground">
                        Marque se não tem data específica de prova
                      </p>
                    </div>
                    <Switch
                      checked={newContest.isPreparingOnly}
                      onCheckedChange={(checked) =>
                        setNewContest({ ...newContest, isPreparingOnly: checked, examDate: checked ? '' : newContest.examDate })
                      }
                    />
                  </div>
                  {!newContest.isPreparingOnly && (
                    <div className="space-y-2">
                      <Label>Data da prova</Label>
                      <Input
                        type="date"
                        value={newContest.examDate}
                        onChange={(e) => setNewContest({ ...newContest, examDate: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Link da Banca Organizadora</Label>
                    <Input
                      value={newContest.bancaUrl}
                      onChange={(e) => setNewContest({ ...newContest, bancaUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <EditalUpload
                    value={newContest.editalUrl}
                    onChange={(url) => setNewContest({ ...newContest, editalUrl: url })}
                  />
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cargos</Label>
                    <Input
                      value={newContest.cargos}
                      onChange={(e) => setNewContest({ ...newContest, cargos: e.target.value })}
                      placeholder="Ex: Diversos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Escolaridade</Label>
                    <Input
                      value={newContest.escolaridade}
                      onChange={(e) => setNewContest({ ...newContest, escolaridade: e.target.value })}
                      placeholder="Ex: Nível médio e superior"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Carreiras</Label>
                    <Input
                      value={newContest.carreiras}
                      onChange={(e) => setNewContest({ ...newContest, carreiras: e.target.value })}
                      placeholder="Ex: Administrativa, fiscal, TI"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lotação</Label>
                    <Input
                      value={newContest.lotacao}
                      onChange={(e) => setNewContest({ ...newContest, lotacao: e.target.value })}
                      placeholder="Ex: Maranhão"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Número de vagas</Label>
                    <Input
                      value={newContest.vagas}
                      onChange={(e) => setNewContest({ ...newContest, vagas: e.target.value })}
                      placeholder="Ex: 45 + 21 CR"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Remuneração</Label>
                    <Input
                      value={newContest.remuneracao}
                      onChange={(e) => setNewContest({ ...newContest, remuneracao: formatCurrency(e.target.value) })}
                      placeholder="R$ 0,00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Período de inscrições</Label>
                    <Input
                      value={newContest.inscricoesPeriodo}
                      onChange={(e) =>
                        setNewContest({ ...newContest, inscricoesPeriodo: e.target.value })
                      }
                      placeholder="Ex: 05/12/2025 a 05/01/2026"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Taxa de inscrição</Label>
                    <Input
                      value={newContest.taxaInscricao}
                      onChange={(e) => setNewContest({ ...newContest, taxaInscricao: formatCurrency(e.target.value) })}
                      placeholder="R$ 0,00"
                    />
                  </div>
                </div>

              </div>
            ) : modalStep === 2 ? (
              <div className="space-y-6 pb-4 px-3">
                <EvaluationCriteriaEditor
                  criteria={newContest.evaluationCriteria}
                  onChange={(evaluationCriteria) => setNewContest({ ...newContest, evaluationCriteria })}
                />

                {/* Materias Editor */}
                <ContestMateriasEditor
                  materias={newContest.materias}
                  onChange={(materias) => setNewContest({ ...newContest, materias })}
                />
              </div>
            ) : (
              <div className="space-y-6 pb-4 px-3">
                {/* Configuração de tempo */}
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label htmlFor="simulado-time" className="text-sm font-medium">
                      Tempo do simulado
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Defina o tempo total para resolver todas as questões
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="simulado-time"
                      type="number"
                      min={5}
                      max={480}
                      value={newContest.simuladoTimeMinutes}
                      onChange={(e) => setNewContest({ ...newContest, simuladoTimeMinutes: parseInt(e.target.value) || 60 })}
                      className="w-20 text-center"
                    />
                    <span className="text-sm text-muted-foreground">min</span>
                  </div>
                </div>

                <SimuladoQuestionsEditor
                  questions={newContest.simuladoQuestions}
                  onChange={(simuladoQuestions) => setNewContest({ ...newContest, simuladoQuestions })}
                  evaluationCriteria={newContest.evaluationCriteria}
                />
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 mt-4 border-t border-border shrink-0">
            {modalStep === 1 ? (
              <>
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button onClick={handleNextStep}>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : modalStep === 2 ? (
              <>
                <Button variant="outline" onClick={handlePrevStep}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button onClick={handleNextStep}>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handlePrevStep}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button onClick={handleCreateContest}>
                  {editingContest ? 'Salvar' : 'Criar Concurso'}
                  {newContest.simuladoQuestions.length > 0 && (
                    <span className="ml-2 text-xs opacity-80">
                      ({newContest.simuladoQuestions.length} questões)
                    </span>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

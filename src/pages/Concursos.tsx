import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockContests, mockBankSimulados } from '@/data/mockData';
import { Contest, BankSimulado } from '@/types';
import {
  Plus,
  Calendar,
  Building2,
  Target,
  Filter,
  Search,
  Play,
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

export default function Concursos() {
  const navigate = useNavigate();
  const [contests, setContests] = useState<Contest[]>(mockContests);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [bancaFilter, setBancaFilter] = useState('all');

  // Form state
  const [newContest, setNewContest] = useState({
    name: '',
    position: '',
    institution: '',
    examDate: '',
  });

  const handleCreateContest = () => {
    if (newContest.name && newContest.position && newContest.examDate) {
      const contest: Contest = {
        id: Date.now().toString(),
        name: newContest.name,
        position: newContest.position,
        institution: newContest.institution,
        examDate: new Date(newContest.examDate),
        status: 'active',
      };
      setContests([contest, ...contests]);
      setNewContest({ name: '', position: '', institution: '', examDate: '' });
      setIsCreateModalOpen(false);
    }
  };

  const filteredSimulados = mockBankSimulados.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = areaFilter === 'all' || s.area === areaFilter;
    const matchesBanca = bancaFilter === 'all' || s.banca === bancaFilter;
    return matchesSearch && matchesArea && matchesBanca;
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contests.map((contest) => {
              const daysUntil = getDaysUntil(contest.examDate);
              const isPast = daysUntil < 0;

              return (
                <div
                  key={contest.id}
                  className="bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{contest.name}</h3>
                      <p className="text-sm text-muted-foreground">{contest.position}</p>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded font-medium',
                      isPast
                        ? 'bg-muted text-muted-foreground'
                        : daysUntil <= 30
                          ? 'bg-warning/10 text-warning'
                          : 'bg-success/10 text-success'
                    )}>
                      {isPast ? 'Realizado' : `${daysUntil} dias`}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{contest.institution}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(contest.examDate)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Cronograma
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Target className="w-4 h-4 mr-1" />
                      Treinos
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
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
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas áreas</SelectItem>
                <SelectItem value="Direito">Direito</SelectItem>
                <SelectItem value="Línguas">Línguas</SelectItem>
                <SelectItem value="Exatas">Exatas</SelectItem>
                <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                <SelectItem value="Conhecimentos Gerais">Conhecimentos Gerais</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bancaFilter} onValueChange={setBancaFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Banca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas bancas</SelectItem>
                <SelectItem value="CESPE">CESPE</SelectItem>
                <SelectItem value="FCC">FCC</SelectItem>
                <SelectItem value="FGV">FGV</SelectItem>
                <SelectItem value="VUNESP">VUNESP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Simulados Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSimulados.map((simulado) => (
              <div
                key={simulado.id}
                className="bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm">{simulado.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{simulado.area}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {simulado.banca}
                  </span>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {simulado.questionCount} questões
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

                <Button size="sm" className="w-full" onClick={() => navigate(`/treinos/${simulado.id}`)}>
                  <Play className="w-4 h-4 mr-2" />
                  Resolver simulado
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Contest Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Concurso</DialogTitle>
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
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateContest}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

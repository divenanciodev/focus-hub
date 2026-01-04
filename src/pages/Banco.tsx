import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { mockDisciplines, mockBankSimulados } from '@/data/mockData';
import {
  Search,
  BookOpen,
  Target,
  Play,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function Banco() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');

  const filteredDisciplines = mockDisciplines.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || d.grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const filteredSimulados = mockBankSimulados.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || s.grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="fade-in">
      <PageHeader
        title="Banco (Admin)"
        description="Conteúdo pronto para estudo e prática"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar conteúdo..."
            className="pl-9"
          />
        </div>
        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Grau de escolaridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os níveis</SelectItem>
            <SelectItem value="Fundamental">Fundamental</SelectItem>
            <SelectItem value="Médio">Médio</SelectItem>
            <SelectItem value="Superior">Superior</SelectItem>
            <SelectItem value="Pós-graduação">Pós-graduação</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="disciplinas" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="disciplinas" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Disciplinas
          </TabsTrigger>
          <TabsTrigger value="simulados" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Simulados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="disciplinas" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDisciplines.map((discipline) => (
              <div
                key={discipline.id}
                className="bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
                      <BookOpen className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{discipline.name}</h3>
                      <p className="text-xs text-muted-foreground">{discipline.subject}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {discipline.grade}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {discipline.hoursStudied}h de conteúdo
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/estudos/${discipline.id}`)}
                >
                  Acessar disciplina
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="simulados" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSimulados.map((simulado) => (
              <div
                key={simulado.id}
                className="bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
                      <Target className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{simulado.title}</h3>
                      <p className="text-xs text-muted-foreground">{simulado.area}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {simulado.banca}
                  </span>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {simulado.grade}
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

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/treinos/${simulado.id}`)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resolver simulado
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

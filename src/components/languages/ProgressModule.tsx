import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  BarChart3, 
  Clock, 
  Target,
  TrendingUp,
  BookOpen,
  Dumbbell
} from 'lucide-react';
import { usePracticeSessions, useVocabularySets, useGrammarStructures } from '@/hooks/useLanguagesModule';

interface ProgressModuleProps {
  languageId: string;
}

export function ProgressModule({ languageId }: ProgressModuleProps) {
  const { sessions, loading: sessionsLoading } = usePracticeSessions(languageId);
  const { sets, loading: setsLoading } = useVocabularySets(languageId);
  const { structures, loading: structuresLoading } = useGrammarStructures(languageId);

  const loading = sessionsLoading || setsLoading || structuresLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalSessions = sessions.length;
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
  const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalTimeMinutes = Math.round(sessions.reduce((sum, s) => sum + s.timeSpentSeconds, 0) / 60);

  const vocabSessions = sessions.filter(s => s.practiceType === 'vocabulary');
  const structureSessions = sessions.filter(s => s.practiceType === 'structures');

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalSessions}</div>
                <div className="text-sm text-muted-foreground">Sessões</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{accuracy}%</div>
                <div className="text-sm text-muted-foreground">Precisão</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalTimeMinutes}</div>
                <div className="text-sm text-muted-foreground">Minutos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalCorrect}</div>
                <div className="text-sm text-muted-foreground">Acertos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-4 h-4" />
              Vocabulário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conjuntos</span>
                <span className="font-medium">{sets.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sessões de prática</span>
                <span className="font-medium">{vocabSessions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Classes gramaticais</span>
                <span className="font-medium">
                  {sets.filter(s => s.setType === 'grammatical_class').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conjuntos temáticos</span>
                <span className="font-medium">
                  {sets.filter(s => s.setType === 'thematic_set').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Dumbbell className="w-4 h-4" />
              Estruturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total de estruturas</span>
                <span className="font-medium">{structures.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sessões de prática</span>
                <span className="font-medium">{structureSessions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Por dificuldade</span>
                <div className="flex gap-1">
                  <Badge variant="secondary" className="text-xs">
                    Fácil: {structures.filter(s => s.difficulty === 'easy').length}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Médio: {structures.filter(s => s.difficulty === 'medium').length}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sessões Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <EmptyState
              icon={<BarChart3 className="w-8 h-8 text-muted-foreground" />}
              title="Nenhuma sessão registrada"
              description="Complete práticas para ver seu progresso aqui"
            />
          ) : (
            <div className="space-y-2">
              {sessions.slice(0, 5).map(session => (
                <div 
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {session.practiceType === 'vocabulary' ? (
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Dumbbell className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div>
                      <div className="font-medium capitalize">{session.practiceType}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(session.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {session.correctAnswers}/{session.totalQuestions}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session.totalQuestions > 0 
                        ? Math.round((session.correctAnswers / session.totalQuestions) * 100)
                        : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';
import { AddStudyLinkModal } from '@/components/modals/AddStudyLinkModal';
import { mockDisciplines } from '@/data/mockData';
import { StudyLink, Task, Flashcard } from '@/types';
import {
  ArrowLeft,
  Plus,
  ExternalLink,
  CheckCircle2,
  Circle,
  Youtube,
  FileText,
  File,
  Trash2,
  Edit2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function DisciplineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const discipline = mockDisciplines.find((d) => d.id === id);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Ler capítulo 1', completed: true, priority: 'high' },
    { id: '2', title: 'Fazer exercícios página 45', completed: false, priority: 'medium' },
    { id: '3', title: 'Revisar anotações', completed: false, priority: 'low' },
  ]);

  const [links, setLinks] = useState<StudyLink[]>([
    { id: '1', title: 'Aula de introdução', type: 'youtube', url: 'https://youtube.com' },
    { id: '2', title: 'Artigo complementar', type: 'article', url: 'https://example.com' },
  ]);

  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { id: '1', question: 'O que é princípio da legalidade?', answer: 'Ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei.' },
    { id: '2', question: 'Quais são os fundamentos da República?', answer: 'Soberania, cidadania, dignidade da pessoa humana, valores sociais do trabalho e da livre iniciativa, e pluralismo político.' },
  ]);

  const [newTask, setNewTask] = useState('');
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  if (!discipline) {
    return (
      <div className="fade-in">
        <Button variant="ghost" onClick={() => navigate('/estudos')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <p className="text-muted-foreground">Disciplina não encontrada.</p>
      </div>
    );
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        { id: Date.now().toString(), title: newTask, completed: false, priority: 'medium' },
      ]);
      setNewTask('');
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleAddLink = (data: { title: string; type: 'youtube' | 'article' | 'pdf'; url: string; note?: string }) => {
    setLinks([...links, { id: Date.now().toString(), ...data }]);
  };

  const deleteLink = (linkId: string) => {
    setLinks(links.filter((l) => l.id !== linkId));
  };

  const toggleFlashcard = (cardId: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(cardId)) {
      newFlipped.delete(cardId);
    } else {
      newFlipped.add(cardId);
    }
    setFlippedCards(newFlipped);
  };

  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'pdf':
        return <File className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  return (
    <div className="fade-in">
      <Button variant="ghost" onClick={() => navigate('/estudos')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <PageHeader
        title={discipline.name}
        description={`${discipline.subject} • ${discipline.grade}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
              <TabsTrigger value="links">Links</TabsTrigger>
              <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
              <TabsTrigger value="resumos">Resumos</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-0">
              <div className="bg-card border border-border rounded-xl p-5">
                <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                  <Input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Nova tarefa..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </form>

                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg transition-colors',
                        task.completed ? 'bg-muted/50' : 'bg-secondary/50 hover:bg-secondary'
                      )}
                    >
                      <button onClick={() => toggleTask(task.id)}>
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      <span
                        className={cn(
                          'flex-1 text-sm',
                          task.completed && 'line-through text-muted-foreground'
                        )}
                      >
                        {task.title}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="links" className="mt-0">
              <div className="bg-card border border-border rounded-xl p-5">
                <Button onClick={() => setIsAddLinkModalOpen(true)} className="mb-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar link
                </Button>

                <div className="space-y-2">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded bg-muted">
                        {getLinkIcon(link.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{link.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => deleteLink(link.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="flashcards" className="mt-0">
              <div className="bg-card border border-border rounded-xl p-5">
                <Button className="mb-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo flashcard
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flashcards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => toggleFlashcard(card.id)}
                      className="min-h-32 p-4 rounded-lg bg-secondary cursor-pointer transition-all duration-300 hover:shadow-md"
                    >
                      {flippedCards.has(card.id) ? (
                        <div className="scale-in">
                          <p className="text-xs text-muted-foreground mb-2">Resposta</p>
                          <p className="text-sm text-foreground">{card.answer}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Pergunta</p>
                          <p className="text-sm text-foreground font-medium">{card.question}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resumos" className="mt-0">
              <div className="bg-card border border-border rounded-xl p-5">
                <Button className="mb-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo resumo
                </Button>

                <div className="text-center py-8 text-muted-foreground">
                  <Edit2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum resumo criado ainda.</p>
                  <p className="text-sm">Crie seu primeiro resumo para esta disciplina.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PomodoroTimer />

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Estatísticas</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Horas estudadas</span>
                <span className="font-medium text-foreground">{discipline.hoursStudied}h</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium text-foreground">{discipline.progress}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tarefas concluídas</span>
                <span className="font-medium text-foreground">
                  {tasks.filter((t) => t.completed).length}/{tasks.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Links salvos</span>
                <span className="font-medium text-foreground">{links.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddStudyLinkModal
        open={isAddLinkModalOpen}
        onOpenChange={setIsAddLinkModalOpen}
        onSubmit={handleAddLink}
      />
    </div>
  );
}

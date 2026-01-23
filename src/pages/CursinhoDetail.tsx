import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useCourses, CurriculumItem, CurriculumSubtopic } from '@/hooks/useCourses';
import { useCourseStudySessions, StudyType } from '@/hooks/useCourseStudySessions';
import {
  ArrowLeft,
  Plus,
  Clock,
  Calendar,
  ExternalLink,
  ListChecks,
  BookOpen,
  FileText,
  BookMarked,
  HelpCircle,
  X,
  Tag,
  Trash2,
  Loader2,
  Copy,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const STUDY_TYPES: { value: StudyType; label: string; icon: React.ReactNode }[] = [
  { value: 'resumo', label: 'Resumo', icon: <FileText className="w-4 h-4" /> },
  { value: 'exercicios', label: 'Exercícios', icon: <ListChecks className="w-4 h-4" /> },
  { value: 'leitura', label: 'Leitura', icon: <BookMarked className="w-4 h-4" /> },
];

export default function CursinhoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, loading: coursesLoading, markSubtopicAsStudied, toggleCurriculumItem } = useCourses();
  const course = courses.find(c => c.id === id);
  const { sessions, loading: sessionsLoading, addSession, deleteSession, getTotalStudyHours, getTotalQuestions } = useCourseStudySessions(course?.id);

  const [newStudy, setNewStudy] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    curriculumItemId: '',
    curriculumItemTitle: '',
    subtopicId: '',
    subtopicTitle: '',
    studyType: 'resumo' as StudyType,
    summaryMinutes: 30,
    exerciseMinutes: 30,
    questionsCount: 0,
    readingMinutes: 30,
  });
  const [newTag, setNewTag] = useState('');

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="fade-in">
        <Button variant="ghost" onClick={() => navigate('/cursinhos')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <p className="text-muted-foreground">Curso não encontrado.</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return format(new Date(date), "dd 'de' MMM, yyyy", { locale: ptBR });
  };

  const getAllCurriculumItems = (): CurriculumItem[] => course.curriculum || [];

  const getSelectedItemSubtopics = (): CurriculumSubtopic[] => {
    if (!newStudy.curriculumItemId || !course?.curriculum) return [];
    const item = course.curriculum.find(i => i.id === newStudy.curriculumItemId);
    return item?.subtopics || [];
  };

  const handleCurriculumSelect = (itemId: string) => {
    const item = getAllCurriculumItems().find(i => i.id === itemId);
    setNewStudy({
      ...newStudy,
      curriculumItemId: itemId,
      curriculumItemTitle: item?.title || '',
      subtopicId: '',
      subtopicTitle: '',
      title: item?.title || newStudy.title,
    });
  };

  const handleSubtopicSelect = (subtopicId: string) => {
    const item = getAllCurriculumItems().find(i => i.id === newStudy.curriculumItemId);
    const subtopic = item?.subtopics?.find(s => s.id === subtopicId);
    setNewStudy({
      ...newStudy,
      subtopicId,
      subtopicTitle: subtopic?.title || '',
      title: subtopic?.title || newStudy.title,
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newStudy.tags.includes(newTag.trim())) {
      setNewStudy({ ...newStudy, tags: [...newStudy.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewStudy({ ...newStudy, tags: newStudy.tags.filter(t => t !== tag) });
  };

  const getStudyMinutes = () => {
    switch (newStudy.studyType) {
      case 'resumo': return newStudy.summaryMinutes;
      case 'exercicios': return newStudy.exerciseMinutes;
      case 'leitura': return newStudy.readingMinutes;
      default: return 0;
    }
  };

  const handleRegisterStudy = async () => {
    if (!newStudy.title.trim()) return;

    const studyMinutes = getStudyMinutes();

    await addSession({
      courseId: course.id,
      title: newStudy.title.trim(),
      description: newStudy.description.trim() || undefined,
      tags: newStudy.tags,
      studyMinutes,
      curriculumItemId: newStudy.curriculumItemId || undefined,
      curriculumItemTitle: newStudy.subtopicTitle || newStudy.curriculumItemTitle || undefined,
      studyType: newStudy.studyType,
      questionsCount: newStudy.studyType === 'exercicios' ? newStudy.questionsCount : 0,
      readingMinutes: newStudy.studyType === 'leitura' ? newStudy.readingMinutes : 0,
      exerciseMinutes: newStudy.studyType === 'exercicios' ? newStudy.exerciseMinutes : 0,
      summaryMinutes: newStudy.studyType === 'resumo' ? newStudy.summaryMinutes : 0,
    });

    if (newStudy.curriculumItemId && newStudy.subtopicId) {
      await markSubtopicAsStudied(course.id, newStudy.curriculumItemId, newStudy.subtopicId);
      toast.success('Subtópico marcado como estudado!');
    }

    setNewStudy({
      title: '',
      description: '',
      tags: [],
      curriculumItemId: '',
      curriculumItemTitle: '',
      subtopicId: '',
      subtopicTitle: '',
      studyType: 'resumo',
      summaryMinutes: 30,
      exerciseMinutes: 30,
      questionsCount: 0,
      readingMinutes: 30,
    });
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const getStudyTypeInfo = (type: StudyType) => {
    return STUDY_TYPES.find(t => t.value === type) || STUDY_TYPES[0];
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!');
  };

  const completedCurriculumItems = course.curriculum.filter(i => i.completed).length;
  const totalSubtopics = course.curriculum.reduce((acc, item) => acc + (item.subtopics?.length || 0), 0);
  const completedSubtopics = course.curriculum.reduce((acc, item) => 
    acc + (item.subtopics?.filter(s => s.completed).length || 0), 0
  );

  const curriculumItems = getAllCurriculumItems();

  return (
    <div className="fade-in">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate('/cursinhos')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      <PageHeader
        title={course.name}
        description={
          <div className="flex items-center gap-2 flex-wrap">
            <span>{course.theme}</span>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{course.workload}h</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(course.deadline)}</span>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="registrar" className="w-full">
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              <TabsTrigger value="registrar">Registrar Estudo</TabsTrigger>
              <TabsTrigger value="grade">Grade Curricular</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
              <TabsTrigger value="links">Links</TabsTrigger>
            </TabsList>

            {/* Registrar Estudo */}
            <TabsContent value="registrar" className="mt-0">
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Registrar Estudo</h3>
                </div>

                {/* Seleção de Item Curricular */}
                {curriculumItems.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Módulo/Tópico da Grade</Label>
                    <Select value={newStudy.curriculumItemId} onValueChange={handleCurriculumSelect}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Selecione um módulo (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {curriculumItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Seleção de Subtópico */}
                {getSelectedItemSubtopics().length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Subtópico (será marcado como estudado)</Label>
                    <Select value={newStudy.subtopicId} onValueChange={handleSubtopicSelect}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Selecione um subtópico (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSelectedItemSubtopics().map((subtopic) => (
                          <SelectItem key={subtopic.id} value={subtopic.id}>
                            <span className={subtopic.completed ? 'line-through text-muted-foreground' : ''}>
                              {subtopic.title}
                            </span>
                            {subtopic.completed && <Badge variant="secondary" className="ml-2 text-xs">Estudado</Badge>}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Tipo de Estudo */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Tipo de Estudo</Label>
                  <div className="flex gap-2">
                    {STUDY_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        type="button"
                        variant={newStudy.studyType === type.value ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => setNewStudy({ ...newStudy, studyType: type.value })}
                      >
                        {type.icon}
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Input
                  value={newStudy.title}
                  onChange={(e) => setNewStudy({ ...newStudy, title: e.target.value })}
                  placeholder="O que você estudou? (ex: Capítulo 3 - Funções)"
                  className="text-sm"
                />

                <Textarea
                  value={newStudy.description}
                  onChange={(e) => setNewStudy({ ...newStudy, description: e.target.value })}
                  placeholder="Descrição ou anotações sobre o estudo..."
                  className="min-h-[60px] text-sm resize-none"
                />

                {/* Tags */}
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex items-center gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Adicionar tag..."
                      className="text-sm w-32"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                      <Tag className="w-3 h-3" />
                    </Button>
                  </div>
                  {newStudy.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* Campos específicos por tipo */}
                <div className="p-3 bg-secondary/30 rounded-lg border space-y-3">
                  {newStudy.studyType === 'resumo' && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 flex-1">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm whitespace-nowrap">Tempo de resumo:</Label>
                        <Input
                          type="number"
                          value={newStudy.summaryMinutes}
                          onChange={(e) => setNewStudy({ ...newStudy, summaryMinutes: parseInt(e.target.value) || 0 })}
                          className="text-sm w-20"
                          min={1}
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>
                    </div>
                  )}

                  {newStudy.studyType === 'exercicios' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-1">
                        <ListChecks className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm whitespace-nowrap">Tempo:</Label>
                        <Input
                          type="number"
                          value={newStudy.exerciseMinutes}
                          onChange={(e) => setNewStudy({ ...newStudy, exerciseMinutes: parseInt(e.target.value) || 0 })}
                          className="text-sm w-20"
                          min={1}
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm whitespace-nowrap">Questões feitas:</Label>
                        <Input
                          type="number"
                          value={newStudy.questionsCount}
                          onChange={(e) => setNewStudy({ ...newStudy, questionsCount: parseInt(e.target.value) || 0 })}
                          className="text-sm w-20"
                          min={0}
                        />
                      </div>
                    </div>
                  )}

                  {newStudy.studyType === 'leitura' && (
                    <div className="flex items-center gap-2 flex-1">
                      <BookMarked className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-sm whitespace-nowrap">Tempo de leitura:</Label>
                      <Input
                        type="number"
                        value={newStudy.readingMinutes}
                        onChange={(e) => setNewStudy({ ...newStudy, readingMinutes: parseInt(e.target.value) || 0 })}
                        className="text-sm w-20"
                        min={1}
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                  )}
                </div>

                <Button onClick={handleRegisterStudy} className="w-full" disabled={!newStudy.title.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Estudo
                </Button>
              </div>
            </TabsContent>

            {/* Grade Curricular */}
            <TabsContent value="grade" className="mt-0">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ListChecks className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Grade Curricular</h3>
                </div>
                
                {course.curriculum.length > 0 ? (
                  <div className="space-y-3">
                    {course.curriculum.map((item, index) => (
                      <div key={item.id} className="space-y-2">
                        <div
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-colors",
                            item.completed ? 'bg-muted/50' : 'bg-secondary/50 hover:bg-secondary'
                          )}
                        >
                          <button onClick={() => toggleCurriculumItem(course.id, item.id)}>
                            {item.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </button>
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                            {index + 1}
                          </div>
                          <span className={cn(
                            "flex-1 text-sm text-foreground",
                            item.completed && "line-through text-muted-foreground"
                          )}>
                            {item.title}
                          </span>
                        </div>
                        
                        {/* Subtópicos */}
                        {item.subtopics && item.subtopics.length > 0 && (
                          <div className="ml-8 space-y-1">
                            {item.subtopics.map((subtopic) => (
                              <div
                                key={subtopic.id}
                                className={cn(
                                  "flex items-center gap-2 p-2 rounded-md text-sm",
                                  subtopic.completed ? 'bg-muted/30 text-muted-foreground line-through' : 'bg-secondary/30'
                                )}
                              >
                                {subtopic.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-primary" />
                                ) : (
                                  <Circle className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span>{subtopic.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum item na grade curricular. Edite o curso para adicionar.
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Histórico */}
            <TabsContent value="historico" className="mt-0">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Histórico de Estudos ({sessions.length})</h3>
                </div>
                
                {sessionsLoading ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Carregando...
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum estudo registrado para este curso.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => {
                      const typeInfo = getStudyTypeInfo(session.studyType);
                      return (
                        <div key={session.id} className="p-3 bg-secondary/50 rounded-lg">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge variant="outline" className="text-xs gap-1">
                                  {typeInfo.icon}
                                  {typeInfo.label}
                                </Badge>
                                <span className="font-medium text-sm">{session.title}</span>
                                <Badge variant="secondary" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatStudyTime(session.studyMinutes)}
                                </Badge>
                                {session.questionsCount > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    <HelpCircle className="w-3 h-3 mr-1" />
                                    {session.questionsCount} questões
                                  </Badge>
                                )}
                              </div>

                              {session.curriculumItemTitle && (
                                <p className="text-xs text-primary mb-1">📚 {session.curriculumItemTitle}</p>
                              )}
                              
                              {session.description && (
                                <p className="text-xs text-muted-foreground mb-2">{session.description}</p>
                              )}

                              {session.tags && session.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {session.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                  ))}
                                </div>
                              )}

                              <p className="text-xs text-muted-foreground">
                                {format(new Date(session.createdAt), "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteSession(session.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Links */}
            <TabsContent value="links" className="mt-0">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Links do Curso</h3>
                </div>
                
                {course.links.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum link adicionado. Edite o curso para adicionar links.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {course.links.map((link, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded bg-muted">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{link.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopyLink(link.url)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PomodoroTimer />

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Progresso</h3>
            <ProgressBar value={course.progress} showLabel className="mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Horas estudadas</span>
                <span className="font-medium text-foreground">{getTotalStudyHours()}h</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Carga horária</span>
                <span className="font-medium text-foreground">{course.workload}h</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sessões de estudo</span>
                <span className="font-medium text-foreground">{sessions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Questões resolvidas</span>
                <span className="font-medium text-foreground">{getTotalQuestions()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Módulos concluídos</span>
                <span className="font-medium text-foreground">{completedCurriculumItems}/{course.curriculum.length}</span>
              </div>
              {totalSubtopics > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtópicos estudados</span>
                  <span className="font-medium text-foreground">{completedSubtopics}/{totalSubtopics}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Links salvos</span>
                <span className="font-medium text-foreground">{course.links.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/treinos')}
              >
                <ListChecks className="w-4 h-4 mr-2" />
                Ir para Treinos
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/flashcards')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Flashcards
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Course, CurriculumItem } from '@/hooks/useCourses';
import { useCourseStudySessions, CourseStudySession, StudyType } from '@/hooks/useCourseStudySessions';
import { 
  Clock, 
  Plus, 
  X,
  BookOpen,
  Trash2,
  Tag,
  FileText,
  ListChecks,
  BookMarked,
  HelpCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CourseStudyModalProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STUDY_TYPES: { value: StudyType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'resumo', label: 'Resumo', icon: <FileText className="w-4 h-4" />, color: 'bg-blue-500' },
  { value: 'exercicios', label: 'Exercícios', icon: <ListChecks className="w-4 h-4" />, color: 'bg-green-500' },
  { value: 'leitura', label: 'Leitura', icon: <BookMarked className="w-4 h-4" />, color: 'bg-amber-500' },
];

export function CourseStudyModal({ course, open, onOpenChange }: CourseStudyModalProps) {
  const { sessions, loading, addSession, deleteSession, getTotalStudyHours, getTotalQuestions } = useCourseStudySessions(course?.id);
  
  const [newStudy, setNewStudy] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    curriculumItemId: '',
    curriculumItemTitle: '',
    studyType: 'resumo' as StudyType,
    summaryMinutes: 30,
    exerciseMinutes: 30,
    questionsCount: 0,
    readingMinutes: 30,
  });
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !newStudy.tags.includes(newTag.trim())) {
      setNewStudy({ ...newStudy, tags: [...newStudy.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewStudy({ ...newStudy, tags: newStudy.tags.filter(t => t !== tag) });
  };

  const handleCurriculumSelect = (itemId: string) => {
    const item = getAllCurriculumItems().find(i => i.id === itemId);
    setNewStudy({
      ...newStudy,
      curriculumItemId: itemId,
      curriculumItemTitle: item?.title || '',
      title: item?.title || newStudy.title,
    });
  };

  const getAllCurriculumItems = (): CurriculumItem[] => {
    if (!course?.curriculum) return [];
    return course.curriculum;
  };

  const getStudyMinutes = () => {
    switch (newStudy.studyType) {
      case 'resumo':
        return newStudy.summaryMinutes;
      case 'exercicios':
        return newStudy.exerciseMinutes;
      case 'leitura':
        return newStudy.readingMinutes;
      default:
        return 0;
    }
  };

  const handleRegisterStudy = async () => {
    if (!course || !newStudy.title.trim()) return;

    const studyMinutes = getStudyMinutes();

    await addSession({
      courseId: course.id,
      title: newStudy.title.trim(),
      description: newStudy.description.trim() || undefined,
      tags: newStudy.tags,
      studyMinutes,
      curriculumItemId: newStudy.curriculumItemId || undefined,
      curriculumItemTitle: newStudy.curriculumItemTitle || undefined,
      studyType: newStudy.studyType,
      questionsCount: newStudy.studyType === 'exercicios' ? newStudy.questionsCount : 0,
      readingMinutes: newStudy.studyType === 'leitura' ? newStudy.readingMinutes : 0,
      exerciseMinutes: newStudy.studyType === 'exercicios' ? newStudy.exerciseMinutes : 0,
      summaryMinutes: newStudy.studyType === 'resumo' ? newStudy.summaryMinutes : 0,
    });

    setNewStudy({
      title: '',
      description: '',
      tags: [],
      curriculumItemId: '',
      curriculumItemTitle: '',
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

  if (!course) return null;

  const curriculumItems = getAllCurriculumItems();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="truncate">{course.name}</span>
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Total: {getTotalStudyHours()}h</span>
            </div>
            <div className="flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              <span>Questões: {getTotalQuestions()}</span>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Formulário de Registro */}
          <div className="p-4 bg-secondary/30 rounded-lg space-y-3">
            <Label className="text-sm font-medium">Registrar Estudo</Label>

            {/* Seleção de Item Curricular */}
            {curriculumItems.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Módulo/Tópico da Grade</Label>
                <Select
                  value={newStudy.curriculumItemId}
                  onValueChange={handleCurriculumSelect}
                >
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
            
            <div className="space-y-2">
              <Input
                value={newStudy.title}
                onChange={(e) => setNewStudy({ ...newStudy, title: e.target.value })}
                placeholder="O que você estudou? (ex: Capítulo 3 - Funções)"
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Textarea
                value={newStudy.description}
                onChange={(e) => setNewStudy({ ...newStudy, description: e.target.value })}
                placeholder="Descrição ou anotações sobre o estudo..."
                className="min-h-[60px] text-sm resize-none"
              />
            </div>

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
            <div className="p-3 bg-background rounded-lg border space-y-3">
              {newStudy.studyType === 'resumo' && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <FileText className="w-4 h-4 text-blue-500" />
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
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <ListChecks className="w-4 h-4 text-green-500" />
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
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <HelpCircle className="w-4 h-4 text-green-500" />
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
                </div>
              )}

              {newStudy.studyType === 'leitura' && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <BookMarked className="w-4 h-4 text-amber-500" />
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
                </div>
              )}
            </div>

            <Button 
              onClick={handleRegisterStudy} 
              className="w-full"
              disabled={!newStudy.title.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar Estudo
            </Button>
          </div>

          {/* Lista de Registros */}
          <div className="flex-1 overflow-y-auto space-y-3">
            <Label className="text-sm font-medium">Histórico de Estudos ({sessions.length})</Label>
            
            {loading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Carregando...
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum estudo registrado para este curso.
              </div>
            ) : (
              sessions.map((session) => {
                const typeInfo = getStudyTypeInfo(session.studyType);
                return (
                  <div key={session.id} className="p-3 bg-card border border-border rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={`${typeInfo.color} text-white text-xs gap-1`}>
                            {typeInfo.icon}
                            {typeInfo.label}
                          </Badge>
                          <h4 className="font-medium text-sm">{session.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatStudyTime(session.studyMinutes)}
                          </Badge>
                          {session.questionsCount > 0 && (
                            <Badge variant="outline" className="text-xs">
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
                        
                        {session.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {session.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          {format(session.createdAt, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteSession(session.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
import { Course } from '@/hooks/useCourses';
import { useCourseStudySessions, CourseStudySession } from '@/hooks/useCourseStudySessions';
import { 
  Clock, 
  Plus, 
  X,
  BookOpen,
  Trash2,
  Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CourseStudyModalProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CourseStudyModal({ course, open, onOpenChange }: CourseStudyModalProps) {
  const { sessions, loading, addSession, deleteSession, getTotalStudyHours } = useCourseStudySessions(course?.id);
  
  const [newStudy, setNewStudy] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    studyMinutes: 30,
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

  const handleRegisterStudy = async () => {
    if (!course || !newStudy.title.trim()) return;

    await addSession({
      courseId: course.id,
      title: newStudy.title.trim(),
      description: newStudy.description.trim() || undefined,
      tags: newStudy.tags,
      studyMinutes: newStudy.studyMinutes,
    });

    setNewStudy({ title: '', description: '', tags: [], studyMinutes: 30 });
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="truncate">{course.name}</span>
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Total estudado: {getTotalStudyHours()}h</span>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Formulário de Registro */}
          <div className="p-4 bg-secondary/30 rounded-lg space-y-3">
            <Label className="text-sm font-medium">Registrar Estudo</Label>
            
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

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">Tempo de estudo:</Label>
                <Input
                  type="number"
                  value={newStudy.studyMinutes}
                  onChange={(e) => setNewStudy({ ...newStudy, studyMinutes: parseInt(e.target.value) || 0 })}
                  className="text-sm w-20"
                  min={1}
                />
                <span className="text-sm text-muted-foreground">minutos</span>
              </div>
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
              sessions.map((session) => (
                <div key={session.id} className="p-3 bg-card border border-border rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{session.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatStudyTime(session.studyMinutes)}
                        </Badge>
                      </div>
                      
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
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

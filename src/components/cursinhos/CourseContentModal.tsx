import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Course } from '@/hooks/useCourses';
import { 
  FileText, 
  Layers, 
  Plus, 
  Save,
  Trash2,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface CourseContentModalProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Summary {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export function CourseContentModal({ course, open, onOpenChange }: CourseContentModalProps) {
  const [activeTab, setActiveTab] = useState('resumos');
  
  // Resumos state
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [newSummary, setNewSummary] = useState({ title: '', content: '' });
  const [editingSummary, setEditingSummary] = useState<Summary | null>(null);
  
  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [newFlashcard, setNewFlashcard] = useState({ question: '', answer: '' });

  const handleAddSummary = () => {
    if (!newSummary.title.trim() || !newSummary.content.trim()) {
      toast.error('Preencha título e conteúdo do resumo');
      return;
    }
    
    const summary: Summary = {
      id: Date.now().toString(),
      title: newSummary.title.trim(),
      content: newSummary.content.trim(),
      createdAt: new Date()
    };
    
    setSummaries([...summaries, summary]);
    setNewSummary({ title: '', content: '' });
    toast.success('Resumo criado!');
  };

  const handleDeleteSummary = (id: string) => {
    setSummaries(summaries.filter(s => s.id !== id));
    toast.success('Resumo excluído');
  };

  const handleAddFlashcard = () => {
    if (!newFlashcard.question.trim() || !newFlashcard.answer.trim()) {
      toast.error('Preencha pergunta e resposta');
      return;
    }
    
    const flashcard: Flashcard = {
      id: Date.now().toString(),
      question: newFlashcard.question.trim(),
      answer: newFlashcard.answer.trim()
    };
    
    setFlashcards([...flashcards, flashcard]);
    setNewFlashcard({ question: '', answer: '' });
    toast.success('Flashcard criado!');
  };

  const handleDeleteFlashcard = (id: string) => {
    setFlashcards(flashcards.filter(f => f.id !== id));
    toast.success('Flashcard excluído');
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="truncate">{course.name}</span>
            <span className="text-xs text-muted-foreground font-normal">- Conteúdos</span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="resumos" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Resumos ({summaries.length})
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Flashcards ({flashcards.length})
            </TabsTrigger>
          </TabsList>

          {/* Resumos Tab */}
          <TabsContent value="resumos" className="flex-1 overflow-hidden flex flex-col mt-4">
            <div className="space-y-3 mb-4 p-3 bg-secondary/30 rounded-lg">
              <div className="space-y-2">
                <Label className="text-sm">Novo Resumo</Label>
                <Input
                  value={newSummary.title}
                  onChange={(e) => setNewSummary({ ...newSummary, title: e.target.value })}
                  placeholder="Título do resumo"
                  className="text-sm"
                />
                <Textarea
                  value={newSummary.content}
                  onChange={(e) => setNewSummary({ ...newSummary, content: e.target.value })}
                  placeholder="Conteúdo do resumo..."
                  className="min-h-[100px] text-sm resize-none"
                />
                <Button onClick={handleAddSummary} size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Resumo
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3">
              {summaries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum resumo criado para este cursinho.
                </div>
              ) : (
                summaries.map((summary) => (
                  <div key={summary.id} className="p-3 bg-card border border-border rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm">{summary.title}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteSummary(summary.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{summary.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Criado em: {summary.createdAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards" className="flex-1 overflow-hidden flex flex-col mt-4">
            <div className="space-y-3 mb-4 p-3 bg-secondary/30 rounded-lg">
              <div className="space-y-2">
                <Label className="text-sm">Novo Flashcard</Label>
                <Input
                  value={newFlashcard.question}
                  onChange={(e) => setNewFlashcard({ ...newFlashcard, question: e.target.value })}
                  placeholder="Pergunta"
                  className="text-sm"
                />
                <Textarea
                  value={newFlashcard.answer}
                  onChange={(e) => setNewFlashcard({ ...newFlashcard, answer: e.target.value })}
                  placeholder="Resposta..."
                  className="min-h-[80px] text-sm resize-none"
                />
                <Button onClick={handleAddFlashcard} size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Flashcard
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {flashcards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum flashcard criado para este cursinho.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {flashcards.map((flashcard) => (
                    <div key={flashcard.id} className="p-3 bg-card border border-border rounded-lg">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs text-primary font-medium">Pergunta:</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteFlashcard(flashcard.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm mb-3">{flashcard.question}</p>
                      <span className="text-xs text-primary font-medium">Resposta:</span>
                      <p className="text-xs text-muted-foreground mt-1">{flashcard.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

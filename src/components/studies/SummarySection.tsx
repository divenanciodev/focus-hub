import { useState, useRef } from 'react';
import { Summary } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  Mic,
  MicOff,
  Edit2,
  Trash2,
  Play,
  Pause,
  FileText,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SummarySectionProps {
  summaries: Summary[];
  onUpdateSummaries: (summaries: Summary[]) => void;
  onGenerateQuestions: (summaryContent: string) => void;
}

export function SummarySection({ summaries, onUpdateSummaries, onGenerateQuestions }: SummarySectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [editingSummary, setEditingSummary] = useState<Summary | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleOpenModal = (summary?: Summary, voiceMode = false) => {
    if (summary) {
      setEditingSummary(summary);
      setTitle(summary.title);
      setContent(summary.content);
      setIsVoiceMode(summary.isVoice);
    } else {
      setEditingSummary(null);
      setTitle('');
      setContent('');
      setIsVoiceMode(voiceMode);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    const summaryData: Summary = {
      id: editingSummary?.id || Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      createdAt: editingSummary?.createdAt || new Date(),
      isVoice: isVoiceMode,
    };

    if (editingSummary) {
      onUpdateSummaries(summaries.map(s => s.id === editingSummary.id ? summaryData : s));
    } else {
      onUpdateSummaries([...summaries, summaryData]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setIsVoiceMode(false);
    setEditingSummary(null);
    setIsRecording(false);
  };

  const handleDelete = (id: string) => {
    onUpdateSummaries(summaries.filter(s => s.id !== id));
  };

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Seu navegador não suporta reconhecimento de voz. Tente usar o Chrome.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setContent(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    }
  };

  const speakText = (text: string, id: string) => {
    if (playingAudio === id) {
      window.speechSynthesis.cancel();
      setPlayingAudio(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    
    utterance.onend = () => setPlayingAudio(null);
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setPlayingAudio(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => handleOpenModal(undefined, false)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Resumo
        </Button>
        <Button variant="outline" onClick={() => handleOpenModal(undefined, true)}>
          <Mic className="w-4 h-4 mr-2" />
          Gravar Resumo
        </Button>
      </div>

      {summaries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum resumo criado ainda.</p>
          <p className="text-sm">Crie seu primeiro resumo para esta disciplina.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {summaries.map((summary) => (
            <div
              key={summary.id}
              className="bg-secondary/50 rounded-xl p-4 border border-border hover:border-foreground/20 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {summary.isVoice && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      🎤 Voz
                    </span>
                  )}
                  <h4 className="font-medium text-foreground">{summary.title}</h4>
                </div>
                <div className="flex items-center gap-1">
                  {summary.isVoice && (
                    <button
                      onClick={() => speakText(summary.content, summary.id)}
                      className={cn(
                        "p-1 transition-colors",
                        playingAudio === summary.id 
                          ? "text-primary" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      title="Ouvir resumo"
                    >
                      {playingAudio === summary.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => onGenerateQuestions(summary.content)}
                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                    title="Gerar questões"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenModal(summary)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(summary.id)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                {summary.content}
              </p>

              <p className="text-xs text-muted-foreground">
                {format(new Date(summary.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (!open) {
          recognitionRef.current?.stop();
          setIsRecording(false);
        }
        setIsModalOpen(open);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isVoiceMode && <Mic className="w-5 h-5" />}
              {editingSummary ? 'Editar Resumo' : (isVoiceMode ? 'Gravar Resumo por Voz' : 'Novo Resumo')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Título</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do resumo"
              />
            </div>

            {isVoiceMode && !editingSummary && (
              <div className="flex justify-center py-4">
                <button
                  onClick={toggleRecording}
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center transition-all",
                    isRecording 
                      ? "bg-destructive text-destructive-foreground animate-pulse" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {isRecording ? (
                    <MicOff className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Conteúdo {isVoiceMode && '(texto transcrito)'}
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isVoiceMode ? "Clique no microfone e comece a falar..." : "Digite seu resumo..."}
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              recognitionRef.current?.stop();
              setIsModalOpen(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!title.trim() || !content.trim()}>
              {editingSummary ? 'Salvar' : 'Criar Resumo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Simulado, SimuladoQuestion } from '@/types/training';
import { Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface CreateSimuladoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (simulado: Simulado) => void;
}

const disciplines = [
  'Direito Constitucional',
  'Português',
  'Matemática Financeira',
  'Raciocínio Lógico',
  'Informática',
  'Conhecimentos Gerais',
];

export function CreateSimuladoModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateSimuladoModalProps) {
  const [name, setName] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [subject, setSubject] = useState('');
  const [timeMinutes, setTimeMinutes] = useState('30');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questions, setQuestions] = useState<SimuladoQuestion[]>([]);
  
  // For manual question creation
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'true-false'>('multiple-choice');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  
  // For content generation
  const [contentText, setContentText] = useState('');
  const [questionCount, setQuestionCount] = useState('10');

  const handleAddQuestion = () => {
    if (!questionText.trim()) {
      toast.error('Digite o enunciado da questão');
      return;
    }
    
    if (questionType === 'multiple-choice') {
      const filledOptions = options.filter(o => o.trim());
      if (filledOptions.length < 2) {
        toast.error('Adicione pelo menos 2 alternativas');
        return;
      }
    }
    
    const newQuestion: SimuladoQuestion = {
      id: Date.now().toString(),
      text: questionText.trim(),
      type: questionType,
      options: questionType === 'multiple-choice' 
        ? options.filter(o => o.trim())
        : ['Verdadeiro', 'Falso'],
      correctAnswer: questionType === 'true-false' ? 0 : correctAnswer,
    };
    
    setQuestions([...questions, newQuestion]);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
    toast.success('Questão adicionada!');
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleGenerateFromContent = () => {
    if (!contentText.trim()) {
      toast.error('Digite ou cole um conteúdo primeiro');
      return;
    }
    
    // Simulated generation
    const sentences = contentText.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const count = Math.min(parseInt(questionCount), sentences.length, 15);
    
    const generatedQuestions: SimuladoQuestion[] = sentences.slice(0, count).map((sentence, index) => ({
      id: `gen-${Date.now()}-${index}`,
      text: `Sobre "${sentence.trim().slice(0, 50)}...", é correto afirmar:`,
      type: 'multiple-choice',
      options: [
        sentence.trim(),
        'Alternativa incorreta A',
        'Alternativa incorreta B',
        'Alternativa incorreta C',
      ],
      correctAnswer: 0,
    }));
    
    setQuestions([...questions, ...generatedQuestions]);
    setContentText('');
    toast.success(`${generatedQuestions.length} questões geradas!`);
  };

  const handleSubmit = () => {
    if (!name.trim() || !discipline || questions.length === 0) {
      toast.error('Preencha o nome, disciplina e adicione ao menos 1 questão');
      return;
    }
    
    const simulado: Simulado = {
      id: Date.now().toString(),
      name: name.trim(),
      discipline,
      subject: subject.trim(),
      questions,
      timeMinutes: parseInt(timeMinutes),
      difficulty,
      status: 'pending',
      createdAt: new Date(),
    };
    
    onSubmit(simulado);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName('');
    setDiscipline('');
    setSubject('');
    setTimeMinutes('30');
    setDifficulty('medium');
    setQuestions([]);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setContentText('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Simulado</DialogTitle>
          <DialogDescription>
            Crie provas com questões e tempo cronometrado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Simulado Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Nome do simulado *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Simulado Constitucional"
              />
            </div>
            <div className="space-y-2">
              <Label>Disciplina *</Label>
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {disciplines.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Princípios"
              />
            </div>
            <div className="space-y-2">
              <Label>Tempo (min)</Label>
              <Select value={timeMinutes} onValueChange={setTimeMinutes}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[15, 20, 30, 45, 60, 90, 120].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dificuldade</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as 'easy' | 'medium' | 'hard')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add Question */}
          <div className="border border-border rounded-lg p-4 space-y-3">
            <h4 className="font-medium">Adicionar questão</h4>
            
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={questionType} onValueChange={(v) => setQuestionType(v as 'multiple-choice' | 'true-false')}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Múltipla escolha</SelectItem>
                  <SelectItem value="true-false">Verdadeiro/Falso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Enunciado</Label>
              <Textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Digite o enunciado da questão..."
                rows={2}
              />
            </div>

            {questionType === 'multiple-choice' && (
              <div className="space-y-2">
                <Label>Alternativas (marque a correta)</Label>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={correctAnswer === index}
                      onChange={() => setCorrectAnswer(index)}
                      className="w-4 h-4"
                    />
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            )}

            {questionType === 'true-false' && (
              <div className="space-y-2">
                <Label>Resposta correta</Label>
                <Select value={correctAnswer.toString()} onValueChange={(v) => setCorrectAnswer(parseInt(v))}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Verdadeiro</SelectItem>
                    <SelectItem value="1">Falso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={handleAddQuestion} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar questão
            </Button>
          </div>

          {/* Generate from content */}
          <div className="border border-border rounded-lg p-4 space-y-3">
            <h4 className="font-medium">Gerar de conteúdo</h4>
            <Textarea
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="Cole um texto para gerar questões automaticamente..."
              rows={3}
            />
            <div className="flex items-center gap-3">
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleGenerateFromContent} size="sm" variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Gerar questões
              </Button>
            </div>
          </div>

          {/* Questions Preview */}
          {questions.length > 0 && (
            <div className="space-y-2">
              <Label>Questões ({questions.length})</Label>
              <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded-lg p-3">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between bg-secondary/50 rounded-lg p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{index + 1}. {q.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {q.type === 'multiple-choice' ? 'Múltipla escolha' : 'V/F'} • {q.options?.length} alternativas
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="shrink-0 ml-2"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name || !discipline || questions.length === 0}>
            Criar simulado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

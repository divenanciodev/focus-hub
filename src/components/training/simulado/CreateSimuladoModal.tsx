import { useState, useEffect, useRef } from 'react';
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
import { Plus, Trash2, Upload, Loader2, Sparkles, FileText, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CreateSimuladoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (simulado: Simulado) => void;
  editingSimulado?: Simulado;
}

const disciplines = [
  'Direito Constitucional',
  'Português',
  'Matemática Financeira',
  'Raciocínio Lógico',
  'Informática',
  'Conhecimentos Gerais',
];

const niveis = ['Fundamental', 'Médio', 'Superior'];

export function CreateSimuladoModal({
  open,
  onOpenChange,
  onSubmit,
  editingSimulado,
}: CreateSimuladoModalProps) {
  const [name, setName] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [subject, setSubject] = useState('');
  const [timeMinutes, setTimeMinutes] = useState('30');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questions, setQuestions] = useState<SimuladoQuestion[]>([]);
  
  // New fields for simulado metadata
  const [cargo, setCargo] = useState('');
  const [ano, setAno] = useState('');
  const [orgao, setOrgao] = useState('');
  const [instituicao, setInstituicao] = useState('');
  const [nivel, setNivel] = useState('');
  
  // For manual question creation
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'true-false'>('multiple-choice');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [showManualForm, setShowManualForm] = useState(false);
  
  // For content generation
  const [contentText, setContentText] = useState('');
  const [questionCount, setQuestionCount] = useState('10');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // For PDF upload
  const [isParsing, setIsParsing] = useState(false);
  const [gabarito, setGabarito] = useState('');
  const [showGabaritoInput, setShowGabaritoInput] = useState(false);
  const [uploadedContent, setUploadedContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load editing data when modal opens with editingSimulado
  useEffect(() => {
    if (editingSimulado && open) {
      setName(editingSimulado.name);
      setDiscipline(editingSimulado.discipline || '');
      setSubject(editingSimulado.subject || '');
      setTimeMinutes(editingSimulado.timeMinutes.toString());
      setDifficulty(editingSimulado.difficulty);
      setQuestions(editingSimulado.questions);
      // Load new fields if they exist
      setCargo((editingSimulado as any).cargo || '');
      setAno((editingSimulado as any).ano || '');
      setOrgao((editingSimulado as any).orgao || '');
      setInstituicao((editingSimulado as any).instituicao || '');
      setNivel((editingSimulado as any).nivel || '');
    } else if (!open) {
      resetForm();
    }
  }, [editingSimulado, open]);

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
    setShowManualForm(false);
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

  const handleGenerateFromContent = async () => {
    if (!contentText.trim()) {
      toast.error('Digite ou cole um conteúdo primeiro');
      return;
    }
    
    if (contentText.trim().length < 100) {
      toast.error('O conteúdo precisa ter pelo menos 100 caracteres para gerar questões de qualidade');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: {
          content: contentText.trim(),
          questionCount: parseInt(questionCount),
          difficulty,
        },
      });

      if (error) {
        console.error('Error generating questions:', error);
        toast.error('Erro ao gerar questões. Tente novamente.');
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const generatedQuestions: SimuladoQuestion[] = data.questions.map((q: any, index: number) => ({
        id: `gen-${Date.now()}-${index}`,
        text: q.text,
        type: q.type || 'multiple-choice',
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));

      setQuestions([...questions, ...generatedQuestions]);
      setContentText('');
      toast.success(`${generatedQuestions.length} questões geradas com sucesso!`);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Erro ao gerar questões. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.type.startsWith('text/')) {
      toast.error('Envie um arquivo PDF ou texto');
      return;
    }

    setIsParsing(true);
    
    try {
      // Read file content
      let content = '';
      
      if (file.type.startsWith('text/')) {
        content = await file.text();
      } else {
        // For PDF, we'll read as text (basic extraction)
        // In a real scenario, you'd use a PDF parser
        const reader = new FileReader();
        content = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string || '');
          reader.readAsText(file);
        });
      }

      if (!content.trim()) {
        toast.error('Não foi possível extrair conteúdo do arquivo');
        return;
      }

      setUploadedContent(content);
      setShowGabaritoInput(true);
      toast.success('Arquivo carregado! Agora cole o gabarito (opcional) e clique em processar.');
    } catch (err) {
      console.error('Error reading file:', err);
      toast.error('Erro ao ler o arquivo');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleProcessUploadedContent = async () => {
    if (!uploadedContent.trim()) {
      toast.error('Nenhum conteúdo para processar');
      return;
    }

    setIsParsing(true);

    try {
      const { data, error } = await supabase.functions.invoke('parse-simulado-content', {
        body: {
          content: uploadedContent,
          gabarito: gabarito.trim() || undefined,
        },
      });

      if (error) {
        console.error('Error parsing content:', error);
        toast.error('Erro ao processar questões. Tente novamente.');
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const parsedQuestions: SimuladoQuestion[] = data.questions.map((q: any, index: number) => ({
        id: `parsed-${Date.now()}-${index}`,
        text: q.text,
        type: q.type === 'verdadeiro_falso' || q.type === 'certo_errado' ? 'true-false' : 'multiple-choice',
        options: q.options?.map((opt: any) => opt.texto || opt) || [],
        correctAnswer: q.correctAnswer ?? 0,
      }));

      setQuestions([...questions, ...parsedQuestions]);
      setUploadedContent('');
      setGabarito('');
      setShowGabaritoInput(false);
      toast.success(`${parsedQuestions.length} questões importadas com sucesso!`);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Erro ao processar questões. Tente novamente.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || questions.length === 0) {
      toast.error('Preencha o nome e adicione ao menos 1 questão');
      return;
    }
    
    const simulado: Simulado = {
      id: editingSimulado?.id || Date.now().toString(),
      name: name.trim(),
      discipline: discipline || 'Geral',
      subject: subject.trim(),
      questions,
      timeMinutes: parseInt(timeMinutes),
      difficulty,
      status: editingSimulado?.status || 'pending',
      score: editingSimulado?.score,
      createdAt: editingSimulado?.createdAt || new Date(),
      // Add new fields
      cargo: cargo.trim(),
      ano: ano.trim(),
      orgao: orgao.trim(),
      instituicao: instituicao.trim(),
      nivel,
    } as Simulado & { cargo: string; ano: string; orgao: string; instituicao: string; nivel: string };
    
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
    setCargo('');
    setAno('');
    setOrgao('');
    setInstituicao('');
    setNivel('');
    setShowManualForm(false);
    setShowGabaritoInput(false);
    setUploadedContent('');
    setGabarito('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingSimulado ? 'Editar Simulado' : 'Criar Simulado'}</DialogTitle>
          <DialogDescription>
            {editingSimulado ? 'Edite as informações e questões do simulado' : 'Crie provas com questões e tempo cronometrado'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Simulado Info - Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Nome do simulado *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Prova Oficial Administrativo"
              />
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex: Oficial Administrativo"
              />
            </div>
          </div>

          {/* Simulado Info - Row 2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label>Ano</Label>
              <Input
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                placeholder="Ex: 2019"
              />
            </div>
            <div className="space-y-2">
              <Label>Órgão</Label>
              <Input
                value={orgao}
                onChange={(e) => setOrgao(e.target.value)}
                placeholder="Ex: Pref. Guarapuava/PR"
              />
            </div>
            <div className="space-y-2">
              <Label>Instituição</Label>
              <Input
                value={instituicao}
                onChange={(e) => setInstituicao(e.target.value)}
                placeholder="Ex: FAUEL"
              />
            </div>
            <div className="space-y-2">
              <Label>Nível</Label>
              <Select value={nivel} onValueChange={setNivel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {niveis.map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Simulado Info - Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Disciplina</Label>
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger>
                  <SelectValue placeholder="Opcional..." />
                </SelectTrigger>
                <SelectContent>
                  {disciplines.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Princípios Constitucionais, Direitos Fundamentais..."
              />
            </div>
          </div>

          {/* Time and Difficulty - Smaller */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tempo</Label>
              <Select value={timeMinutes} onValueChange={setTimeMinutes}>
                <SelectTrigger className="h-9">
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
                <SelectTrigger className="h-9">
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

          {/* Generate from content - FIRST */}
          <div className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h4 className="font-medium">Gerar questões com IA</h4>
            </div>
            <Textarea
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="Cole um texto de estudo para gerar questões automaticamente com IA..."
              rows={4}
            />
            <div className="flex items-center gap-3">
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {Array.from({ length: 20 }, (_, i) => (i + 1) * 5).map(n => (
                    <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleGenerateFromContent} 
                size="sm" 
                disabled={isGenerating || !contentText.trim()}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar questões
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Add Questions Section */}
          <div className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center">
              <h4 className="font-semibold">Adicionar questões</h4>
            </div>
            
            {/* Two buttons: Manual and Upload */}
            {!showManualForm && !showGabaritoInput && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowManualForm(true)}
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <PenLine className="w-5 h-5" />
                  <span className="text-sm">Adicionar Manual</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isParsing}
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  {isParsing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  <span className="text-sm">Upload de Questões</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Gabarito input after file upload */}
            {showGabaritoInput && (
              <div className="space-y-3">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Arquivo carregado com {uploadedContent.length} caracteres
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Gabarito (opcional)</Label>
                  <Textarea
                    value={gabarito}
                    onChange={(e) => setGabarito(e.target.value)}
                    placeholder="Cole o gabarito no formato: 1-A, 2-C, 3-B ou 1-A 2-C 3-B..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowGabaritoInput(false);
                      setUploadedContent('');
                      setGabarito('');
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleProcessUploadedContent}
                    disabled={isParsing}
                    className="flex-1"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Processar Questões
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Manual question form */}
            {showManualForm && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={questionType} onValueChange={(v) => setQuestionType(v as 'multiple-choice' | 'true-false')}>
                    <SelectTrigger>
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
                          className="w-4 h-4 shrink-0"
                        />
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {questionType === 'true-false' && (
                  <div className="space-y-2">
                    <Label>Resposta correta</Label>
                    <Select value={correctAnswer.toString()} onValueChange={(v) => setCorrectAnswer(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Verdadeiro</SelectItem>
                        <SelectItem value="1">Falso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowManualForm(false)} 
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddQuestion} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Questions Preview */}
          {questions.length > 0 && (
            <div className="space-y-2">
              <Label>Questões ({questions.length})</Label>
              <div className="max-h-60 overflow-y-auto overflow-x-hidden space-y-2 border border-border rounded-lg p-3">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="flex items-start gap-2 bg-secondary/50 rounded-lg p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium break-words">{index + 1}. {q.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {q.type === 'multiple-choice' ? 'Múltipla escolha' : 'V/F'} • {q.options?.length} alternativas
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="shrink-0"
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
          <Button onClick={handleSubmit} disabled={!name || questions.length === 0}>
            {editingSimulado ? 'Salvar alterações' : 'Criar simulado'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
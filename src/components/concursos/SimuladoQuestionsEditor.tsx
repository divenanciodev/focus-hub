import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, ChevronDown, ChevronUp, Check, GripVertical, BookOpen, FileText, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SimuladoQuestion, QuestionSupportText } from '@/types/training';
import { EvaluationCriteria } from '@/hooks/useContests';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CriteriaOption {
  id: string;
  name: string;
  level: string;
}

interface SimuladoQuestionsEditorProps {
  questions: SimuladoQuestion[];
  onChange: (questions: SimuladoQuestion[]) => void;
  evaluationCriteria?: EvaluationCriteria[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

// Agrupa questões por critério para exibir estatísticas
function getQuestionsByCriteria(questions: SimuladoQuestion[]): Map<string, { name: string; count: number }> {
  const map = new Map<string, { name: string; count: number }>();
  for (const q of questions) {
    if (q.criteriaName) {
      const existing = map.get(q.criteriaName);
      if (existing) {
        existing.count++;
      } else {
        map.set(q.criteriaName, { name: q.criteriaName, count: 1 });
      }
    }
  }
  return map;
}

export function SimuladoQuestionsEditor({ questions, onChange, evaluationCriteria = [] }: SimuladoQuestionsEditorProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Sem categoria']));
  const [showBulkGabarito, setShowBulkGabarito] = useState(false);
  const [gabaritoCount, setGabaritoCount] = useState('');
  const [gabaritoAnswers, setGabaritoAnswers] = useState<string[]>([]);
  const [selectedGabaritoCategory, setSelectedGabaritoCategory] = useState<string>('');

  // Gera lista de opções de conteúdo a partir dos critérios de avaliação
  const criteriaOptions: CriteriaOption[] = evaluationCriteria.flatMap((criteria) =>
    criteria.items.map((item) => ({
      id: item.id,
      name: item.content,
      level: criteria.level,
    }))
  );

  // Estatísticas de questões por matéria
  const questionsByCriteria = getQuestionsByCriteria(questions);

  // Agrupa questões por categoria para exibição organizada
  const groupedQuestions = questions.reduce((acc, question, originalIndex) => {
    const category = question.criteriaName || 'Sem categoria';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ question, originalIndex });
    return acc;
  }, {} as Record<string, { question: SimuladoQuestion; originalIndex: number }[]>);

  // Ordem das categorias: primeiro as que têm critérios definidos, depois "Sem categoria"
  const categoryOrder = [
    ...criteriaOptions.map(c => c.name).filter(name => groupedQuestions[name]),
    ...Object.keys(groupedQuestions).filter(k => k !== 'Sem categoria' && !criteriaOptions.some(c => c.name === k)),
    ...(groupedQuestions['Sem categoria'] ? ['Sem categoria'] : [])
  ];

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addQuestion = (category?: string) => {
    // Find the criteria info if a category is provided
    const criteriaInfo = category ? criteriaOptions.find(c => c.name === category) : undefined;
    
    const newQuestion: SimuladoQuestion = {
      id: generateId(),
      statement: '',
      type: 'multiple-choice',
      options: ['', '', '', '', ''],
      correctAnswer: 0,
      supportTexts: [],
      criteriaId: criteriaInfo?.id,
      criteriaName: criteriaInfo?.name,
    };
    onChange([...questions, newQuestion]);
    setExpandedQuestions((prev) => new Set([...prev, newQuestion.id]));
    
    // Expand the category if adding to a specific one
    if (category) {
      setExpandedCategories((prev) => new Set([...prev, category]));
    }
  };

  const removeQuestion = (id: string) => {
    onChange(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<SimuladoQuestion>) => {
    onChange(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || !question.options) return;

    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    updateQuestion(questionId, { options: newOptions });
  };

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || !question.options) return;

    updateQuestion(questionId, { options: [...question.options, ''] });
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || !question.options || question.options.length <= 2) return;

    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    let newCorrectAnswer = question.correctAnswer as number;
    
    if (optionIndex === newCorrectAnswer) {
      newCorrectAnswer = 0;
    } else if (optionIndex < newCorrectAnswer) {
      newCorrectAnswer--;
    }

    updateQuestion(questionId, { options: newOptions, correctAnswer: newCorrectAnswer });
  };

  // Funções para textos de suporte
  const addSupportText = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const newText: QuestionSupportText = {
      id: generateId(),
      content: '',
    };
    updateQuestion(questionId, {
      supportTexts: [...(question.supportTexts || []), newText],
    });
  };

  const updateSupportText = (questionId: string, textId: string, updates: Partial<QuestionSupportText>) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || !question.supportTexts) return;

    const newTexts = question.supportTexts.map((t) =>
      t.id === textId ? { ...t, ...updates } : t
    );
    updateQuestion(questionId, { supportTexts: newTexts });
  };

  const removeSupportText = (questionId: string, textId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || !question.supportTexts) return;

    updateQuestion(questionId, {
      supportTexts: question.supportTexts.filter((t) => t.id !== textId),
    });
  };

  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D, E...
  };

  // Initialize gabarito fields when count changes
  const handleGabaritoCountChange = (value: string) => {
    setGabaritoCount(value);
    const count = parseInt(value) || 0;
    if (count > 0 && count <= 200) {
      setGabaritoAnswers(Array(count).fill(''));
    } else {
      setGabaritoAnswers([]);
    }
  };

  // Update individual answer
  const updateGabaritoAnswer = (index: number, value: string) => {
    const upper = value.toUpperCase();
    // Only allow A-E
    if (upper === '' || /^[A-E]$/.test(upper)) {
      const newAnswers = [...gabaritoAnswers];
      newAnswers[index] = upper;
      setGabaritoAnswers(newAnswers);
    }
  };

  // Apply gabarito to questions (with optional category filter)
  const applyBulkGabarito = () => {
    if (gabaritoAnswers.length === 0) {
      toast.error('Defina a quantidade de questões primeiro');
      return;
    }

    const filledAnswers = gabaritoAnswers.filter(a => a !== '');
    if (filledAnswers.length === 0) {
      toast.error('Preencha pelo menos uma alternativa');
      return;
    }

    // Get criteria info for the selected category
    const criteriaInfo = selectedGabaritoCategory 
      ? criteriaOptions.find(c => c.name === selectedGabaritoCategory) 
      : undefined;

    // Create or update questions based on gabarito
    const updatedQuestions = [...questions];
    
    if (selectedGabaritoCategory) {
      // Filter questions in this category
      const categoryQuestions = questions.filter(q => q.criteriaName === selectedGabaritoCategory);
      const categoryStartIndex = categoryQuestions.length;
      
      // Create new questions for this category
      for (let i = categoryStartIndex; i < gabaritoAnswers.length; i++) {
        updatedQuestions.push({
          id: generateId(),
          statement: '',
          type: 'multiple-choice',
          options: ['', '', '', '', ''],
          correctAnswer: 0,
          supportTexts: [],
          criteriaId: criteriaInfo?.id,
          criteriaName: criteriaInfo?.name,
        });
      }
      
      // Apply answers only to questions in this category
      let categoryIndex = 0;
      for (let i = 0; i < updatedQuestions.length && categoryIndex < gabaritoAnswers.length; i++) {
        if (updatedQuestions[i].criteriaName === selectedGabaritoCategory) {
          const answer = gabaritoAnswers[categoryIndex];
          if (answer) {
            const answerIndex = answer.charCodeAt(0) - 65;
            updatedQuestions[i] = { ...updatedQuestions[i], correctAnswer: answerIndex };
          }
          categoryIndex++;
        }
      }
    } else {
      // No category selected - apply to all questions (original behavior)
      for (let i = questions.length; i < gabaritoAnswers.length; i++) {
        updatedQuestions.push({
          id: generateId(),
          statement: '',
          type: 'multiple-choice',
          options: ['', '', '', '', ''],
          correctAnswer: 0,
          supportTexts: [],
        });
      }

      // Apply answers
      gabaritoAnswers.forEach((answer, index) => {
        if (answer && index < updatedQuestions.length) {
          const answerIndex = answer.charCodeAt(0) - 65;
          updatedQuestions[index] = { ...updatedQuestions[index], correctAnswer: answerIndex };
        }
      });
    }

    onChange(updatedQuestions);
    setShowBulkGabarito(false);
    setGabaritoCount('');
    setGabaritoAnswers([]);
    setSelectedGabaritoCategory('');
    
    const categoryText = selectedGabaritoCategory ? ` para "${selectedGabaritoCategory}"` : '';
    toast.success(`Gabarito aplicado${categoryText}! ${gabaritoAnswers.length} questões.`);
  };

  // Load existing gabarito from questions
  const loadExistingGabarito = () => {
    if (questions.length > 0) {
      setGabaritoCount(questions.length.toString());
      setGabaritoAnswers(
        questions.map(q => 
          typeof q.correctAnswer === 'number' ? getOptionLabel(q.correctAnswer) : ''
        )
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Questões do Simulado</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione questões estruturadas com textos de apoio e alternativas.
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {questions.length} {questions.length === 1 ? 'questão' : 'questões'}
        </span>
      </div>

      {/* Bulk Gabarito Section */}
      <div className="border border-primary/30 rounded-lg p-3 bg-primary/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-primary" />
            <Label className="text-sm font-semibold text-primary">Gabarito Rápido</Label>
          </div>
          <div className="flex items-center gap-2">
            {questions.length > 0 && !showBulkGabarito && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  loadExistingGabarito();
                  setShowBulkGabarito(true);
                }}
              >
                Editar Gabarito
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setShowBulkGabarito(!showBulkGabarito);
                if (!showBulkGabarito && gabaritoAnswers.length === 0) {
                  setGabaritoCount('');
                }
              }}
            >
              {showBulkGabarito ? 'Ocultar' : 'Novo Gabarito'}
            </Button>
          </div>
        </div>

        {showBulkGabarito && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Selecione uma matéria (opcional), defina a quantidade e preencha as alternativas (A-E).
            </p>

            {/* Category Selector */}
            {criteriaOptions.length > 0 && (
              <div className="flex items-center gap-3">
                <Label className="text-sm whitespace-nowrap">Matéria:</Label>
                <Select
                  value={selectedGabaritoCategory || '__all__'}
                  onValueChange={(val) => setSelectedGabaritoCategory(val === '__all__' ? '' : val)}
                >
                  <SelectTrigger className="w-48 h-8 text-sm">
                    <SelectValue placeholder="Todas as matérias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todas as matérias</SelectItem>
                    {criteriaOptions.map((criteria) => (
                      <SelectItem key={criteria.id} value={criteria.name}>
                        {criteria.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedGabaritoCategory && (
                  <Badge variant="secondary" className="text-xs">
                    {groupedQuestions[selectedGabaritoCategory]?.length || 0} questões existentes
                  </Badge>
                )}
              </div>
            )}

            {/* Question Count Input */}
            <div className="flex items-center gap-3">
              <Label className="text-sm whitespace-nowrap">Quantidade de questões:</Label>
              <Input
                type="number"
                value={gabaritoCount}
                onChange={(e) => handleGabaritoCountChange(e.target.value)}
                placeholder="Ex: 30"
                className="w-24 h-8 text-sm text-center"
                min={1}
                max={200}
              />
              {questions.length > 0 && gabaritoAnswers.length === 0 && !selectedGabaritoCategory && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={loadExistingGabarito}
                >
                  Carregar das questões ({questions.length})
                </Button>
              )}
              {selectedGabaritoCategory && groupedQuestions[selectedGabaritoCategory]?.length > 0 && gabaritoAnswers.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    const categoryQs = groupedQuestions[selectedGabaritoCategory] || [];
                    setGabaritoCount(categoryQs.length.toString());
                    setGabaritoAnswers(
                      categoryQs.map(({ question }) => 
                        typeof question.correctAnswer === 'number' ? getOptionLabel(question.correctAnswer) : ''
                      )
                    );
                  }}
                >
                  Carregar de {selectedGabaritoCategory} ({groupedQuestions[selectedGabaritoCategory]?.length})
                </Button>
              )}
            </div>

            {/* Gabarito Grid */}
            {gabaritoAnswers.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-10 gap-2 text-xs font-medium text-muted-foreground border-b border-border pb-2">
                  <div className="col-span-1 text-center">Nº</div>
                  <div className="col-span-1 text-center">Resp.</div>
                  <div className="col-span-1 text-center">Nº</div>
                  <div className="col-span-1 text-center">Resp.</div>
                  <div className="col-span-1 text-center">Nº</div>
                  <div className="col-span-1 text-center">Resp.</div>
                  <div className="col-span-1 text-center">Nº</div>
                  <div className="col-span-1 text-center">Resp.</div>
                  <div className="col-span-1 text-center">Nº</div>
                  <div className="col-span-1 text-center">Resp.</div>
                </div>

                <div className="grid grid-cols-10 gap-2">
                  {gabaritoAnswers.map((answer, index) => (
                    <div key={index} className="contents">
                      <div className="flex items-center justify-center text-xs font-medium text-muted-foreground">
                        {index + 1}
                      </div>
                      <Input
                        value={answer}
                        onChange={(e) => updateGabaritoAnswer(index, e.target.value)}
                        className={cn(
                          "h-7 text-center text-sm font-medium uppercase",
                          answer ? "border-success bg-success/10 text-success" : ""
                        )}
                        maxLength={1}
                        placeholder="-"
                        onKeyDown={(e) => {
                          // Move to next input on valid letter
                          if (/^[a-eA-E]$/.test(e.key) && index < gabaritoAnswers.length - 1) {
                            setTimeout(() => {
                              const nextInput = document.querySelector(
                                `[data-gabarito-index="${index + 1}"]`
                              ) as HTMLInputElement;
                              nextInput?.focus();
                            }, 10);
                          }
                        }}
                        data-gabarito-index={index}
                      />
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Preenchidas:</span>{' '}
                    {gabaritoAnswers.filter(a => a !== '').length} de {gabaritoAnswers.length}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        setShowBulkGabarito(false);
                        setGabaritoCount('');
                        setGabaritoAnswers([]);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={applyBulkGabarito}
                      disabled={gabaritoAnswers.filter(a => a !== '').length === 0}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Salvar Gabarito
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Estatísticas por Matéria */}
      {questionsByCriteria.size > 0 && (
        <div className="p-3 bg-muted/30 rounded-lg space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Distribuição por matéria</Label>
          <div className="flex flex-wrap gap-2">
            {Array.from(questionsByCriteria.entries()).map(([name, data]) => (
              <Badge key={name} variant="secondary" className="text-xs">
                {data.name}: {data.count} {data.count === 1 ? 'questão' : 'questões'}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Questions List - Organized by Category */}
      <div className="space-y-4">
        {categoryOrder.length > 0 ? (
          categoryOrder.map((category) => {
            const categoryQuestions = groupedQuestions[category] || [];
            const isCategoryExpanded = expandedCategories.has(category);
            
            return (
              <div key={category} className="border border-border rounded-lg overflow-hidden">
                {/* Category Header */}
                <div
                  className={cn(
                    "flex items-center justify-between p-3 cursor-pointer transition-colors",
                    category === 'Sem categoria' 
                      ? "bg-muted/30 hover:bg-muted/50" 
                      : "bg-primary/5 hover:bg-primary/10"
                  )}
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center gap-3">
                    {isCategoryExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                    <BookOpen className={cn(
                      "w-4 h-4",
                      category === 'Sem categoria' ? "text-muted-foreground" : "text-primary"
                    )} />
                    <span className={cn(
                      "font-medium text-sm",
                      category === 'Sem categoria' ? "text-muted-foreground" : "text-foreground"
                    )}>
                      {category}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {categoryQuestions.length} {categoryQuestions.length === 1 ? 'questão' : 'questões'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      addQuestion(category === 'Sem categoria' ? undefined : category);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar
                  </Button>
                </div>

                {/* Category Questions */}
                {isCategoryExpanded && (
                  <div className="p-3 space-y-3 bg-background">
                    {categoryQuestions.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4 italic">
                        Nenhuma questão nesta matéria. Clique em "Adicionar" acima.
                      </p>
                    ) : (
                      categoryQuestions.map(({ question, originalIndex }) => {
                        const isExpanded = expandedQuestions.has(question.id);

                        return (
                          <div
                            key={question.id}
                            className="border border-border rounded-lg overflow-hidden"
                          >
                            {/* Question Header */}
                            <div
                              className="flex items-center gap-2 p-3 bg-muted/50 cursor-pointer"
                              onClick={() => toggleExpanded(question.id)}
                            >
                              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="font-medium text-sm w-8 shrink-0">
                                Q{originalIndex + 1}
                              </span>
                              <span className="text-sm text-muted-foreground flex-1 truncate">
                                {question.title || question.statement || '(Sem enunciado)'}
                              </span>
                              {question.options && typeof question.correctAnswer === 'number' && (
                                <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded shrink-0">
                                  Gabarito: {getOptionLabel(question.correctAnswer)}
                                </span>
                              )}
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeQuestion(question.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Question Content */}
                            {isExpanded && (
                              <div className="p-3 space-y-4">
                                {/* 1. Conteúdo Associado (PRIMEIRO) */}
                                {criteriaOptions.length > 0 && (
                                  <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                                    <div className="flex items-center gap-2">
                                      <BookOpen className="w-4 h-4 text-primary" />
                                      <Label className="text-xs font-semibold text-primary">Conteúdo Associado</Label>
                                    </div>
                                    <Select
                                      value={question.criteriaId || ''}
                                      onValueChange={(value) => {
                                        const selectedCriteria = criteriaOptions.find((c) => c.id === value);
                                        updateQuestion(question.id, {
                                          criteriaId: value || undefined,
                                          criteriaName: selectedCriteria?.name || undefined,
                                        });
                                      }}
                                    >
                                      <SelectTrigger className="h-9 text-sm">
                                        <SelectValue placeholder="Selecione a matéria/conteúdo..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {evaluationCriteria.map((criteria) => (
                                          <div key={criteria.level}>
                                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                                              {criteria.level}
                                            </div>
                                            {criteria.items.map((item) => (
                                              <SelectItem key={item.id} value={item.id}>
                                                {item.content}
                                              </SelectItem>
                                            ))}
                                          </div>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                {/* 2. Título da Questão (opcional) */}
                                <div className="space-y-2">
                                  <Label className="text-xs">Título da questão (opcional)</Label>
                                  <Input
                                    value={question.title || ''}
                                    onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                                    placeholder="Ex: Questão sobre Princípios Constitucionais"
                                    className="h-9 text-sm"
                                  />
                                </div>

                                {/* 3. Textos de Suporte */}
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-muted-foreground" />
                                      <Label className="text-xs font-medium">Textos de Apoio</Label>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs"
                                      onClick={() => addSupportText(question.id)}
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Adicionar texto
                                    </Button>
                                  </div>

                                  {question.supportTexts && question.supportTexts.length > 0 ? (
                                    <div className="space-y-3">
                                      {question.supportTexts.map((text, textIndex) => (
                                        <div key={text.id} className="p-3 bg-muted/30 rounded-lg space-y-2 relative">
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-muted-foreground">
                                              Texto {textIndex + 1}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                              onClick={() => removeSupportText(question.id, text.id)}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </div>
                                          <Input
                                            value={text.title || ''}
                                            onChange={(e) => updateSupportText(question.id, text.id, { title: e.target.value })}
                                            placeholder="Título do texto (opcional)"
                                            className="h-8 text-sm"
                                          />
                                          <Textarea
                                            value={text.content}
                                            onChange={(e) => updateSupportText(question.id, text.id, { content: e.target.value })}
                                            placeholder="Cole ou digite o texto de apoio aqui..."
                                            className="resize-none min-h-[80px] text-sm"
                                          />
                                          <Input
                                            value={text.reference || ''}
                                            onChange={(e) => updateSupportText(question.id, text.id, { reference: e.target.value })}
                                            placeholder="Referência/Fonte (ex: Autor, Livro, Ano)"
                                            className="h-8 text-xs text-muted-foreground"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic">
                                      Nenhum texto de apoio adicionado. Clique acima para adicionar.
                                    </p>
                                  )}
                                </div>

                                {/* 4. Enunciado (Comando da Questão) */}
                                <div className="space-y-2 p-3 bg-accent/30 rounded-lg border border-accent/50">
                                  <Label className="text-xs font-semibold">Enunciado / Comando da Questão</Label>
                                  <Textarea
                                    value={question.statement}
                                    onChange={(e) => updateQuestion(question.id, { statement: e.target.value })}
                                    placeholder="Digite o comando da questão. Ex: 'Com base no texto acima, assinale a alternativa correta:'"
                                    className="resize-none min-h-[60px] text-sm"
                                  />
                                </div>

                                {/* 5. Alternativas e Gabarito */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Alternativas e Gabarito</Label>
                                    <span className="text-xs text-muted-foreground">
                                      Clique na alternativa correta para definir o gabarito
                                    </span>
                                  </div>

                                  <RadioGroup
                                    value={String(question.correctAnswer)}
                                    onValueChange={(value) =>
                                      updateQuestion(question.id, { correctAnswer: parseInt(value) })
                                    }
                                    className="space-y-2"
                                  >
                                    {question.options?.map((option, optIndex) => (
                                      <div
                                        key={optIndex}
                                        className={cn(
                                          'flex items-center gap-2 p-2 rounded-md border transition-colors',
                                          question.correctAnswer === optIndex
                                            ? 'border-success bg-success/5'
                                            : 'border-border hover:border-muted-foreground/50'
                                        )}
                                      >
                                        <RadioGroupItem
                                          value={String(optIndex)}
                                          id={`${question.id}-${optIndex}`}
                                          className="shrink-0"
                                        />
                                        <label
                                          htmlFor={`${question.id}-${optIndex}`}
                                          className="w-6 text-sm font-medium shrink-0 cursor-pointer"
                                        >
                                          {getOptionLabel(optIndex)}
                                        </label>
                                        <Input
                                          value={option}
                                          onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                          placeholder={`Alternativa ${getOptionLabel(optIndex)}`}
                                          className="flex-1 h-8 text-sm"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        {question.correctAnswer === optIndex && (
                                          <Check className="w-4 h-4 text-success shrink-0" />
                                        )}
                                        {question.options && question.options.length > 2 && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                                            onClick={() => removeOption(question.id, optIndex)}
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                  </RadioGroup>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => addOption(question.id)}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar alternativa
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
            <p className="text-sm">Nenhuma questão adicionada</p>
            <p className="text-xs mt-1">Clique no botão abaixo para adicionar questões ao simulado</p>
          </div>
        )}
      </div>

      {/* Add Question Button (for uncategorized) */}
      <Button variant="outline" className="w-full" onClick={() => addQuestion()}>
        <Plus className="w-4 h-4 mr-2" />
        Adicionar questão sem categoria
      </Button>
    </div>
  );
}

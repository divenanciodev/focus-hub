import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, ChevronDown, ChevronUp, Check, GripVertical, BookOpen, FileText } from 'lucide-react';
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

  const addQuestion = () => {
    const newQuestion: SimuladoQuestion = {
      id: generateId(),
      statement: '',
      type: 'multiple-choice',
      options: ['', '', '', '', ''],
      correctAnswer: 0,
      supportTexts: [],
    };
    onChange([...questions, newQuestion]);
    setExpandedQuestions((prev) => new Set([...prev, newQuestion.id]));
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

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((question, qIndex) => {
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
                  Q{qIndex + 1}
                </span>
                <span className="text-sm text-muted-foreground flex-1 truncate">
                  {question.title || question.statement || '(Sem enunciado)'}
                </span>
                {question.criteriaName && (
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded shrink-0 max-w-[120px] truncate" title={question.criteriaName}>
                    {question.criteriaName}
                  </span>
                )}
                {question.options && question.options[(question.correctAnswer as number)]?.trim() && (
                  <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded shrink-0">
                    Gabarito: {getOptionLabel(question.correctAnswer as number)}
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
        })}
      </div>

      {/* Add Question Button */}
      <Button variant="outline" className="w-full" onClick={addQuestion}>
        <Plus className="w-4 h-4 mr-2" />
        Adicionar questão
      </Button>

      {questions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
          <p className="text-sm">Nenhuma questão adicionada</p>
          <p className="text-xs mt-1">Clique no botão acima para adicionar questões ao simulado</p>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, ChevronDown, ChevronUp, Check, GripVertical, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SimuladoQuestion } from '@/types/training';
import { EvaluationCriteria } from '@/hooks/useContests';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export function SimuladoQuestionsEditor({ questions, onChange, evaluationCriteria = [] }: SimuladoQuestionsEditorProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [pasteAlternatives, setPasteAlternatives] = useState<{ [key: string]: string }>({});

  // Gera lista de opções de conteúdo a partir dos critérios de avaliação
  const criteriaOptions: CriteriaOption[] = evaluationCriteria.flatMap((criteria) =>
    criteria.items.map((item) => ({
      id: item.id,
      name: item.content,
      level: criteria.level,
    }))
  );

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
      text: '',
      type: 'multiple-choice',
      options: ['', '', '', '', ''],
      correctAnswer: 0,
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

  const handlePasteAlternatives = (questionId: string) => {
    const text = pasteAlternatives[questionId];
    if (!text?.trim()) return;

    const lines = text.trim().split('\n').filter((line) => line.trim());
    const parsedOptions: string[] = [];

    for (const line of lines) {
      // Remove common prefixes like "a)", "A.", "1.", "1)", etc.
      const cleanedLine = line.replace(/^[a-eA-E1-5][\.\)\-\s]+/, '').trim();
      if (cleanedLine) {
        parsedOptions.push(cleanedLine);
      }
    }

    if (parsedOptions.length >= 2) {
      updateQuestion(questionId, { options: parsedOptions, correctAnswer: 0 });
      setPasteAlternatives((prev) => ({ ...prev, [questionId]: '' }));
    }
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
            Adicione questões de múltipla escolha e defina o gabarito.
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {questions.length} {questions.length === 1 ? 'questão' : 'questões'}
        </span>
      </div>

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
                  {question.text || '(Sem enunciado)'}
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
                  {/* Question Text */}
                  <div className="space-y-2">
                    <Label className="text-xs">Enunciado da questão</Label>
                    <Textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      placeholder="Digite ou cole o enunciado da questão aqui..."
                      className="resize-none min-h-[100px] text-sm"
                    />
                  </div>

                  {/* Criteria/Content Selector */}
                  {criteriaOptions.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-xs">Conteúdo associado</Label>
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
                          <SelectValue placeholder="Selecione o conteúdo relacionado..." />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Group by level */}
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
                      {question.criteriaName && (
                        <p className="text-xs text-muted-foreground">
                          Selecionado: <span className="font-medium text-foreground">{question.criteriaName}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Paste Alternatives */}
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs">Colar alternativas</Label>
                    <Textarea
                      value={pasteAlternatives[question.id] || ''}
                      onChange={(e) =>
                        setPasteAlternatives((prev) => ({
                          ...prev,
                          [question.id]: e.target.value,
                        }))
                      }
                      placeholder={`Cole as alternativas (uma por linha):\na) Primeira alternativa\nb) Segunda alternativa\nc) Terceira alternativa...`}
                      className="resize-none h-20 text-xs"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePasteAlternatives(question.id)}
                      disabled={!pasteAlternatives[question.id]?.trim()}
                    >
                      Importar alternativas
                    </Button>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Alternativas e Gabarito</Label>
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

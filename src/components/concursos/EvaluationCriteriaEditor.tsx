import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Pencil, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { EvaluationCriteria, EvaluationCriteriaItem } from '@/types/contests';

interface EvaluationCriteriaEditorProps {
  criteria: EvaluationCriteria[];
  onChange: (criteria: EvaluationCriteria[]) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export function EvaluationCriteriaEditor({ criteria, onChange }: EvaluationCriteriaEditorProps) {
  const [newLevel, setNewLevel] = useState('');
  const [expandedCriteria, setExpandedCriteria] = useState<Set<number>>(new Set([0]));
  const [editingItem, setEditingItem] = useState<{ criteriaIdx: number; itemId: string } | null>(null);
  const [editingItemValues, setEditingItemValues] = useState<Partial<EvaluationCriteriaItem>>({});

  const toggleExpanded = (idx: number) => {
    setExpandedCriteria((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const addCriteria = () => {
    if (!newLevel.trim()) return;
    const newCriteria: EvaluationCriteria = {
      level: newLevel.trim(),
      description: '',
      items: [],
      totalQuestions: 0,
      totalPoints: 0,
    };
    onChange([...criteria, newCriteria]);
    setExpandedCriteria((prev) => new Set([...prev, criteria.length]));
    setNewLevel('');
  };

  const removeCriteria = (idx: number) => {
    onChange(criteria.filter((_, i) => i !== idx));
  };

  const updateCriteriaDescription = (idx: number, description: string) => {
    const updated = [...criteria];
    updated[idx] = { ...updated[idx], description };
    onChange(updated);
  };

  const addItem = (criteriaIdx: number) => {
    const updated = [...criteria];
    const newItem: EvaluationCriteriaItem = {
      id: generateId(),
      content: '',
      questions: 0,
      weight: 0,
      totalPoints: 0,
    };
    updated[criteriaIdx] = {
      ...updated[criteriaIdx],
      items: [...updated[criteriaIdx].items, newItem],
    };
    onChange(updated);
    // Start editing the new item
    setEditingItem({ criteriaIdx, itemId: newItem.id });
    setEditingItemValues(newItem);
  };

  const removeItem = (criteriaIdx: number, itemId: string) => {
    const updated = [...criteria];
    updated[criteriaIdx] = {
      ...updated[criteriaIdx],
      items: updated[criteriaIdx].items.filter((item) => item.id !== itemId),
    };
    recalculateTotals(updated, criteriaIdx);
    onChange(updated);
  };

  const startEditingItem = (criteriaIdx: number, item: EvaluationCriteriaItem) => {
    setEditingItem({ criteriaIdx, itemId: item.id });
    setEditingItemValues({ ...item });
  };

  const cancelEditingItem = () => {
    setEditingItem(null);
    setEditingItemValues({});
  };

  const saveEditingItem = () => {
    if (!editingItem || !editingItemValues.content) return;

    const updated = [...criteria];
    const itemIdx = updated[editingItem.criteriaIdx].items.findIndex(
      (item) => item.id === editingItem.itemId
    );
    if (itemIdx !== -1) {
      const questions = editingItemValues.questions || 0;
      const weight = editingItemValues.weight || 0;
      updated[editingItem.criteriaIdx].items[itemIdx] = {
        id: editingItem.itemId,
        content: editingItemValues.content || '',
        questions,
        weight,
        totalPoints: questions * weight,
      };
      recalculateTotals(updated, editingItem.criteriaIdx);
    }
    onChange(updated);
    setEditingItem(null);
    setEditingItemValues({});
  };

  const recalculateTotals = (updated: EvaluationCriteria[], criteriaIdx: number) => {
    const items = updated[criteriaIdx].items;
    updated[criteriaIdx].totalQuestions = items.reduce((sum, item) => sum + item.questions, 0);
    updated[criteriaIdx].totalPoints = items.reduce((sum, item) => sum + item.totalPoints, 0);
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Critérios de Avaliação</Label>
      </div>

      <p className="text-sm text-muted-foreground">
        Defina a estrutura da prova objetiva: conteúdos, quantidade de questões, peso individual e
        pontuação total para cada nível de escolaridade.
      </p>

      {/* Existing Criteria */}
      {criteria.map((crit, critIdx) => {
        const isExpanded = expandedCriteria.has(critIdx);

        return (
          <div key={critIdx} className="border border-border rounded-lg overflow-hidden">
            {/* Header */}
            <div
              className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer"
              onClick={() => toggleExpanded(critIdx)}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="font-medium text-sm">{crit.level}</span>
                <span className="text-xs text-muted-foreground">
                  ({crit.items.length} conteúdos • {crit.totalQuestions} questões •{' '}
                  {crit.totalPoints.toFixed(1)} pts)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeCriteria(critIdx);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            {isExpanded && (
              <div className="p-3 space-y-3">
                {/* Description */}
                <div className="space-y-1">
                  <Label className="text-xs">Descrição (opcional)</Label>
                  <Textarea
                    value={crit.description || ''}
                    onChange={(e) => updateCriteriaDescription(critIdx, e.target.value)}
                    placeholder="Ex: Prova escrita com 40 questões, incluindo História e Geografia do Estado e Município"
                    className="resize-none h-16 text-sm"
                  />
                </div>

                {/* Items Table Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b border-border pb-2">
                  <div className="col-span-5">Conteúdo</div>
                  <div className="col-span-2 text-center">Questões</div>
                  <div className="col-span-2 text-center">Peso</div>
                  <div className="col-span-2 text-center">Total</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Items */}
                {crit.items.map((item) => {
                  const isEditing =
                    editingItem?.criteriaIdx === critIdx && editingItem?.itemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-2 items-center text-sm py-1"
                    >
                      {isEditing ? (
                        <>
                          <div className="col-span-5">
                            <Input
                              value={editingItemValues.content || ''}
                              onChange={(e) =>
                                setEditingItemValues({ ...editingItemValues, content: e.target.value })
                              }
                              placeholder="Ex: Língua Portuguesa"
                              className="h-8 text-sm"
                              autoFocus
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              value={editingItemValues.questions || ''}
                              onChange={(e) =>
                                setEditingItemValues({
                                  ...editingItemValues,
                                  questions: parseInt(e.target.value) || 0,
                                })
                              }
                              className="h-8 text-sm text-center"
                              min={0}
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              step="0.1"
                              value={editingItemValues.weight || ''}
                              onChange={(e) =>
                                setEditingItemValues({
                                  ...editingItemValues,
                                  weight: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="h-8 text-sm text-center"
                              min={0}
                            />
                          </div>
                          <div className="col-span-2 text-center text-muted-foreground">
                            {((editingItemValues.questions || 0) * (editingItemValues.weight || 0)).toFixed(
                              1
                            )}
                          </div>
                          <div className="col-span-1 flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-success"
                              onClick={saveEditingItem}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={cancelEditingItem}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="col-span-5 truncate">{item.content || '(vazio)'}</div>
                          <div className="col-span-2 text-center">{item.questions}</div>
                          <div className="col-span-2 text-center">{item.weight.toFixed(1)}</div>
                          <div className="col-span-2 text-center font-medium">
                            {item.totalPoints.toFixed(1)}
                          </div>
                          <div className="col-span-1 flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => startEditingItem(critIdx, item)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={() => removeItem(critIdx, item.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {/* Totals Row */}
                {crit.items.length > 0 && (
                  <div className="grid grid-cols-12 gap-2 items-center text-sm py-2 border-t border-border font-semibold">
                    <div className="col-span-5">TOTAL DA PROVA</div>
                    <div className="col-span-2 text-center">{crit.totalQuestions}</div>
                    <div className="col-span-2 text-center">-</div>
                    <div className="col-span-2 text-center">{crit.totalPoints.toFixed(1)}</div>
                    <div className="col-span-1"></div>
                  </div>
                )}

                {/* Add Item Button */}
                <div className="pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => addItem(critIdx)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar conteúdo
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add New Criteria */}
      <div className="flex gap-2">
        <Input
          value={newLevel}
          onChange={(e) => setNewLevel(e.target.value)}
          placeholder="Ex: Nível Médio, Nível Superior, Professor..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCriteria();
            }
          }}
        />
        <Button variant="outline" onClick={addCriteria} disabled={!newLevel.trim()}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar nível
        </Button>
      </div>
    </div>
  );
}

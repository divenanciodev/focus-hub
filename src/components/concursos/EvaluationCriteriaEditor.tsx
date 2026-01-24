import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { EvaluationCriteria, EvaluationCriteriaItem } from '@/types/contests';

interface EvaluationCriteriaEditorProps {
  criteria: EvaluationCriteria[];
  onChange: (criteria: EvaluationCriteria[]) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export function EvaluationCriteriaEditor({ criteria, onChange }: EvaluationCriteriaEditorProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingItemValues, setEditingItemValues] = useState<Partial<EvaluationCriteriaItem>>({});

  // Ensure we have a single criteria container
  const ensureCriteria = (): EvaluationCriteria => {
    if (criteria.length > 0) return criteria[0];
    return {
      level: 'Geral',
      description: '',
      items: [],
      totalQuestions: 0,
      totalPoints: 0,
    };
  };

  const currentCriteria = ensureCriteria();
  const items = currentCriteria.items;

  const updateCriteria = (updatedItems: EvaluationCriteriaItem[]) => {
    const totalQuestions = updatedItems.reduce((sum, item) => sum + item.questions, 0);
    const totalPoints = updatedItems.reduce((sum, item) => sum + item.totalPoints, 0);
    
    const updated: EvaluationCriteria = {
      ...currentCriteria,
      items: updatedItems,
      totalQuestions,
      totalPoints,
    };
    onChange([updated]);
  };

  const addItem = () => {
    const newItem: EvaluationCriteriaItem = {
      id: generateId(),
      content: '',
      questions: 0,
      weight: 0,
      totalPoints: 0,
    };
    updateCriteria([...items, newItem]);
    setEditingItem(newItem.id);
    setEditingItemValues(newItem);
  };

  const removeItem = (itemId: string) => {
    updateCriteria(items.filter((item) => item.id !== itemId));
  };

  const startEditingItem = (item: EvaluationCriteriaItem) => {
    setEditingItem(item.id);
    setEditingItemValues({ ...item });
  };

  const cancelEditingItem = () => {
    // Remove if empty
    if (editingItem) {
      const item = items.find(i => i.id === editingItem);
      if (item && !item.content) {
        updateCriteria(items.filter(i => i.id !== editingItem));
      }
    }
    setEditingItem(null);
    setEditingItemValues({});
  };

  const saveEditingItem = () => {
    if (!editingItem || !editingItemValues.content?.trim()) {
      cancelEditingItem();
      return;
    }

    const questions = editingItemValues.questions || 0;
    const weight = editingItemValues.weight || 0;
    
    const updatedItems = items.map((item) =>
      item.id === editingItem
        ? {
            id: editingItem,
            content: editingItemValues.content?.trim() || '',
            questions,
            weight,
            totalPoints: questions * weight,
          }
        : item
    );
    
    updateCriteria(updatedItems);
    setEditingItem(null);
    setEditingItemValues({});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Critérios de Avaliação</Label>
      </div>

      <p className="text-sm text-muted-foreground">
        Defina a estrutura da prova objetiva: conteúdos, quantidade de questões, peso individual e
        pontuação total.
      </p>

      {/* Table Header */}
      {items.length > 0 && (
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b border-border pb-2 px-1">
          <div className="col-span-5">Conteúdo</div>
          <div className="col-span-2 text-center">Questões</div>
          <div className="col-span-2 text-center">Peso</div>
          <div className="col-span-2 text-center">Total</div>
          <div className="col-span-1"></div>
        </div>
      )}

      {/* Items */}
      <div className="space-y-1">
        {items.map((item) => {
          const isEditing = editingItem === item.id;

          return (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-2 items-center text-sm py-2 px-1 rounded-md hover:bg-muted/30"
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveEditingItem();
                        } else if (e.key === 'Escape') {
                          cancelEditingItem();
                        }
                      }}
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveEditingItem();
                        } else if (e.key === 'Escape') {
                          cancelEditingItem();
                        }
                      }}
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveEditingItem();
                        } else if (e.key === 'Escape') {
                          cancelEditingItem();
                        }
                      }}
                    />
                  </div>
                  <div className="col-span-2 text-center text-muted-foreground">
                    {((editingItemValues.questions || 0) * (editingItemValues.weight || 0)).toFixed(1)}
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
                      onClick={() => startEditingItem(item)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Totals Row */}
      {items.length > 0 && (
        <div className="grid grid-cols-12 gap-2 items-center text-sm py-2 px-1 border-t border-border font-semibold">
          <div className="col-span-5">TOTAL DA PROVA</div>
          <div className="col-span-2 text-center">{currentCriteria.totalQuestions}</div>
          <div className="col-span-2 text-center">-</div>
          <div className="col-span-2 text-center">{currentCriteria.totalPoints.toFixed(1)}</div>
          <div className="col-span-1"></div>
        </div>
      )}

      {/* Add Item Button */}
      <Button variant="outline" size="sm" className="w-full" onClick={addItem}>
        <Plus className="w-4 h-4 mr-2" />
        Adicionar conteúdo
      </Button>
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContestMateria, ContestTopic } from '@/types/contests';
import { Plus, Trash2, ChevronDown, ChevronUp, X, Pencil, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContestMateriasEditorProps {
  materias: ContestMateria[];
  onChange: (materias: ContestMateria[]) => void;
}

const DEFAULT_MATERIAS = [
  'Conhecimentos Específicos',
  'Conhecimentos Gerais',
  'Língua Portuguesa',
  'Raciocínio Lógico',
  'Noções de Informática',
  'Direito Constitucional',
  'Direito Administrativo',
  'Cultura Geral',
];

export function ContestMateriasEditor({ materias, onChange }: ContestMateriasEditorProps) {
  const [expandedMaterias, setExpandedMaterias] = useState<Set<number>>(new Set());
  const [newMateriaName, setNewMateriaName] = useState('');
  const [newTopicNames, setNewTopicNames] = useState<Record<number, string>>({});
  const [newSubtopicNames, setNewSubtopicNames] = useState<Record<string, string>>({});
  const [editingSubtopic, setEditingSubtopic] = useState<string | null>(null);
  const [editingSubtopicValue, setEditingSubtopicValue] = useState('');

  const toggleExpanded = (index: number) => {
    setExpandedMaterias((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const addMateria = (name?: string) => {
    const materiaName = name || newMateriaName.trim();
    if (!materiaName) return;
    
    // Check if already exists
    if (materias.some(m => m.name.toLowerCase() === materiaName.toLowerCase())) {
      return;
    }
    
    onChange([...materias, { name: materiaName, topics: [] }]);
    setNewMateriaName('');
    setExpandedMaterias((prev) => new Set([...prev, materias.length]));
  };

  const removeMateria = (index: number) => {
    const updated = materias.filter((_, i) => i !== index);
    onChange(updated);
  };

  const addTopic = (materiaIndex: number) => {
    const topicName = newTopicNames[materiaIndex]?.trim();
    if (!topicName) return;
    
    const updated = [...materias];
    updated[materiaIndex].topics.push({ name: topicName, subtopics: [] });
    onChange(updated);
    setNewTopicNames((prev) => ({ ...prev, [materiaIndex]: '' }));
  };

  const removeTopic = (materiaIndex: number, topicIndex: number) => {
    const updated = [...materias];
    updated[materiaIndex].topics = updated[materiaIndex].topics.filter((_, i) => i !== topicIndex);
    onChange(updated);
  };

  const addSubtopic = (materiaIndex: number, topicIndex: number) => {
    const key = `${materiaIndex}-${topicIndex}`;
    const rawValue = newSubtopicNames[key]?.trim();
    if (!rawValue) return;
    
    // Suporta múltiplos subtópicos separados por quebra de linha
    const subtopics = rawValue
      .split(/[\n\r]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    if (subtopics.length === 0) return;
    
    const updated = [...materias];
    updated[materiaIndex].topics[topicIndex].subtopics.push(...subtopics);
    onChange(updated);
    setNewSubtopicNames((prev) => ({ ...prev, [key]: '' }));
  };

  const removeSubtopic = (materiaIndex: number, topicIndex: number, subtopicIndex: number) => {
    const updated = [...materias];
    updated[materiaIndex].topics[topicIndex].subtopics = updated[materiaIndex].topics[topicIndex].subtopics.filter((_, i) => i !== subtopicIndex);
    onChange(updated);
  };

  const updateSubtopic = (materiaIndex: number, topicIndex: number, subtopicIndex: number, newValue: string) => {
    const trimmed = newValue.trim();
    if (!trimmed) return;
    
    const updated = [...materias];
    updated[materiaIndex].topics[topicIndex].subtopics[subtopicIndex] = trimmed;
    onChange(updated);
    setEditingSubtopic(null);
    setEditingSubtopicValue('');
  };

  const startEditingSubtopic = (materiaIndex: number, topicIndex: number, subtopicIndex: number, currentValue: string) => {
    const key = `${materiaIndex}-${topicIndex}-${subtopicIndex}`;
    setEditingSubtopic(key);
    setEditingSubtopicValue(currentValue);
  };

  const cancelEditingSubtopic = () => {
    setEditingSubtopic(null);
    setEditingSubtopicValue('');
  };

  const availableMaterias = DEFAULT_MATERIAS.filter(
    (m) => !materias.some((existing) => existing.name.toLowerCase() === m.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Label>Matérias e Conteúdo Programático</Label>
      
      {/* Quick add buttons */}
      {availableMaterias.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableMaterias.slice(0, 6).map((name) => (
            <Button
              key={name}
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => addMateria(name)}
            >
              <Plus className="w-3 h-3 mr-1" />
              {name}
            </Button>
          ))}
        </div>
      )}

      {/* Add custom materia */}
      <div className="flex gap-2">
        <Input
          value={newMateriaName}
          onChange={(e) => setNewMateriaName(e.target.value)}
          placeholder="Adicionar nova matéria..."
          className="text-sm"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMateria())}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => addMateria()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Materias list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto overflow-x-visible pr-1">
        {materias.map((materia, materiaIndex) => (
          <div key={materiaIndex} className="border border-border rounded-lg overflow-hidden">
            {/* Materia header */}
            <div
              className="flex items-center justify-between p-2 bg-muted/50 cursor-pointer"
              onClick={() => toggleExpanded(materiaIndex)}
            >
              <div className="flex items-center gap-2">
                {expandedMaterias.has(materiaIndex) ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="font-medium text-sm">{materia.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({materia.topics.length} tópicos)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  removeMateria(materiaIndex);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            {/* Topics */}
            {expandedMaterias.has(materiaIndex) && (
              <div className="p-2 space-y-2 bg-background">
                {/* Add topic */}
                <div className="flex gap-2">
                  <Input
                    value={newTopicNames[materiaIndex] || ''}
                    onChange={(e) => setNewTopicNames((prev) => ({ ...prev, [materiaIndex]: e.target.value }))}
                    placeholder="Adicionar tópico..."
                    className="text-xs h-8"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic(materiaIndex))}
                  />
                  <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => addTopic(materiaIndex)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                {/* Topics list */}
                {materia.topics.map((topic, topicIndex) => (
                  <div key={topicIndex} className="ml-4 border-l-2 border-border pl-3 py-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{topic.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeTopic(materiaIndex, topicIndex)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Subtopics */}
                    <div className="space-y-1 ml-2">
                      {topic.subtopics.map((subtopic, subtopicIndex) => {
                        const editKey = `${materiaIndex}-${topicIndex}-${subtopicIndex}`;
                        const isEditing = editingSubtopic === editKey;
                        
                        return (
                          <div key={subtopicIndex} className="flex items-center justify-between text-xs text-muted-foreground py-0.5 group">
                            {isEditing ? (
                              <div className="flex items-center gap-1 flex-1 mr-1">
                                <span className="text-muted-foreground">•</span>
                                <input
                                  type="text"
                                  value={editingSubtopicValue}
                                  onChange={(e) => setEditingSubtopicValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      updateSubtopic(materiaIndex, topicIndex, subtopicIndex, editingSubtopicValue);
                                    } else if (e.key === 'Escape') {
                                      cancelEditingSubtopic();
                                    }
                                  }}
                                  className="flex-1 text-xs px-1 py-0.5 border border-input rounded bg-background"
                                  autoFocus
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 text-green-600 hover:text-green-700"
                                  onClick={() => updateSubtopic(materiaIndex, topicIndex, subtopicIndex, editingSubtopicValue)}
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={cancelEditingSubtopic}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span 
                                  className="cursor-pointer hover:text-foreground transition-colors"
                                  onDoubleClick={() => startEditingSubtopic(materiaIndex, topicIndex, subtopicIndex, subtopic)}
                                >
                                  • {subtopic}
                                </span>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                                    onClick={() => startEditingSubtopic(materiaIndex, topicIndex, subtopicIndex, subtopic)}
                                  >
                                    <Pencil className="w-2.5 h-2.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeSubtopic(materiaIndex, topicIndex, subtopicIndex)}
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}

                      {/* Add subtopic - suporta colar múltiplos */}
                      <div className="flex gap-1 mt-1">
                        <textarea
                          value={newSubtopicNames[`${materiaIndex}-${topicIndex}`] || ''}
                          onChange={(e) =>
                            setNewSubtopicNames((prev) => ({
                              ...prev,
                              [`${materiaIndex}-${topicIndex}`]: e.target.value,
                            }))
                          }
                          placeholder="Cole vários subtópicos (um por linha) ou digite..."
                          className="flex-1 text-xs min-h-[24px] max-h-[80px] py-1 px-2 rounded-md border border-input bg-background resize-none"
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              addSubtopic(materiaIndex, topicIndex);
                            }
                          }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.min(target.scrollHeight, 80) + 'px';
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 self-end"
                          onClick={() => addSubtopic(materiaIndex, topicIndex)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  Library,
  Trash2,
  Edit2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Language } from '@/types/languages';

interface Section {
  id: string;
  name: string;
  levelId: string;
  sortOrder: number;
}

interface Structure {
  id: string;
  name: string;
  pattern: string | null;
  patternTranslation: string | null;
  sectionId: string;
  sortOrder: number;
}

interface VocabularyWord {
  id: string;
  structureId: string;
  wordType: string;
  word: string;
  translation: string | null;
  sortOrder: number;
}

interface LanguageHomeViewProps {
  language: Language;
  sections: Section[];
  structures: Record<string, Structure[]>;
  vocabulary: Record<string, VocabularyWord[]>;
  onRefresh: () => void;
  onStartPractice: (section: string | null) => void;
}

// Word types with colors
const WORD_TYPES = [
  { value: 'verb', label: 'Verbos', shortLabel: 'verbos', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { value: 'noun', label: 'Substantivos', shortLabel: 'subst', color: 'bg-green-100 border-green-300 text-green-800' },
  { value: 'adjective', label: 'Adjetivos', shortLabel: 'adj', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { value: 'adverb', label: 'Advérbios', shortLabel: 'adv', color: 'bg-purple-100 border-purple-300 text-purple-800' },
  { value: 'pronoun', label: 'Pronomes', shortLabel: 'pron', color: 'bg-pink-100 border-pink-300 text-pink-800' },
  { value: 'preposition', label: 'Preposições', shortLabel: 'prep', color: 'bg-orange-100 border-orange-300 text-orange-800' },
  { value: 'conjunction', label: 'Conjunções', shortLabel: 'conj', color: 'bg-teal-100 border-teal-300 text-teal-800' },
  { value: 'interjection', label: 'Interjeições', shortLabel: 'interj', color: 'bg-red-100 border-red-300 text-red-800' },
  { value: 'article', label: 'Artigos', shortLabel: 'art', color: 'bg-indigo-100 border-indigo-300 text-indigo-800' },
  { value: 'numeral', label: 'Numerais', shortLabel: 'num', color: 'bg-cyan-100 border-cyan-300 text-cyan-800' },
  { value: 'mobilia', label: 'Mobília', shortLabel: 'mobilia', color: 'bg-amber-100 border-amber-300 text-amber-800' },
];

export function LanguageHomeView({
  language,
  sections,
  structures,
  vocabulary,
  onRefresh,
  onStartPractice,
}: LanguageHomeViewProps) {
  const [activeTab, setActiveTab] = useState('create');
  const [vocabModalOpen, setVocabModalOpen] = useState(false);
  const [newVocab, setNewVocab] = useState({ word: '', translation: '', type: 'verb' });
  const [editVocabId, setEditVocabId] = useState<string | null>(null);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);

  // Get all vocabulary grouped by type (flattened across all structures)
  const getAllVocabularyByType = () => {
    const grouped: Record<string, VocabularyWord[]> = {};
    
    Object.values(vocabulary).forEach(vocabList => {
      vocabList.forEach(v => {
        if (!grouped[v.wordType]) {
          grouped[v.wordType] = [];
        }
        grouped[v.wordType].push(v);
      });
    });
    
    return grouped;
  };

  const getWordTypeInfo = (type: string) => {
    return WORD_TYPES.find(t => t.value === type) || { 
      value: type, 
      label: type, 
      shortLabel: type, 
      color: 'bg-gray-100 border-gray-300 text-gray-800' 
    };
  };

  const handleAddVocabulary = async () => {
    if (!newVocab.word.trim()) {
      toast.error('Digite uma palavra');
      return;
    }

    // Get first structure ID or create one if needed
    let structureId = selectedStructureId;
    
    if (!structureId) {
      // Use the first available structure
      for (const sectionId of Object.keys(structures)) {
        if (structures[sectionId]?.length > 0) {
          structureId = structures[sectionId][0].id;
          break;
        }
      }
    }

    if (!structureId) {
      toast.error('Crie uma seção e estrutura primeiro');
      return;
    }

    const { error } = await supabase.from('language_vocabulary').insert({
      structure_id: structureId,
      word_type: newVocab.type,
      word: newVocab.word.trim(),
      translation: newVocab.translation.trim() || null,
      sort_order: 0,
    });

    if (error) {
      toast.error('Erro ao adicionar palavra');
    } else {
      toast.success('Palavra adicionada!');
      setNewVocab({ word: '', translation: '', type: 'verb' });
      setVocabModalOpen(false);
      onRefresh();
    }
  };

  const handleDeleteVocabulary = async (id: string) => {
    await supabase.from('language_vocabulary').delete().eq('id', id);
    toast.success('Palavra removida!');
    onRefresh();
  };

  const vocabByType = getAllVocabularyByType();
  const vocabTypes = Object.keys(vocabByType);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant={activeTab === 'create' ? 'default' : 'outline'}
            onClick={() => setActiveTab('create')}
            className="rounded-full px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar
          </Button>
          <Button 
            variant={activeTab === 'library' ? 'default' : 'outline'}
            onClick={() => setActiveTab('library')}
            className="rounded-full px-6"
          >
            <Library className="w-4 h-4 mr-2" />
            Biblioteca
          </Button>
        </div>

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Vocabulario</h2>
              <Button size="sm" onClick={() => setVocabModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {vocabTypes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4">Nenhum vocabulário adicionado</p>
                <Button variant="outline" onClick={() => setVocabModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar primeiro
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {vocabTypes.map(type => {
                  const typeInfo = getWordTypeInfo(type);
                  const words = vocabByType[type] || [];
                  
                  return (
                    <Card 
                      key={type} 
                      className={cn(
                        'border-2 cursor-pointer hover:shadow-md transition-shadow',
                        typeInfo.color.replace('bg-', 'border-').split(' ')[0]
                      )}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-3">{typeInfo.shortLabel}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => {
                                setNewVocab({ ...newVocab, type });
                                setVocabModalOpen(true);
                              }}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-destructive"
                              onClick={() => {
                                // Delete all words of this type
                                if (confirm(`Excluir todas as ${words.length} palavras de "${typeInfo.label}"?`)) {
                                  words.forEach(w => handleDeleteVocabulary(w.id));
                                }
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {words.length}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Biblioteca de Vocabulário</h2>

            {vocabTypes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum vocabulário na biblioteca</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vocabTypes.map(type => {
                  const typeInfo = getWordTypeInfo(type);
                  const words = vocabByType[type] || [];
                  
                  return (
                    <Card key={type}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{typeInfo.label}</h3>
                          <Badge variant="outline">{words.length} palavras</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {words.slice(0, 10).map(word => (
                            <Badge 
                              key={word.id} 
                              variant="secondary"
                              className="px-3 py-1"
                            >
                              {word.word}
                              {word.translation && (
                                <span className="text-muted-foreground ml-1">
                                  ({word.translation})
                                </span>
                              )}
                            </Badge>
                          ))}
                          {words.length > 10 && (
                            <Badge variant="outline">+{words.length - 10}</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Vocabulary Modal */}
      <Dialog open={vocabModalOpen} onOpenChange={setVocabModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Vocabulário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Tipo</Label>
              <Select 
                value={newVocab.type} 
                onValueChange={(v) => setNewVocab({ ...newVocab, type: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORD_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Palavra</Label>
              <Input
                value={newVocab.word}
                onChange={(e) => setNewVocab({ ...newVocab, word: e.target.value })}
                placeholder="Ex: eat"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Tradução</Label>
              <Input
                value={newVocab.translation}
                onChange={(e) => setNewVocab({ ...newVocab, translation: e.target.value })}
                placeholder="Ex: comer"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleAddVocabulary} 
              className="w-full"
              disabled={!newVocab.word.trim()}
            >
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

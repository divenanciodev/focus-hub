import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Layers, 
  FileQuestion, 
  Brain, 
  FileText, 
  PenLine, 
  Building2, 
  Mic,
  FolderOpen,
  ChevronRight,
  ArrowLeft,
  Play,
  List,
  LayoutGrid
} from 'lucide-react';
import { FlashcardGroup } from '@/types/flashcards';
import { Simulado, MindMap } from '@/types/training';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ContentLibraryProps {
  flashcardGroups: FlashcardGroup[];
  simulados: Simulado[];
  mindMaps: MindMap[];
  onStudyFlashcard: (group: FlashcardGroup) => void;
  onEditFlashcard: (group: FlashcardGroup) => void;
  onDeleteFlashcard: (groupId: string) => void;
  onStartSimulado: (simulado: Simulado) => void;
  onDeleteSimulado: (simuladoId: string) => void;
  onViewMindMap: (mindMap: MindMap) => void;
}

type MethodType = 'flashcards' | 'simulado' | 'mindmap' | 'summary' | 'handwriting' | 'memory-palace' | 'audio-explanation';

interface MethodFolder {
  id: MethodType;
  name: string;
  icon: typeof Layers;
  count: number;
  available: boolean;
}

export function ContentLibrary({
  flashcardGroups,
  simulados,
  mindMaps,
  onStudyFlashcard,
  onEditFlashcard,
  onDeleteFlashcard,
  onStartSimulado,
  onDeleteSimulado,
  onViewMindMap,
}: ContentLibraryProps) {
  const [selectedFolder, setSelectedFolder] = useState<MethodType | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const folders: MethodFolder[] = [
    { id: 'flashcards', name: 'Flashcards', icon: Layers, count: flashcardGroups.length, available: true },
    { id: 'simulado', name: 'Simulados', icon: FileQuestion, count: simulados.length, available: true },
    { id: 'mindmap', name: 'Mapas Mentais', icon: Brain, count: mindMaps.length, available: true },
    { id: 'summary', name: 'Resumos Guiados', icon: FileText, count: 0, available: false },
    { id: 'handwriting', name: 'Escrita Manual', icon: PenLine, count: 0, available: false },
    { id: 'memory-palace', name: 'Palácio da Memória', icon: Building2, count: 0, available: false },
    { id: 'audio-explanation', name: 'Explicação em Áudio', icon: Mic, count: 0, available: false },
  ];

  const totalContent = flashcardGroups.length + simulados.length + mindMaps.length;

  // Render folder contents
  const renderFolderContent = () => {
    if (selectedFolder === 'flashcards') {
      if (flashcardGroups.length === 0) {
        return (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum flashcard criado ainda</p>
            <p className="text-sm">Crie flashcards na aba "Criar Conteúdo"</p>
          </div>
        );
      }

      if (viewMode === 'list') {
        return (
          <div className="space-y-2">
            {flashcardGroups.map((group) => (
              <div
                key={group.id}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-foreground/20 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{group.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {group.cards.length} cartão{group.cards.length !== 1 ? 's' : ''} • {format(group.createdAt, "dd/MM/yy", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => onStudyFlashcard(group)}>
                    <Play className="w-4 h-4 mr-1" />
                    Praticar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {flashcardGroups.map((group) => (
            <div
              key={group.id}
              className="group bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
              onClick={() => onStudyFlashcard(group)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Layers className="w-7 h-7 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-lg break-words">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {group.cards.length} cartão{group.cards.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-4">
                Criado: {format(group.createdAt, "dd 'de' MMM", { locale: ptBR })}
                {group.lastStudied && ` • Estudado: ${format(group.lastStudied, "dd/MM", { locale: ptBR })}`}
              </div>
              <div className="flex-1" />
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button onClick={() => onStudyFlashcard(group)} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Praticar
                </Button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (selectedFolder === 'simulado') {
      if (simulados.length === 0) {
        return (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
            <FileQuestion className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum simulado criado ainda</p>
            <p className="text-sm">Crie simulados na aba "Criar Conteúdo"</p>
          </div>
        );
      }

      if (viewMode === 'list') {
        return (
          <div className="space-y-2">
            {simulados.map((simulado) => (
              <div
                key={simulado.id}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-foreground/20 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <FileQuestion className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{simulado.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {simulado.questions.length} questões • {simulado.timeMinutes} min
                    {simulado.status === 'completed' && simulado.score !== undefined && ` • Nota: ${simulado.score}%`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => onStartSimulado(simulado)}>
                    <Play className="w-4 h-4 mr-1" />
                    {simulado.status === 'completed' ? 'Refazer' : 'Iniciar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {simulados.map((simulado) => (
            <div
              key={simulado.id}
              className="group bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
              onClick={() => onStartSimulado(simulado)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <FileQuestion className="w-7 h-7 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-lg break-words">{simulado.name}</h3>
                  <p className="text-sm text-muted-foreground">{simulado.discipline}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{simulado.questions.length} questões</Badge>
                <Badge variant="secondary">{simulado.timeMinutes} min</Badge>
                <Badge variant="secondary">
                  {simulado.difficulty === 'easy' ? 'Fácil' : simulado.difficulty === 'hard' ? 'Difícil' : 'Médio'}
                </Badge>
              </div>
              {simulado.status === 'completed' && simulado.score !== undefined && (
                <p className="text-sm text-primary mb-2">Última nota: {simulado.score}%</p>
              )}
              <div className="flex-1" />
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button onClick={() => onStartSimulado(simulado)} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  {simulado.status === 'completed' ? 'Refazer' : 'Iniciar'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (selectedFolder === 'mindmap') {
      if (mindMaps.length === 0) {
        return (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum mapa mental criado ainda</p>
            <p className="text-sm">Crie mapas mentais na aba "Criar Conteúdo"</p>
          </div>
        );
      }

      if (viewMode === 'list') {
        return (
          <div className="space-y-2">
            {mindMaps.map((mindMap) => (
              <div
                key={mindMap.id}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-foreground/20 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{mindMap.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {mindMap.nodes.length} nós • {mindMap.discipline || 'Geral'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => onViewMindMap(mindMap)}>
                    <Play className="w-4 h-4 mr-1" />
                    Visualizar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mindMaps.map((mindMap) => (
            <div
              key={mindMap.id}
              className="group bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
              onClick={() => onViewMindMap(mindMap)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Brain className="w-7 h-7 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-lg break-words">{mindMap.name}</h3>
                  <p className="text-sm text-muted-foreground">{mindMap.discipline || 'Geral'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{mindMap.nodes.length} nós</Badge>
              </div>
              <div className="text-xs text-muted-foreground mb-4">
                Criado: {format(new Date(mindMap.createdAt), "dd 'de' MMM", { locale: ptBR })}
              </div>
              <div className="flex-1" />
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button onClick={() => onViewMindMap(mindMap)} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Visualizar
                </Button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // For unavailable methods
    const folder = folders.find(f => f.id === selectedFolder);
    if (folder && !folder.available) {
      return (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
          <folder.icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum conteúdo criado ainda</p>
          <p className="text-sm">Esta funcionalidade estará disponível em breve</p>
        </div>
      );
    }

    return null;
  };

  // Main folder view
  if (!selectedFolder) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-foreground mb-1">Minha Biblioteca</h3>
          <p className="text-sm text-muted-foreground">
            {totalContent} conteúdo{totalContent !== 1 ? 's' : ''} criado{totalContent !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => {
            const Icon = folder.icon;
            return (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={cn(
                  "relative bg-card border border-border rounded-2xl p-6 text-left hover:border-foreground/20 hover:shadow-lg transition-all duration-200 group",
                  !folder.available && "opacity-60"
                )}
              >
                {!folder.available && (
                  <span className="absolute top-3 right-3 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                    Em breve
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FolderOpen className="w-7 h-7 text-foreground" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-semibold text-foreground">{folder.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {folder.count} item{folder.count !== 1 ? 's' : ''}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Selected folder view
  const currentFolder = folders.find(f => f.id === selectedFolder);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedFolder(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            {currentFolder && <currentFolder.icon className="w-5 h-5 text-foreground" />}
            <h3 className="font-semibold text-foreground text-lg">{currentFolder?.name}</h3>
            <Badge variant="secondary">{currentFolder?.count} item{currentFolder?.count !== 1 ? 's' : ''}</Badge>
          </div>
        </div>
        
        {currentFolder && currentFolder.count > 0 && (
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {renderFolderContent()}
    </div>
  );
}

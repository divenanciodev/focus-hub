import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Layers, 
  FileQuestion, 
  ListTodo, 
  GitBranch, 
  FileText, 
  PenTool, 
  Building2, 
  Mic 
} from 'lucide-react';
import { TrainingType } from '@/types/training';
import { cn } from '@/lib/utils';

interface TrainingTypeOption {
  type: TrainingType;
  label: string;
  description: string;
  icon: React.ElementType;
}

const trainingTypes: TrainingTypeOption[] = [
  {
    type: 'flashcards',
    label: 'Flashcards',
    description: 'Cartões de memorização ativa',
    icon: Layers,
  },
  {
    type: 'simulado',
    label: 'Simulado',
    description: 'Provas com questões e tempo',
    icon: FileQuestion,
  },
  {
    type: 'activity',
    label: 'Atividade Personalizada',
    description: 'Exercícios e estudos livres',
    icon: ListTodo,
  },
  {
    type: 'mindmap',
    label: 'Mapa Mental',
    description: 'Organize ideias visualmente',
    icon: GitBranch,
  },
  {
    type: 'summary',
    label: 'Resumo Guiado',
    description: 'Escrita controlada com limites',
    icon: FileText,
  },
  {
    type: 'handwriting',
    label: 'Escrita Manual',
    description: 'Envie fotos de resumos escritos',
    icon: PenTool,
  },
  {
    type: 'memory-palace',
    label: 'Palácio da Memória',
    description: 'Associações visuais e espaciais',
    icon: Building2,
  },
  {
    type: 'audio-explanation',
    label: 'Explicação em Áudio',
    description: 'Aprenda ensinando em voz alta',
    icon: Mic,
  },
];

interface TrainingTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: TrainingType) => void;
}

export function TrainingTypeSelector({
  open,
  onOpenChange,
  onSelectType,
}: TrainingTypeSelectorProps) {
  const handleSelect = (type: TrainingType) => {
    onSelectType(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Escolha o tipo de treino</DialogTitle>
          <DialogDescription>
            Selecione uma técnica de estudo para começar
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
          {trainingTypes.map((option) => (
            <button
              key={option.type}
              onClick={() => handleSelect(option.type)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border border-border",
                "hover:border-foreground/30 hover:bg-secondary/50 transition-all duration-200",
                "text-center group"
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
                <option.icon className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{option.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {option.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

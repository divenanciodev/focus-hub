import { FlashcardCardType, CARD_TYPE_CONFIG } from '@/types/flashcards';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CardTypeSelectorProps {
  selected: FlashcardCardType;
  onChange: (type: FlashcardCardType) => void;
}

export function CardTypeSelector({ selected, onChange }: CardTypeSelectorProps) {
  const types = Object.entries(CARD_TYPE_CONFIG) as [FlashcardCardType, typeof CARD_TYPE_CONFIG[FlashcardCardType]][];

  return (
    <div className="grid grid-cols-2 gap-3">
      {types.map(([type, config]) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={cn(
            "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
            "hover:border-foreground/30 hover:shadow-sm",
            selected === type 
              ? "border-foreground bg-secondary/50" 
              : "border-border bg-card"
          )}
        >
          {selected === type && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
              <Check className="w-3 h-3 text-background" />
            </div>
          )}
          <span className="text-2xl mb-2 block">{config.icon}</span>
          <h4 className="font-medium text-foreground text-sm">{config.label}</h4>
          <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
        </button>
      ))}
    </div>
  );
}

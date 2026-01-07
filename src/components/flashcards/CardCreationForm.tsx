import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FlashcardCard, FlashcardCardType } from '@/types/flashcards';
import { CardTypeSelector } from './CardTypeSelector';
import { FlipCard } from './FlipCard';
import { Plus, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CardCreationFormProps {
  onAddCard: (card: FlashcardCard) => void;
  editingCard?: FlashcardCard;
  onCancelEdit?: () => void;
}

export function CardCreationForm({ onAddCard, editingCard, onCancelEdit }: CardCreationFormProps) {
  const [cardType, setCardType] = useState<FlashcardCardType>(editingCard?.type || 'flip');
  const [cardName, setCardName] = useState(editingCard?.name || '');
  const [question, setQuestion] = useState(editingCard?.question || '');
  const [answer, setAnswer] = useState(editingCard?.answer || '');
  const [imageUrl, setImageUrl] = useState(editingCard?.imageUrl || '');
  const [options, setOptions] = useState<{ id: string; text: string; isCorrect: boolean }[]>(
    editingCard?.options || [
      { id: '1', text: '', isCorrect: false },
      { id: '2', text: '', isCorrect: false },
      { id: '3', text: '', isCorrect: false },
      { id: '4', text: '', isCorrect: false },
    ]
  );
  const [correctOption, setCorrectOption] = useState(
    editingCard?.options?.find(o => o.isCorrect)?.id || '1'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      toast.success('Imagem carregada!');
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateOption = (id: string, text: string) => {
    setOptions(opts => opts.map(o => o.id === id ? { ...o, text } : o));
  };

  const resetForm = () => {
    setCardName('');
    setQuestion('');
    setAnswer('');
    setImageUrl('');
    setOptions([
      { id: '1', text: '', isCorrect: false },
      { id: '2', text: '', isCorrect: false },
      { id: '3', text: '', isCorrect: false },
      { id: '4', text: '', isCorrect: false },
    ]);
    setCorrectOption('1');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardName.trim()) {
      toast.error('Digite um nome para o cartão');
      return;
    }

    // Validate based on type
    if (cardType === 'flip' && (!question.trim() || !answer.trim())) {
      toast.error('Preencha a pergunta e a resposta');
      return;
    }

    if (cardType === 'image-flip' && (!question.trim() || !imageUrl || !answer.trim())) {
      toast.error('Preencha a pergunta, adicione uma imagem e escreva a resposta');
      return;
    }

    if (cardType === 'image-answer' && (!imageUrl || !answer.trim())) {
      toast.error('Adicione uma imagem e escreva a resposta');
      return;
    }

    if (cardType === 'multiple-choice') {
      const filledOptions = options.filter(o => o.text.trim());
      if (filledOptions.length < 2) {
        toast.error('Adicione pelo menos 2 opções');
        return;
      }
      if (!question.trim()) {
        toast.error('Escreva a pergunta');
        return;
      }
    }

    const finalOptions = cardType === 'multiple-choice' 
      ? options.filter(o => o.text.trim()).map(o => ({
          ...o,
          isCorrect: o.id === correctOption,
        }))
      : undefined;

    const card: FlashcardCard = {
      id: editingCard?.id || Date.now().toString(),
      name: cardName.trim(),
      type: cardType,
      question: question.trim() || undefined,
      answer: answer.trim() || undefined,
      imageUrl: imageUrl || undefined,
      options: finalOptions,
      createdAt: editingCard?.createdAt || new Date(),
    };

    onAddCard(card);
    resetForm();
    
    if (editingCard) {
      toast.success('Cartão atualizado!');
    } else {
      toast.success('Cartão adicionado!');
    }
  };

  // Build preview card
  const previewCard: Partial<FlashcardCard> = {
    type: cardType,
    question: question || 'Sua pergunta aqui...',
    answer: answer || 'Sua resposta aqui...',
    imageUrl,
    options: cardType === 'multiple-choice' ? options.filter(o => o.text.trim()).map(o => ({
      ...o,
      isCorrect: o.id === correctOption,
    })) : undefined,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Side */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Name */}
        <div className="space-y-2">
          <Label htmlFor="card-name" className="text-base font-medium">
            Nome do Cartão
          </Label>
          <Input
            id="card-name"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Ex: Lei de Ohm, Artigo 5º, Simple Past"
            className="h-11"
          />
        </div>

        {/* Card Type Selector */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Tipo do Cartão</Label>
          <CardTypeSelector selected={cardType} onChange={setCardType} />
        </div>

        {/* Dynamic Content Fields */}
        <div className="space-y-4 pt-4 border-t border-border">
          {/* Question field (for flip, image-flip, multiple-choice) */}
          {(cardType === 'flip' || cardType === 'image-flip' || cardType === 'multiple-choice') && (
            <div className="space-y-2">
              <Label htmlFor="question" className="font-medium">
                Pergunta
              </Label>
              <Textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Digite a pergunta..."
                className="min-h-[80px] resize-none"
              />
            </div>
          )}

          {/* Image upload (for image-flip, image-answer) */}
          {(cardType === 'image-flip' || cardType === 'image-answer') && (
            <div className="space-y-2">
              <Label className="font-medium">Imagem</Label>
              
              {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-background/90 rounded-full flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-foreground/30 transition-colors"
                >
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Clique para fazer upload</span>
                </button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Multiple choice options */}
          {cardType === 'multiple-choice' && (
            <div className="space-y-3">
              <Label className="font-medium">Opções de Resposta</Label>
              <RadioGroup value={correctOption} onValueChange={setCorrectOption}>
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-3">
                    <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(option.id, e.target.value)}
                      placeholder={`Opção ${index + 1}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Selecione o círculo ao lado da opção correta
              </p>
            </div>
          )}

          {/* Answer field (for flip, image-flip, image-answer) */}
          {(cardType === 'flip' || cardType === 'image-flip' || cardType === 'image-answer') && (
            <div className="space-y-2">
              <Label htmlFor="answer" className="font-medium">
                Resposta
              </Label>
              <Textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Digite a resposta..."
                className="min-h-[80px] resize-none"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          {editingCard && onCancelEdit && (
            <Button type="button" variant="outline" onClick={onCancelEdit} className="flex-1">
              Cancelar
            </Button>
          )}
          <Button type="submit" className={cn("flex-1", !editingCard && "w-full")}>
            <Plus className="w-4 h-4 mr-2" />
            {editingCard ? 'Atualizar Cartão' : 'Adicionar Cartão'}
          </Button>
        </div>
      </form>

      {/* Preview Side */}
      <div className="lg:sticky lg:top-4">
        <Label className="text-base font-medium mb-4 block">Prévia do Cartão</Label>
        <div className="flex items-center justify-center min-h-[300px] bg-muted/30 rounded-xl p-6">
          <FlipCard card={previewCard as FlashcardCard} isPreview />
        </div>
      </div>
    </div>
  );
}

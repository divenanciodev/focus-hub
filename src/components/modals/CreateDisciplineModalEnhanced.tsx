import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { subjectColors, weekDays } from '@/types/schedule';
import { StudyPlan } from '@/types';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateDisciplineData {
  name: string;
  subject: string;
  specificSubject: string;
  grade: string;
  tags: string[];
  color: string;
  studyPlan: StudyPlan;
}

interface CreateDisciplineModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDisciplineData) => void;
}

const subjects = [
  'Direito',
  'Línguas',
  'Português',
  'Matemática',
  'Exatas',
  'Tecnologia',
  'Conhecimentos Gerais',
  'Ciências Humanas',
  'Ciências da Natureza',
  'Outros',
];

const grades = [
  'Fundamental',
  'Médio',
  'Superior',
  'Pós-graduação',
  'Concursos',
];

export function CreateDisciplineModalEnhanced({
  open,
  onOpenChange,
  onSubmit,
}: CreateDisciplineModalEnhancedProps) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [specificSubject, setSpecificSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [color, setColor] = useState(subjectColors[0]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [hoursPerDay, setHoursPerDay] = useState('2');
  const [blockDuration, setBlockDuration] = useState('30');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && subject && grade) {
      onSubmit({
        name,
        subject,
        specificSubject,
        grade,
        tags,
        color,
        studyPlan: {
          days: selectedDays,
          hoursPerDay: parseFloat(hoursPerDay) || 2,
          blockDuration: parseInt(blockDuration) || 30,
        },
      });
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSubject('');
    setSpecificSubject('');
    setGrade('');
    setTags([]);
    setTagInput('');
    setColor(subjectColors[0]);
    setSelectedDays([]);
    setHoursPerDay('2');
    setBlockDuration('30');
  };

  const isValid = name && subject && grade;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Disciplina</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hierarquia */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">📚 Hierarquia da Disciplina</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Área Geral *</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Área Específica</Label>
                <Input
                  value={specificSubject}
                  onChange={(e) => setSpecificSubject(e.target.value)}
                  placeholder="Ex: Gramática"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nome da Disciplina *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Concordância Verbal"
              />
              {subject && specificSubject && (
                <p className="text-xs text-muted-foreground">
                  Será exibido como: <span className="font-medium">{subject} &gt; {specificSubject}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Grau de Escolaridade *</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">🏷️ Tags</h3>
            
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Adicionar tag..."
                className="flex-1"
              />
              <Button type="button" size="icon" onClick={handleAddTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Cor */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">🎨 Cor do Card</h3>
            
            <div className="flex flex-wrap gap-2">
              {subjectColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    color === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* Preview */}
            <div
              className="p-3 rounded-lg border-2"
              style={{
                borderColor: color,
                backgroundColor: `${color}15`,
              }}
            >
              <p className="text-sm font-medium">Preview do card</p>
              <p className="text-xs text-muted-foreground">
                {subject}{specificSubject && ` > ${specificSubject}`}
              </p>
            </div>
          </div>

          {/* Planejamento */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">📅 Planejamento de Estudo</h3>
            
            <div className="space-y-2">
              <Label>Dias da semana</Label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => toggleDay(day.key)}
                    className={cn(
                      "px-3 py-2 text-xs rounded-lg border transition-all",
                      selectedDays.includes(day.key)
                        ? "bg-foreground text-background border-foreground"
                        : "bg-secondary text-foreground border-border hover:border-foreground/30"
                    )}
                  >
                    {day.label.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Horas por dia</Label>
                <Select value={hoursPerDay} onValueChange={setHoursPerDay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora</SelectItem>
                    <SelectItem value="1.5">1h30</SelectItem>
                    <SelectItem value="2">2 horas</SelectItem>
                    <SelectItem value="2.5">2h30</SelectItem>
                    <SelectItem value="3">3 horas</SelectItem>
                    <SelectItem value="4">4 horas</SelectItem>
                    <SelectItem value="5">5 horas</SelectItem>
                    <SelectItem value="6">6 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tempo por bloco</Label>
                <Select value={blockDuration} onValueChange={setBlockDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 min (Pomodoro)</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1h30</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedDays.length > 0 && (
              <p className="text-xs text-muted-foreground">
                📊 Serão criados{' '}
                <span className="font-medium">
                  {Math.floor((parseFloat(hoursPerDay) * 60) / parseInt(blockDuration))} blocos
                </span>{' '}
                por dia × {selectedDays.length} dias ={' '}
                <span className="font-medium">
                  {Math.floor((parseFloat(hoursPerDay) * 60) / parseInt(blockDuration)) * selectedDays.length} blocos/semana
                </span>
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid}>
              Criar Disciplina
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
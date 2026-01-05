import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, Filter, X } from 'lucide-react';
import { subjectColors, weekDays } from '@/types/schedule';
import { cn } from '@/lib/utils';

interface SearchFilters {
  query: string;
  color: string | null;
  days: string[];
  hoursRange: string | null;
}

interface DisciplineSearchProps {
  onSearch: (filters: SearchFilters) => void;
  allTags: string[];
}

export function DisciplineSearch({ onSearch, allTags }: DisciplineSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [hoursRange, setHoursRange] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasFilters = selectedColor || selectedDays.length > 0 || hoursRange || selectedTags.length > 0;

  const handleSearch = () => {
    onSearch({
      query: `${query} ${selectedTags.join(' ')}`.trim(),
      color: selectedColor,
      days: selectedDays,
      hoursRange,
    });
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedColor(null);
    setSelectedDays([]);
    setHoursRange(null);
    setSelectedTags([]);
    onSearch({ query: '', color: null, days: [], hoursRange: null });
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar por nome, área ou tags..."
            className="pl-10"
          />
        </div>
        
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {hasFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Filtrar disciplinas</h4>

              {/* Tags */}
              {allTags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Tags</label>
                  <div className="flex flex-wrap gap-1">
                    {allTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Cores */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {subjectColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(selectedColor === c ? null : c)}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-all",
                        selectedColor === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  {selectedColor && (
                    <button
                      onClick={() => setSelectedColor(null)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Dias */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Dias de Estudo</label>
                <div className="flex flex-wrap gap-1">
                  {weekDays.map((day) => (
                    <button
                      key={day.key}
                      onClick={() => toggleDay(day.key)}
                      className={cn(
                        "px-2 py-1 text-xs rounded border transition-all",
                        selectedDays.includes(day.key)
                          ? "bg-foreground text-background"
                          : "bg-secondary hover:bg-secondary/80"
                      )}
                    >
                      {day.label.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Carga Horária */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Carga Horária</label>
                <Select value={hoursRange || 'all'} onValueChange={(v) => setHoursRange(v === 'all' ? null : v)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualquer</SelectItem>
                    <SelectItem value="1-2">1-2 horas/dia</SelectItem>
                    <SelectItem value="2-4">2-4 horas/dia</SelectItem>
                    <SelectItem value="4+">4+ horas/dia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={clearFilters} className="flex-1">
                  Limpar
                </Button>
                <Button size="sm" onClick={() => { handleSearch(); setIsFilterOpen(false); }} className="flex-1">
                  Aplicar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={handleSearch}>
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtros ativos:</span>
          {selectedColor && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColor }} />
              Cor
              <button onClick={() => setSelectedColor(null)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {selectedDays.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {selectedDays.length} dias
              <button onClick={() => setSelectedDays([])}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {hoursRange && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {hoursRange}h
              <button onClick={() => setHoursRange(null)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {selectedTags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button onClick={() => toggleTag(tag)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground">
            Limpar todos
          </button>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Users,
  Clock,
  Zap,
  Globe,
  Lightbulb,
  Music,
  Utensils,
  Plane,
  BookOpen,
  Heart,
  Briefcase,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatRoom {
  id: string;
  name: string;
  theme: string;
  description: string;
  icon: typeof MessageCircle;
  bgColor: string;
  participants: number;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  tags: string[];
  isActive: boolean;
}

const CHAT_ROOMS: ChatRoom[] = [
  {
    id: '1',
    name: 'Café com Amigos',
    theme: 'Conversas Casuais',
    description: 'Bate-papo descontraído sobre o dia a dia, hobbies e experiências pessoais.',
    icon: Users,
    bgColor: 'bg-gradient-to-br from-amber-400 to-orange-500',
    participants: 12,
    difficulty: 'Iniciante',
    tags: ['casual', 'amigos', 'cotidiano'],
    isActive: true,
  },
  {
    id: '2',
    name: 'Viajantes do Mundo',
    theme: 'Viagens e Culturas',
    description: 'Compartilhe experiências de viagens, dicas de destinos e curiosidades culturais.',
    icon: Plane,
    bgColor: 'bg-gradient-to-br from-blue-400 to-cyan-500',
    participants: 8,
    difficulty: 'Intermediário',
    tags: ['viagens', 'cultura', 'aventura'],
    isActive: true,
  },
  {
    id: '3',
    name: 'Clube do Livro',
    theme: 'Literatura e Leitura',
    description: 'Discussões sobre livros, autores favoritos e recomendações de leitura.',
    icon: BookOpen,
    bgColor: 'bg-gradient-to-br from-purple-400 to-indigo-500',
    participants: 15,
    difficulty: 'Intermediário',
    tags: ['livros', 'literatura', 'leitura'],
    isActive: true,
  },
  {
    id: '4',
    name: 'Sabores do Mundo',
    theme: 'Culinária',
    description: 'Receitas, técnicas culinárias e descoberta de pratos de diferentes culturas.',
    icon: Utensils,
    bgColor: 'bg-gradient-to-br from-red-400 to-pink-500',
    participants: 10,
    difficulty: 'Iniciante',
    tags: ['comida', 'receitas', 'culinária'],
    isActive: true,
  },
  {
    id: '5',
    name: 'Melodias Internacionais',
    theme: 'Música',
    description: 'Compartilhe suas músicas favoritas, artistas e gêneros musicais do mundo.',
    icon: Music,
    bgColor: 'bg-gradient-to-br from-green-400 to-emerald-500',
    participants: 18,
    difficulty: 'Iniciante',
    tags: ['música', 'artistas', 'entretenimento'],
    isActive: true,
  },
  {
    id: '6',
    name: 'Carreira e Profissão',
    theme: 'Trabalho e Negócios',
    description: 'Discussões sobre carreiras, oportunidades profissionais e desenvolvimento pessoal.',
    icon: Briefcase,
    bgColor: 'bg-gradient-to-br from-slate-400 to-gray-600',
    participants: 9,
    difficulty: 'Avançado',
    tags: ['trabalho', 'carreira', 'negócios'],
    isActive: true,
  },
  {
    id: '7',
    name: 'Ideias Criativas',
    theme: 'Arte e Criatividade',
    description: 'Compartilhe projetos criativos, dicas de design, arte e expressão pessoal.',
    icon: Lightbulb,
    bgColor: 'bg-gradient-to-br from-yellow-400 to-orange-400',
    participants: 11,
    difficulty: 'Intermediário',
    tags: ['arte', 'criatividade', 'design'],
    isActive: true,
  },
  {
    id: '8',
    name: 'Bem-estar e Saúde',
    theme: 'Saúde e Bem-estar',
    description: 'Dicas de saúde, fitness, meditação e equilíbrio emocional.',
    icon: Heart,
    bgColor: 'bg-gradient-to-br from-rose-400 to-red-500',
    participants: 14,
    difficulty: 'Iniciante',
    tags: ['saúde', 'bem-estar', 'fitness'],
    isActive: true,
  },
  {
    id: '9',
    name: 'Tecnologia e Inovação',
    theme: 'Tecnologia',
    description: 'Discussões sobre tecnologia, inovação, gadgets e tendências digitais.',
    icon: Zap,
    bgColor: 'bg-gradient-to-br from-violet-400 to-purple-500',
    participants: 16,
    difficulty: 'Avançado',
    tags: ['tecnologia', 'inovação', 'digital'],
    isActive: true,
  },
];

interface ChatRoomsViewProps {
  languageName: string;
}

export function ChatRoomsView({ languageName }: ChatRoomsViewProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<'Todos' | 'Iniciante' | 'Intermediário' | 'Avançado'>('Todos');

  const filteredRooms = CHAT_ROOMS.filter(room => {
    if (filterDifficulty === 'Todos') return true;
    return room.difficulty === filterDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediário':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Avançado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Salas de Conversação</h1>
            <p className="text-muted-foreground mt-1">Pratique {languageName} em salas temáticas com outros estudantes</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(['Todos', 'Iniciante', 'Intermediário', 'Avançado'] as const).map(level => (
          <Button
            key={level}
            variant={filterDifficulty === level ? 'default' : 'outline'}
            onClick={() => setFilterDifficulty(level)}
            className="rounded-full"
          >
            {level}
          </Button>
        ))}
      </div>

      {/* Grid de Salas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map(room => {
          const IconComponent = room.icon;
          return (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className="group cursor-pointer"
            >
              <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50">
                {/* Gradient Header */}
                <div className={cn('h-24 p-4 flex items-end justify-between', room.bgColor)}>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    <Users className="w-3 h-3 mr-1" />
                    {room.participants}
                  </Badge>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <CardDescription className="text-xs font-semibold text-primary/70 uppercase tracking-wide">
                    {room.theme}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>

                  {/* Difficulty Badge */}
                  <div className="flex items-center gap-2">
                    <Badge className={cn('rounded-full', getDifficultyColor(room.difficulty))}>
                      {room.difficulty}
                    </Badge>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {room.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs rounded-full">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Status e Botão */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-muted-foreground font-medium">Ativa agora</span>
                    </div>
                    <Button
                      size="sm"
                      className="rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white border-0"
                      onClick={() => setSelectedRoom(room.id)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Entrar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRooms.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Globe className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma sala encontrada</h3>
          <p className="text-muted-foreground">Tente ajustar os filtros para ver mais salas.</p>
        </div>
      )}

      {/* Selected Room Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex-1">
                <CardTitle>{CHAT_ROOMS.find(r => r.id === selectedRoom)?.name}</CardTitle>
                <CardDescription>
                  {CHAT_ROOMS.find(r => r.id === selectedRoom)?.theme}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRoom(null)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {CHAT_ROOMS.find(r => r.id === selectedRoom)?.description}
              </p>
              <div className="bg-muted p-4 rounded-lg text-center text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Sala de conversação em tempo real</p>
                <p className="text-xs mt-2">Esta funcionalidade será integrada em breve com WebSocket para chat ao vivo.</p>
              </div>
              <Button
                className="w-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white border-0"
                onClick={() => setSelectedRoom(null)}
              >
                Fechar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

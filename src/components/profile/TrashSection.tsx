import { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Loader2, Link, Folder, FolderOpen, BookOpen, Target, Brain, GraduationCap, Trophy, CheckSquare, Calendar, FileQuestion, Globe } from 'lucide-react';
import { useTrash, TrashItem } from '@/hooks/useTrash';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TYPE_ICONS: Record<TrashItem['type'], React.ComponentType<{ className?: string }>> = {
  link: Link,
  subfolder: FolderOpen,
  folder: Folder,
  discipline: BookOpen,
  objective: Target,
  flashcard_group: Brain,
  course: GraduationCap,
  contest: Trophy,
  habit: CheckSquare,
  schedule: Calendar,
  simulado: FileQuestion,
  language: Globe,
};

const TYPE_COLORS: Record<TrashItem['type'], string> = {
  link: 'bg-blue-500/10 text-blue-500',
  subfolder: 'bg-amber-500/10 text-amber-500',
  folder: 'bg-orange-500/10 text-orange-500',
  discipline: 'bg-purple-500/10 text-purple-500',
  objective: 'bg-green-500/10 text-green-500',
  flashcard_group: 'bg-pink-500/10 text-pink-500',
  course: 'bg-indigo-500/10 text-indigo-500',
  contest: 'bg-yellow-500/10 text-yellow-500',
  habit: 'bg-teal-500/10 text-teal-500',
  schedule: 'bg-cyan-500/10 text-cyan-500',
  simulado: 'bg-red-500/10 text-red-500',
  language: 'bg-emerald-500/10 text-emerald-500',
};

export function TrashSection() {
  const { items, loading, restoreItem, permanentlyDeleteItem, emptyTrash, getTypeLabel } = useTrash();
  const [isEmptying, setIsEmptying] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRestore = async (item: TrashItem) => {
    setRestoringId(item.id);
    await restoreItem(item);
    setRestoringId(null);
  };

  const handlePermanentDelete = async (item: TrashItem) => {
    setDeletingId(item.id);
    await permanentlyDeleteItem(item);
    setDeletingId(null);
  };

  const handleEmptyTrash = async () => {
    setIsEmptying(true);
    await emptyTrash();
    setIsEmptying(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Lixeira
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Lixeira
            </CardTitle>
            <CardDescription>
              {items.length === 0
                ? 'A lixeira está vazia'
                : `${items.length} item(s) na lixeira`}
            </CardDescription>
          </div>
          {items.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isEmptying}>
                  {isEmptying ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Esvaziar Lixeira
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Esvaziar Lixeira
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é irreversível! Todos os {items.length} itens serão excluídos permanentemente do banco de dados e não poderão ser recuperados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleEmptyTrash}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Esvaziar Lixeira
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Trash2 className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Nenhum item na lixeira</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Itens excluídos aparecerão aqui
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {items.map((item) => {
                const Icon = TYPE_ICONS[item.type];
                const colorClass = TYPE_COLORS[item.type];
                const isRestoring = restoringId === item.id;
                const isDeleting = deletingId === item.id;

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:border-foreground/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {getTypeLabel(item.type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Excluído em {format(item.deletedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(item)}
                        disabled={isRestoring || isDeleting}
                      >
                        {isRestoring ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Restaurar
                          </>
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={isRestoring || isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação é irreversível. O item "{item.name}" será excluído permanentemente e não poderá ser recuperado.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handlePermanentDelete(item)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir Permanentemente
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

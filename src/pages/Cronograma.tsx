import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CreateScheduleModal } from '@/components/schedule/CreateScheduleModal';
import { ScheduleTable } from '@/components/schedule/ScheduleTable';
import { Schedule, ScheduleBlock } from '@/types/schedule';
import { Plus, Calendar, ArrowLeft, MoreVertical, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSchedules } from '@/hooks/useSchedules';

export default function Cronograma() {
  const { schedules, isLoading, createSchedule, updateBlocks, deleteSchedule } = useSchedules();
  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);

  const handleCreateSchedule = (data: Omit<Schedule, 'id' | 'blocks'>) => {
    createSchedule.mutate(data, {
      onSuccess: (newSchedule) => {
        setActiveSchedule(newSchedule);
      },
    });
  };

  const handleUpdateBlocks = (blocks: { [key: string]: ScheduleBlock }) => {
    if (!activeSchedule) return;
    
    updateBlocks.mutate({ id: activeSchedule.id, blocks }, {
      onSuccess: (updatedSchedule) => {
        setActiveSchedule(updatedSchedule);
      },
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, schedule: Schedule) => {
    e.stopPropagation();
    setScheduleToDelete(schedule);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (scheduleToDelete) {
      deleteSchedule.mutate(scheduleToDelete.id);
      if (activeSchedule?.id === scheduleToDelete.id) {
        setActiveSchedule(null);
      }
      setScheduleToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activeSchedule) {
    return (
      <div className="fade-in">
        <PageHeader
          title={activeSchedule.name}
          description={`Objetivo: ${activeSchedule.objective} • ${activeSchedule.hoursPerDay}h por dia • ${activeSchedule.startTime} às ${activeSchedule.endTime}`}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setActiveSchedule(null)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          }
        />

        <ScheduleTable
          schedule={activeSchedule}
          onUpdateBlocks={handleUpdateBlocks}
        />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Cronograma de Estudos"
        description="Monte sua rotina semanal de estudos personalizada"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Cronograma
          </Button>
        }
      />

      {schedules.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Nenhum cronograma criado"
          description="Crie seu primeiro cronograma para organizar sua rotina de estudos."
          actionLabel="Criar Cronograma"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-foreground/20 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              onClick={() => setActiveSchedule(schedule)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{schedule.name}</h3>
                  <p className="text-sm text-muted-foreground">{schedule.objective}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border border-border z-50">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSchedule(schedule);
                      }}
                      className="cursor-pointer"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => handleDeleteClick(e, schedule)}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>⏰ {schedule.startTime} - {schedule.endTime}</p>
                <p>📚 {schedule.hoursPerDay}h por dia</p>
                <p>🎯 {Object.keys(schedule.blocks).length} blocos configurados</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateScheduleModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateSchedule}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cronograma?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O cronograma "{scheduleToDelete?.name}" e todos os seus blocos serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

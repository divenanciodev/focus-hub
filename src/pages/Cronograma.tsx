import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CreateScheduleModal } from '@/components/schedule/CreateScheduleModal';
import { ScheduleTable } from '@/components/schedule/ScheduleTable';
import { Schedule, ScheduleBlock } from '@/types/schedule';
import { Plus, Calendar, ArrowLeft, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Cronograma() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateSchedule = (data: Omit<Schedule, 'id' | 'blocks'>) => {
    const newSchedule: Schedule = {
      ...data,
      id: Date.now().toString(),
      blocks: {},
    };
    setSchedules([...schedules, newSchedule]);
    setActiveSchedule(newSchedule);
  };

  const handleUpdateBlocks = (blocks: { [key: string]: ScheduleBlock }) => {
    if (!activeSchedule) return;
    
    const updatedSchedule = { ...activeSchedule, blocks };
    setActiveSchedule(updatedSchedule);
    setSchedules(prev =>
      prev.map(s => s.id === activeSchedule.id ? updatedSchedule : s)
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    if (activeSchedule?.id === id) {
      setActiveSchedule(null);
    }
  };

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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSchedule(schedule.id);
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Settings className="w-4 h-4" />
                </Button>
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
    </div>
  );
}

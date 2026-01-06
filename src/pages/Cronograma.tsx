import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CreateScheduleModal } from '@/components/schedule/CreateScheduleModal';
import { ScheduleTable } from '@/components/schedule/ScheduleTable';
import { Schedule, ScheduleBlock } from '@/types/schedule';
import { Plus, Calendar, ArrowLeft, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

// Cronograma de exemplo para demonstrar a funcionalidade
const exampleSchedule: Schedule = {
  id: 'example-1',
  name: 'Cronograma Concurso INSS',
  objective: 'Aprovação INSS 2025',
  hoursPerDay: 6,
  startTime: '06:00',
  endTime: '22:00',
  blockDuration: 60,
  restDuration: 10,
  blocks: {
    // Segunda-feira
    'monday-06:00': { id: '1', subject: 'Português', activityType: 'Estudo', color: '#3b82f6', duration: 60 },
    'monday-07:00': { id: '2', subject: 'Português', activityType: 'Revisão', color: '#3b82f6', duration: 60 },
    'monday-08:00': { id: '3', subject: 'Direito Constitucional', activityType: 'Estudo', color: '#ef4444', duration: 60 },
    'monday-09:00': { id: '4', subject: 'Direito Constitucional', activityType: 'Estudo', color: '#ef4444', duration: 60 },
    'monday-14:00': { id: '5', subject: 'Raciocínio Lógico', activityType: 'Estudo', color: '#22c55e', duration: 60 },
    'monday-15:00': { id: '6', subject: 'Raciocínio Lógico', activityType: 'Exercícios', color: '#22c55e', duration: 60 },
    'monday-19:00': { id: '7', subject: 'Informática', activityType: 'Estudo', color: '#8b5cf6', duration: 60 },
    
    // Terça-feira
    'tuesday-06:00': { id: '8', subject: 'Direito Administrativo', activityType: 'Estudo', color: '#f97316', duration: 60 },
    'tuesday-07:00': { id: '9', subject: 'Direito Administrativo', activityType: 'Estudo', color: '#f97316', duration: 60 },
    'tuesday-08:00': { id: '10', subject: 'Direito Previdenciário', activityType: 'Estudo', color: '#ec4899', duration: 60 },
    'tuesday-09:00': { id: '11', subject: 'Direito Previdenciário', activityType: 'Estudo', color: '#ec4899', duration: 60 },
    'tuesday-14:00': { id: '12', subject: 'Português', activityType: 'Simulado', color: '#3b82f6', duration: 60 },
    'tuesday-15:00': { id: '13', subject: 'Ética', activityType: 'Estudo', color: '#14b8a6', duration: 60 },
    'tuesday-19:00': { id: '14', subject: 'Atualidades', activityType: 'Leitura', color: '#6b7280', duration: 60 },
    
    // Quarta-feira
    'wednesday-06:00': { id: '15', subject: 'Português', activityType: 'Estudo', color: '#3b82f6', duration: 60 },
    'wednesday-07:00': { id: '16', subject: 'Direito Constitucional', activityType: 'Revisão', color: '#ef4444', duration: 60 },
    'wednesday-08:00': { id: '17', subject: 'Direito Constitucional', activityType: 'Exercícios', color: '#ef4444', duration: 60 },
    'wednesday-09:00': { id: '18', subject: 'Direito Administrativo', activityType: 'Revisão', color: '#f97316', duration: 60 },
    'wednesday-14:00': { id: '19', subject: 'Raciocínio Lógico', activityType: 'Simulado', color: '#22c55e', duration: 60 },
    'wednesday-15:00': { id: '20', subject: 'Informática', activityType: 'Exercícios', color: '#8b5cf6', duration: 60 },
    'wednesday-19:00': { id: '21', subject: 'Direito Previdenciário', activityType: 'Estudo', color: '#ec4899', duration: 60 },
    
    // Quinta-feira
    'thursday-06:00': { id: '22', subject: 'Direito Previdenciário', activityType: 'Estudo', color: '#ec4899', duration: 60 },
    'thursday-07:00': { id: '23', subject: 'Direito Previdenciário', activityType: 'Exercícios', color: '#ec4899', duration: 60 },
    'thursday-08:00': { id: '24', subject: 'Ética', activityType: 'Revisão', color: '#14b8a6', duration: 60 },
    'thursday-09:00': { id: '25', subject: 'Português', activityType: 'Redação', color: '#3b82f6', duration: 60 },
    'thursday-14:00': { id: '26', subject: 'Direito Administrativo', activityType: 'Estudo', color: '#f97316', duration: 60 },
    'thursday-15:00': { id: '27', subject: 'Direito Administrativo', activityType: 'Exercícios', color: '#f97316', duration: 60 },
    'thursday-19:00': { id: '28', subject: 'Direito Constitucional', activityType: 'Simulado', color: '#ef4444', duration: 60 },
    
    // Sexta-feira
    'friday-06:00': { id: '29', subject: 'Revisão Geral', activityType: 'Revisão', color: '#6b7280', duration: 60 },
    'friday-07:00': { id: '30', subject: 'Português', activityType: 'Exercícios', color: '#3b82f6', duration: 60 },
    'friday-08:00': { id: '31', subject: 'Raciocínio Lógico', activityType: 'Estudo', color: '#22c55e', duration: 60 },
    'friday-09:00': { id: '32', subject: 'Informática', activityType: 'Estudo', color: '#8b5cf6', duration: 60 },
    'friday-14:00': { id: '33', subject: 'Direito Previdenciário', activityType: 'Simulado', color: '#ec4899', duration: 60 },
    'friday-15:00': { id: '34', subject: 'Direito Previdenciário', activityType: 'Simulado', color: '#ec4899', duration: 60 },
    
    // Sábado
    'saturday-08:00': { id: '35', subject: 'Simulado Completo', activityType: 'Simulado', color: '#000000', duration: 60 },
    'saturday-09:00': { id: '36', subject: 'Simulado Completo', activityType: 'Simulado', color: '#000000', duration: 60 },
    'saturday-10:00': { id: '37', subject: 'Simulado Completo', activityType: 'Simulado', color: '#000000', duration: 60 },
    'saturday-11:00': { id: '38', subject: 'Simulado Completo', activityType: 'Simulado', color: '#000000', duration: 60 },
    'saturday-14:00': { id: '39', subject: 'Correção', activityType: 'Revisão', color: '#6b7280', duration: 60 },
    'saturday-15:00': { id: '40', subject: 'Correção', activityType: 'Revisão', color: '#6b7280', duration: 60 },
    
    // Domingo
    'sunday-09:00': { id: '41', subject: 'Revisão Semanal', activityType: 'Revisão', color: '#6b7280', duration: 60 },
    'sunday-10:00': { id: '42', subject: 'Revisão Semanal', activityType: 'Revisão', color: '#6b7280', duration: 60 },
    'sunday-14:00': { id: '43', subject: 'Leitura Complementar', activityType: 'Leitura', color: '#14b8a6', duration: 60 },
  },
};

export default function Cronograma() {
  const [schedules, setSchedules] = useState<Schedule[]>([exampleSchedule]);
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

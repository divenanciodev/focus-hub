import { useState, useMemo } from 'react';
import { Copy, RotateCcw, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScheduleBlockModal } from './ScheduleBlockModal';
import { Schedule, ScheduleBlock, weekDays, activityTypes } from '@/types/schedule';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ScheduleTableProps {
  schedule: Schedule;
  onUpdateBlocks: (blocks: { [key: string]: ScheduleBlock }) => void;
}

export function ScheduleTable({ schedule, onUpdateBlocks }: ScheduleTableProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<{ key: string; block: ScheduleBlock } | null>(null);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'compact' | 'normal'>('compact');
  const [showActivityType, setShowActivityType] = useState(true);
  const [blockInterval, setBlockInterval] = useState<'30' | '60'>('60');

  // Generate time slots based on schedule start/end time and interval
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    const startHour = parseInt(schedule.startTime.split(':')[0]);
    const endHour = parseInt(schedule.endTime.split(':')[0]);
    const interval = parseInt(blockInterval);

    for (let hour = startHour; hour < endHour; hour++) {
      if (interval === 30) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      } else {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    }
    return slots;
  }, [schedule.startTime, schedule.endTime, blockInterval]);

  const handleCellClick = (day: string, time: string) => {
    const key = `${day}-${time}`;
    setSelectedCell(key);
    setEditingBlock(schedule.blocks[key] || null);
    setIsModalOpen(true);
  };

  const handleSaveBlock = (block: ScheduleBlock) => {
    if (!selectedCell) return;
    const newBlocks = { ...schedule.blocks, [selectedCell]: block };
    onUpdateBlocks(newBlocks);
    setIsModalOpen(false);
  };

  const handleDeleteBlock = () => {
    if (!selectedCell) return;
    const newBlocks = { ...schedule.blocks };
    delete newBlocks[selectedCell];
    onUpdateBlocks(newBlocks);
    setIsModalOpen(false);
  };

  const handleDragStart = (e: React.DragEvent, key: string, block: ScheduleBlock) => {
    setDraggedBlock({ key, block });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    if (draggedBlock && draggedBlock.key !== key) {
      setDragOverCell(key);
    }
  };

  const handleDrop = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedBlock || draggedBlock.key === targetKey) {
      setDraggedBlock(null);
      setDragOverCell(null);
      return;
    }

    const newBlocks = { ...schedule.blocks };
    newBlocks[targetKey] = { ...draggedBlock.block };
    delete newBlocks[draggedBlock.key];
    
    onUpdateBlocks(newBlocks);
    setDraggedBlock(null);
    setDragOverCell(null);
  };

  const handleReset = () => onUpdateBlocks({});

  const handleCopyDay = (sourceDay: string) => {
    const dayBlocks = Object.entries(schedule.blocks).filter(([key]) => key.startsWith(`${sourceDay}-`));
    if (dayBlocks.length === 0) return;

    const dayIndex = weekDays.findIndex((d) => d.key === sourceDay);
    const targetDay = weekDays[(dayIndex + 1) % weekDays.length].key;

    const newBlocks = { ...schedule.blocks };
    dayBlocks.forEach(([key, block]) => {
      const time = key.split('-')[1];
      newBlocks[`${targetDay}-${time}`] = { ...block, id: Date.now().toString() + Math.random() };
    });
    onUpdateBlocks(newBlocks);
  };

  const handleResetDay = (day: string) => {
    const newBlocks = { ...schedule.blocks };
    Object.keys(newBlocks).forEach((key) => {
      if (key.startsWith(`${day}-`)) delete newBlocks[key];
    });
    onUpdateBlocks(newBlocks);
  };

  const getActivityIcon = (type: ScheduleBlock['activityType']) => activityTypes.find((t) => t.value === type)?.icon || '📚';
  const getActivityLabel = (type: ScheduleBlock['activityType']) => activityTypes.find((t) => t.value === type)?.label || 'Estudo';

  const cellHeight = viewMode === 'compact' ? 'h-9' : 'h-12';

  return (
    <div className="space-y-3">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-card border border-border rounded-lg">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Modo:</span>
            <Select value={viewMode} onValueChange={(v: 'compact' | 'normal') => setViewMode(v)}>
              <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compacto</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Intervalo:</span>
            <Select value={blockInterval} onValueChange={(v: '30' | '60') => setBlockInterval(v)}>
              <SelectTrigger className="h-7 w-20 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowActivityType(!showActivityType)} className="h-7 text-xs gap-1 px-2">
            {showActivityType ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Tipos
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="h-7 text-xs gap-1">
          <RotateCcw className="w-3 h-3" />
          Resetar
        </Button>
      </div>

      {/* Schedule Grid */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted">
                <th className="w-14 text-[10px] font-medium text-muted-foreground border-r border-border p-1.5">Horário</th>
                {weekDays.map((day) => (
                  <th key={day.key} className="text-[10px] font-medium text-foreground border-r border-border last:border-r-0 p-1">
                    <div className="flex items-center justify-between gap-1">
                      <span>{day.label.slice(0, 3)}</span>
                      <div className="flex">
                        <TooltipProvider><Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => handleCopyDay(day.key)} className="p-0.5 hover:bg-background rounded opacity-40 hover:opacity-100">
                              <Copy className="w-2.5 h-2.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">Copiar dia</TooltipContent>
                        </Tooltip></TooltipProvider>
                        <TooltipProvider><Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => handleResetDay(day.key)} className="p-0.5 hover:bg-background rounded opacity-40 hover:opacity-100">
                              <RotateCcw className="w-2.5 h-2.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">Limpar dia</TooltipContent>
                        </Tooltip></TooltipProvider>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time, i) => (
                <tr key={time} className={cn("border-t border-border", i % 2 === 0 ? "bg-background" : "bg-muted/30")}>
                  <td className={cn("text-[10px] text-muted-foreground text-center border-r border-border font-medium", cellHeight)}>{time}</td>
                  {weekDays.map((day) => {
                    const key = `${day.key}-${time}`;
                    const block = schedule.blocks[key];
                    return (
                      <td
                        key={key}
                        className={cn("border-r border-border last:border-r-0 p-0.5 cursor-pointer transition-colors", cellHeight, dragOverCell === key && "bg-primary/10", !block && "hover:bg-muted/50")}
                        onClick={() => !block && handleCellClick(day.key, time)}
                        onDragOver={(e) => handleDragOver(e, key)}
                        onDragLeave={() => setDragOverCell(null)}
                        onDrop={(e) => handleDrop(e, key)}
                      >
                        {block && (
                          <TooltipProvider><Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, key, block)}
                                onDragEnd={() => { setDraggedBlock(null); setDragOverCell(null); }}
                                onClick={(e) => { e.stopPropagation(); handleCellClick(day.key, time); }}
                                className="h-full rounded px-1 py-0.5 flex items-center gap-0.5 cursor-grab active:cursor-grabbing text-[9px]"
                                style={{ backgroundColor: `${block.color}25`, borderLeft: `2px solid ${block.color}` }}
                              >
                                <GripVertical className="w-2 h-2 text-muted-foreground/40 flex-shrink-0" />
                                {showActivityType && <span className="flex-shrink-0 text-[10px]">{getActivityIcon(block.activityType)}</span>}
                                <span className="truncate font-medium">{block.subject}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <p className="font-medium">{block.subject}</p>
                              <p className="text-muted-foreground">{getActivityLabel(block.activityType)} • {block.duration}min</p>
                            </TooltipContent>
                          </Tooltip></TooltipProvider>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ScheduleBlockModal open={isModalOpen} onOpenChange={setIsModalOpen} block={editingBlock} onSave={handleSaveBlock} onDelete={editingBlock ? handleDeleteBlock : undefined} />
    </div>
  );
}
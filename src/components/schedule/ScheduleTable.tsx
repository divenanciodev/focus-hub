import { useState } from 'react';
import { Plus, Trash2, RotateCcw, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScheduleBlockModal } from './ScheduleBlockModal';
import { Schedule, ScheduleBlock, weekDays, timeSlots, activityTypes } from '@/types/schedule';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ScheduleTableProps {
  schedule: Schedule;
  onUpdateBlocks: (blocks: { [key: string]: ScheduleBlock }) => void;
}

export function ScheduleTable({ schedule, onUpdateBlocks }: ScheduleTableProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<{ key: string; block: ScheduleBlock } | null>(null);

  const getBlockKey = (day: string, time: string) => `${day}-${time}`;

  const handleCellClick = (day: string, time: string) => {
    const key = getBlockKey(day, time);
    const existingBlock = schedule.blocks[key];
    if (existingBlock) {
      setEditingBlock(existingBlock);
    } else {
      setEditingBlock(null);
    }
    setSelectedCell(key);
    setIsModalOpen(true);
  };

  const handleSaveBlock = (block: ScheduleBlock) => {
    if (!selectedCell) return;
    const newBlocks = { ...schedule.blocks, [selectedCell]: block };
    onUpdateBlocks(newBlocks);
    setIsModalOpen(false);
    setSelectedCell(null);
    setEditingBlock(null);
  };

  const handleDeleteBlock = () => {
    if (!selectedCell) return;
    const newBlocks = { ...schedule.blocks };
    delete newBlocks[selectedCell];
    onUpdateBlocks(newBlocks);
    setIsModalOpen(false);
    setSelectedCell(null);
    setEditingBlock(null);
  };

  const handleDragStart = (e: React.DragEvent, day: string, time: string) => {
    const key = getBlockKey(day, time);
    const block = schedule.blocks[key];
    if (block) {
      setDraggedBlock({ key, block });
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, day: string, time: string) => {
    e.preventDefault();
    if (!draggedBlock) return;

    const targetKey = getBlockKey(day, time);
    if (targetKey === draggedBlock.key) return;

    const newBlocks = { ...schedule.blocks };
    delete newBlocks[draggedBlock.key];
    newBlocks[targetKey] = draggedBlock.block;
    onUpdateBlocks(newBlocks);
    setDraggedBlock(null);
  };

  const handleReset = () => {
    onUpdateBlocks({});
  };

  const handleDuplicate = () => {
    // Just a visual confirmation - in a real app this would create a copy
    alert('Cronograma duplicado! (simulação)');
  };

  const getActivityIcon = (type: ScheduleBlock['activityType']) => {
    return activityTypes.find(t => t.value === type)?.icon || '📚';
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={handleDuplicate}>
          <Copy className="w-4 h-4 mr-1" />
          Duplicar
        </Button>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Resetar
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-secondary/50">
              <th className="p-2 text-left text-xs font-semibold text-muted-foreground w-20 border-r border-border">
                Horário
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.key}
                  className="p-2 text-center text-xs font-semibold text-foreground border-r border-border last:border-r-0"
                >
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => (
              <tr key={time} className="border-t border-border">
                <td className="p-2 text-xs text-muted-foreground font-medium border-r border-border bg-secondary/30">
                  {time}
                </td>
                {weekDays.map((day) => {
                  const key = getBlockKey(day.key, time);
                  const block = schedule.blocks[key];
                  
                  return (
                    <TooltipProvider key={key}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <td
                            className={cn(
                              "p-1 border-r border-border last:border-r-0 cursor-pointer transition-colors hover:bg-secondary/50 relative min-h-[60px] h-[60px]",
                              !block && "hover:bg-secondary/30"
                            )}
                            onClick={() => handleCellClick(day.key, time)}
                            draggable={!!block}
                            onDragStart={(e) => handleDragStart(e, day.key, time)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, day.key, time)}
                          >
                            {block ? (
                              <div
                                className="h-full rounded-md p-2 text-white text-xs font-medium flex flex-col justify-center"
                                style={{ backgroundColor: block.color }}
                              >
                                <span className="flex items-center gap-1">
                                  {getActivityIcon(block.activityType)}
                                  <span className="truncate">{block.subject}</span>
                                </span>
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center opacity-0 hover:opacity-30">
                                <Plus className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                          </td>
                        </TooltipTrigger>
                        {block && (
                          <TooltipContent>
                            <p>{block.subject}</p>
                            <p className="text-xs text-muted-foreground">
                              {activityTypes.find(t => t.value === block.activityType)?.label} - {block.duration}min
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Block Modal */}
      <ScheduleBlockModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        block={editingBlock}
        onSave={handleSaveBlock}
        onDelete={editingBlock ? handleDeleteBlock : undefined}
      />
    </div>
  );
}

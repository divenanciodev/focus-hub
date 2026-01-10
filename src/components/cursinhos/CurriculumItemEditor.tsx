import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurriculumItem, CurriculumSubtopic } from '@/hooks/useCourses';
import {
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface CurriculumItemEditorProps {
  item: CurriculumItem;
  onRename: (id: string, newTitle: string) => void;
  onRemove: (id: string) => void;
  onAddSubtopic: (itemId: string, title: string) => void;
  onRemoveSubtopic: (itemId: string, subtopicId: string) => void;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (id: string) => void;
  isDragging?: boolean;
}

export function CurriculumItemEditor({
  item,
  onRename,
  onRemove,
  onAddSubtopic,
  onRemoveSubtopic,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}: CurriculumItemEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtopicTitle, setNewSubtopicTitle] = useState('');

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onRename(item.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleAddSubtopic = () => {
    if (newSubtopicTitle.trim()) {
      onAddSubtopic(item.id, newSubtopicTitle.trim());
      setNewSubtopicTitle('');
    }
  };

  const hasSubtopics = item.subtopics && item.subtopics.length > 0;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(item.id)}
      onDragOver={(e) => onDragOver(e, item.id)}
      onDrop={() => onDrop(item.id)}
      className={`border border-border rounded-lg bg-secondary/50 transition-all ${
        isDragging ? 'opacity-50 border-primary' : ''
      }`}
    >
      <div className="flex items-center gap-2 p-2">
        <div className="cursor-grab text-muted-foreground hover:text-foreground">
          <GripVertical className="w-4 h-4" />
        </div>

        {hasSubtopics && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        )}

        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="h-7 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') setIsEditing(false);
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary"
              onClick={handleSaveTitle}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsEditing(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <span className="flex-1 text-sm">{item.title}</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setEditTitle(item.title);
                  setIsEditing(true);
                }}
              >
                <Pencil className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Subtopics section */}
      <Collapsible open={isExpanded || !hasSubtopics}>
        <CollapsibleContent>
          <div className="px-3 pb-2 pt-1 border-t border-border/50">
            {/* Add subtopic input */}
            <div className="flex gap-2 mb-2">
              <Input
                value={newSubtopicTitle}
                onChange={(e) => setNewSubtopicTitle(e.target.value)}
                placeholder="Adicionar subtópico..."
                className="h-7 text-xs flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtopic();
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleAddSubtopic}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            {/* Subtopics list */}
            {hasSubtopics && (
              <div className="space-y-1 pl-4">
                {item.subtopics!.map((subtopic) => (
                  <div
                    key={subtopic.id}
                    className="flex items-center justify-between p-1.5 rounded bg-background/50 text-xs"
                  >
                    <span>• {subtopic.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive"
                      onClick={() => onRemoveSubtopic(item.id, subtopic.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
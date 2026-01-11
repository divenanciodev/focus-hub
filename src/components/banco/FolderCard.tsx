import { Folder, ChevronRight, Trash2, Edit2 } from 'lucide-react';
import { BankFolder } from '@/types/linkBank';
import { Button } from '@/components/ui/button';

interface FolderCardProps {
  folder: BankFolder;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  linkCount?: number;
  subfolderCount?: number;
}

export function FolderCard({ folder, onClick, onEdit, onDelete, linkCount, subfolderCount }: FolderCardProps) {
  const displaySubfolderCount = subfolderCount ?? folder.subfolders.length;
  return (
    <div
      className="bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center justify-center w-12 h-12 rounded-lg"
            style={{ backgroundColor: folder.color || 'hsl(var(--secondary))' }}
          >
            <Folder className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{folder.name}</h3>
            {folder.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">{folder.description}</p>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {displaySubfolderCount} {displaySubfolderCount === 1 ? 'subpasta' : 'subpastas'}
          {linkCount !== undefined && ` • ${linkCount} links`}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

import { ExternalLink, Trash2, Edit2, Globe } from 'lucide-react';
import { BankLink } from '@/types/linkBank';
import { Button } from '@/components/ui/button';

interface LinkCardProps {
  link: BankLink;
  onEdit: () => void;
  onDelete: () => void;
}

export function LinkCard({ link, onEdit, onDelete }: LinkCardProps) {
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  const handleOpenLink = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-foreground/20 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
          {link.imageUrl ? (
            <img 
              src={link.imageUrl} 
              alt={link.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const favicon = getFaviconUrl(link.url);
                if (favicon) {
                  target.src = favicon;
                } else {
                  target.style.display = 'none';
                  target.parentElement?.classList.add('fallback-icon');
                }
              }}
            />
          ) : (
            <img 
              src={getFaviconUrl(link.url) || ''} 
              alt={link.name}
              className="w-8 h-8"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          )}
          {!link.imageUrl && !getFaviconUrl(link.url) && (
            <Globe className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground text-sm truncate">{link.name}</h3>
          {link.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{link.description}</p>
          )}
          <p className="text-xs text-muted-foreground/70 truncate mt-1">{link.url}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 mr-2"
          onClick={handleOpenLink}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Abrir
        </Button>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookMarked } from 'lucide-react';
import { ReadingLibrary } from './ReadingLibrary';
import { BibliotecaView } from './BibliotecaView';

interface BibliotecaEntryProps {
  languageName: string;
}

/**
 * Entry point for the Biblioteca section:
 * defaults to the new Reading Library, with access to the
 * personal shelf (custom books) via a toggle.
 */
export function BibliotecaEntry({ languageName }: BibliotecaEntryProps) {
  const [view, setView] = useState<'leitura' | 'estante'>('leitura');

  if (view === 'estante') {
    return (
      <div>
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4">
          <Button variant="outline" size="sm" onClick={() => setView('leitura')}>
            <BookMarked className="w-4 h-4 mr-1" />
            Voltar à Biblioteca de Leitura
          </Button>
        </div>
        <BibliotecaView languageName={languageName} />
      </div>
    );
  }

  return <ReadingLibrary languageName={languageName} onOpenEstante={() => setView('estante')} />;
}

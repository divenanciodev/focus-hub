import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { BasicoILessons } from './BasicoILessons';

interface QuestsHubProps {
  onBack?: () => void;
}

const QUEST_PACKS = [
  {
    id: 'basico-1',
    title: 'Básico I',
    description: 'Fundamentos essenciais do inglês',
    color: 'from-amber-400 via-orange-400 to-rose-400',
    icon: '🥉',
    locked: false,
  },
];

export function QuestsHub({ onBack }: QuestsHubProps) {
  const [openPack, setOpenPack] = useState<string | null>(null);

  if (openPack === 'basico-1') {
    return <BasicoILessons onBack={() => setOpenPack(null)} />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-white hover:bg-white/15 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      )}

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm mb-3">
          <Sparkles className="w-4 h-4" /> Quests
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
          Conquistas de Inglês
        </h1>
        <p className="text-white/80 mt-2">Complete missões e desbloqueie novos níveis</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {QUEST_PACKS.map((pack) => (
          <button
            key={pack.id}
            disabled={pack.locked}
            onClick={() => !pack.locked && setOpenPack(pack.id)}
            className="group text-left disabled:cursor-not-allowed"
          >
            <Card className="relative overflow-hidden bg-white dark:bg-card border-0 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all p-6 aspect-[4/5] flex flex-col items-center justify-between">
              {pack.locked && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-white" />
                </div>
              )}
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Pacote
              </div>
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${pack.color} flex items-center justify-center text-6xl shadow-lg group-hover:scale-110 transition-transform`}>
                {pack.icon}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-extrabold text-foreground">{pack.title}</h3>
                <div className="w-8 h-0.5 bg-muted-foreground/40 mx-auto my-2" />
                <p className="text-xs text-muted-foreground">{pack.description}</p>
              </div>
              <div className={`w-full py-2.5 rounded-full bg-gradient-to-r ${pack.color} text-white font-bold text-sm text-center shadow-md`}>
                Começar
              </div>
            </Card>
          </button>
        ))}

        {/* Coming soon placeholders */}
        {['Básico II', 'Intermediário I'].map((t) => (
          <Card key={t} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 aspect-[4/5] flex flex-col items-center justify-center text-center">
            <Lock className="w-10 h-10 text-white/60 mb-3" />
            <h3 className="text-lg font-bold text-white">{t}</h3>
            <p className="text-xs text-white/70 mt-1">Em breve</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

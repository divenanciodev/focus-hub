import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { QuestModules } from './QuestModules';
import { QuestCurriculum } from './QuestCurriculum';
import { QuestLesson } from './QuestLesson';
import { QuestChallenge } from './QuestChallenge';
import { QuestReward } from './QuestReward';
import { ImGoodAtModule } from './ImGoodAtModule';
import { ImModule } from './ImModule';
import { WORLDS } from './questData';

interface QuestsHubProps {
  // legacy props kept for GameHub compatibility — not used by the new flow.
  openPack: string | null;
  onOpenPack: (id: string | null) => void;
}

type Screen = 'modules' | 'curriculum' | 'lesson' | 'challenge' | 'reward';

export function QuestsHub(_props: QuestsHubProps) {
  const [screen, setScreen] = useState<Screen>('modules');
  const [activeWorldId, setActiveWorldId] = useState<string | null>(null);
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const activeWorld = useMemo(
    () => WORLDS.find((w) => w.id === activeWorldId) ?? null,
    [activeWorldId],
  );
  const allQuests = activeWorld?.quests ?? [];
  const activeQuest = useMemo(
    () => allQuests.find((q) => q.id === activeQuestId) ?? null,
    [allQuests, activeQuestId],
  );
  const activeIdx = activeQuest ? allQuests.findIndex((q) => q.id === activeQuest.id) : -1;
  const nextQuest = activeIdx >= 0 && activeIdx + 1 < allQuests.length ? allQuests[activeIdx + 1] : null;

  const openWorld = (id: string) => {
    setActiveWorldId(id);
    setScreen('curriculum');
  };

  const startQuest = (id: string) => {
    setActiveQuestId(id);
    setScreen('lesson');
  };

  const finishLesson = () => setScreen('challenge');

  const finishChallenge = () => {
    if (activeQuest) {
      setCompleted((c) => {
        const next = new Set(c);
        next.add(activeQuest.id);
        return next;
      });
    }
    setScreen('reward');
  };

  const goCurriculum = () => setScreen('curriculum');
  const goModules = () => {
    setActiveWorldId(null);
    setScreen('modules');
  };

  const goNext = () => {
    if (nextQuest) {
      setActiveQuestId(nextQuest.id);
      setScreen('lesson');
    } else {
      setScreen('curriculum');
    }
  };

  if (screen === 'lesson' && activeQuest) {
    if (activeQuest.id === 'im') {
      return (
        <ImModule quest={activeQuest} onBack={goCurriculum} onComplete={finishChallenge} />
      );
    }
    if (activeQuest.id === 'im-good-at') {
      return (
        <ImGoodAtModule quest={activeQuest} onBack={goCurriculum} onComplete={finishChallenge} />
      );
    }
    return (
      <QuestLesson quest={activeQuest} onBack={goCurriculum} onComplete={finishLesson} />
    );
  }

  if (screen === 'challenge' && activeQuest) {
    return (
      <QuestChallenge quest={activeQuest} onBack={goCurriculum} onComplete={finishChallenge} />
    );
  }

  if (screen === 'reward' && activeQuest) {
    return (
      <QuestReward
        quest={activeQuest}
        hasNext={!!nextQuest}
        onNext={goNext}
        onMap={goCurriculum}
      />
    );
  }

  if (screen === 'curriculum' && activeWorld) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm mb-3">
            <Sparkles className="w-4 h-4" /> Currículo
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
            {activeWorld.title}
          </h1>
          <p className="text-white/80 mt-2">
            Navegue pelos passos e conclua cada quest
          </p>
        </div>
        <QuestCurriculum
          world={activeWorld}
          completedQuests={completed}
          onBack={goModules}
          onSelectQuest={startQuest}
        />
      </div>
    );
  }

  // Modules grid (default)
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm mb-3">
          <Sparkles className="w-4 h-4" /> Módulos
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
          Escolha um módulo
        </h1>
        <p className="text-white/80 mt-2">
          Cada módulo é uma jornada temática. Complete para desbloquear o próximo.
        </p>
      </div>
      <QuestModules completedQuests={completed} onOpenWorld={openWorld} />
    </div>
  );
}

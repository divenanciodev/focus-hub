import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { QuestMap } from './QuestMap';
import { QuestLesson } from './QuestLesson';
import { QuestChallenge } from './QuestChallenge';
import { QuestReward } from './QuestReward';
import { ImGoodAtModule } from './ImGoodAtModule';
import { WORLDS } from './questData';

interface QuestsHubProps {
  // legacy props kept for GameHub compatibility — not used by the new flow.
  openPack: string | null;
  onOpenPack: (id: string | null) => void;
}

type Screen = 'map' | 'lesson' | 'challenge' | 'reward';

export function QuestsHub(_props: QuestsHubProps) {
  const [screen, setScreen] = useState<Screen>('map');
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const allQuests = WORLDS[0].quests;
  const activeQuest = useMemo(
    () => allQuests.find((q) => q.id === activeQuestId) ?? null,
    [allQuests, activeQuestId],
  );
  const activeIdx = activeQuest ? allQuests.findIndex((q) => q.id === activeQuest.id) : -1;
  const nextQuest = activeIdx >= 0 && activeIdx + 1 < allQuests.length ? allQuests[activeIdx + 1] : null;

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

  const goNext = () => {
    if (nextQuest) {
      setActiveQuestId(nextQuest.id);
      setScreen('lesson');
    } else {
      setScreen('map');
    }
  };

  const goMap = () => {
    setScreen('map');
  };

  if (screen === 'lesson' && activeQuest) {
    if (activeQuest.id === 'im-good-at') {
      return (
        <ImGoodAtModule
          quest={activeQuest}
          onBack={goMap}
          onComplete={finishChallenge}
        />
      );
    }
    return (
      <QuestLesson
        quest={activeQuest}
        onBack={goMap}
        onComplete={finishLesson}
      />
    );
  }

  if (screen === 'challenge' && activeQuest) {
    return (
      <QuestChallenge
        quest={activeQuest}
        onBack={goMap}
        onComplete={finishChallenge}
      />
    );
  }

  if (screen === 'reward' && activeQuest) {
    return (
      <QuestReward
        quest={activeQuest}
        hasNext={!!nextQuest}
        onNext={goNext}
        onMap={goMap}
      />
    );
  }

  // Map (default)
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm mb-3">
          <Sparkles className="w-4 h-4" /> Quests
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
          Mapa de Quests
        </h1>
        <p className="text-white/80 mt-2">Escolha uma quest verde e suba de nível</p>
      </div>
      <QuestMap
        completedQuests={completed}
        currentQuestId={activeQuestId}
        onSelectQuest={startQuest}
      />
    </div>
  );
}

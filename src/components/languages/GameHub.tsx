import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Home,
  Store,
  Gamepad2,
  Library,
  Target,
  Film,
  Heart,
  Zap,
  Coins,
  Gem,
  Trophy,
  UserPlus,
  UserCheck,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { QuestsHub } from './quests/QuestsHub';

interface GameHubProps {
  languageName: string;
  onBack: () => void;
  onOpenLibrary: () => void;
}

type HubSection = 'home' | 'store' | 'games' | 'library' | 'quests' | 'proflix';

/** Miniatura do perfil (cabeçalho) — pasta só tem SVGs em camadas; usa o corpo como ícone */
const BASE_AVATAR_URL = '/avatars/corpo-base.svg';

const AVATAR_LAYERS = {
  corpo: '/avatars/corpo-base.svg',
  short: '/avatars/short-item.svg',
  blusa: '/avatars/blusa-item.svg',
  sandalia: '/avatars/sandalia-item.svg',
  boca: '/avatars/boca-base-item.svg',
  bone: '/avatars/bone-item.svg',
} as const;

const MOCK_RANKING = [
  { id: '1', name: 'Sophia', xp: 12450, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sophia', following: false },
  { id: '2', name: 'Lucas', xp: 11200, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lucas', following: true },
  { id: '3', name: 'Aria', xp: 10800, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria', following: false },
  { id: '4', name: 'Noah', xp: 9650, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Noah', following: false },
  { id: '5', name: 'Emma', xp: 8900, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Emma', following: true },
  { id: '6', name: 'Liam', xp: 7720, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Liam', following: false },
];

export function GameHub({ languageName, onBack, onOpenLibrary }: GameHubProps) {
  const [section, setSection] = useState<HubSection>('home');
  const [profileName, setProfileName] = useState('Estudante');
  const [avatarUrl] = useState<string>(BASE_AVATAR_URL);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [rankingOpen, setRankingOpen] = useState(false);
  const [activeQuestPack, setActiveQuestPack] = useState<string | null>(null);
  const [avatarEquip, setAvatarEquip] = useState({
    shirt: false,
    shorts: false,
    sandals: false,
    mouth: false,
    hat: false,
  });

  const toggleAvatarEquip = (key: keyof typeof avatarEquip) => {
    setAvatarEquip((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const [following, setFollowing] = useState<Record<string, boolean>>(
    Object.fromEntries(MOCK_RANKING.map(r => [r.id, r.following]))
  );

  // Mock player stats
  const xp = 2340;
  const xpMax = 3000;
  const lives = 5;
  const livesMax = 5;
  const proCoins = 120; // paid
  const freeCoins = 850; // earned

  const handleNav = (key: HubSection) => {
    if (key === 'library') {
      onOpenLibrary();
      return;
    }
    setSection(key);
    setActiveQuestPack(null); // Reset sub-section when changing main section
  };

  const handleBack = () => {
    if (section === 'home') {
      onBack();
    } else if (section === 'quests' && activeQuestPack) {
      setActiveQuestPack(null);
    } else {
      setSection('home');
      setActiveQuestPack(null);
    }
  };

  const navItems: { key: HubSection; label: string; icon: typeof Home }[] = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'store', label: 'ProStore', icon: Store },
    { key: 'games', label: 'Jogos', icon: Gamepad2 },
    { key: 'library', label: 'Biblioteca', icon: Library },
    { key: 'quests', label: 'Quests', icon: Target },
    { key: 'proflix', label: 'ProFlix', icon: Film },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-yellow-300/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-pink-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-cyan-300/30 blur-3xl" />

      {/* TOP BAR — z acima do palco do avatar para não ser coberto */}
      <header className="relative z-30 px-4 md:px-8 pt-4 pb-2 shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: back + language */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-md rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            {section === 'home' && (
              <div className="px-4 py-2 rounded-full bg-white/15 backdrop-blur-md text-white font-semibold flex items-center gap-2">
                <span className="text-xl">🇺🇸</span>
                <span>{languageName}</span>
              </div>
            )}
          </div>

          {/* Center: stats */}
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <StatPill icon={<Zap className="w-4 h-4" />} value={`${xp} / ${xpMax}`} label="XP" color="from-amber-400 to-orange-500" />
            <StatPill icon={<Heart className="w-4 h-4 fill-current" />} value={`${lives}/${livesMax}`} label="Vidas" color="from-rose-500 to-red-500" />
            <StatPill icon={<Gem className="w-4 h-4" />} value={proCoins.toString()} label="ProCoins" color="from-cyan-400 to-blue-500" />
            <StatPill icon={<Coins className="w-4 h-4" />} value={freeCoins.toString()} label="Moedas" color="from-yellow-400 to-amber-500" />
          </div>

          {/* Right: profile + ranking button stacked */}
          {section !== 'quests' && (
            <div className="flex flex-col items-end gap-2">
              <Dialog open={avatarPickerOpen} onOpenChange={setAvatarPickerOpen}>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-3 bg-white/15 hover:bg-white/25 backdrop-blur-md transition rounded-full pl-2 pr-4 py-1.5 group">
                    <Avatar className="w-10 h-10 ring-2 ring-white/60 group-hover:ring-white">
                      <AvatarImage src={avatarUrl} alt={profileName} />
                      <AvatarFallback>{profileName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="text-xs text-white/70 leading-tight">Perfil</div>
                      <div className="text-sm font-semibold text-white leading-tight">{profileName}</div>
                    </div>
                    <Settings className="w-4 h-4 text-white/70 group-hover:text-white" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Personalizar perfil</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Nome do perfil</label>
                      <input
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Personalização visual do avatar disponível em ProStore.
                    </p>
                    <Button className="w-full" onClick={() => setAvatarPickerOpen(false)}>
                      Salvar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Ranking button (below profile) */}
              <button
                onClick={() => setRankingOpen(true)}
                className="flex items-center gap-3 bg-white/15 hover:bg-white/25 backdrop-blur-md transition rounded-full pl-2 pr-4 py-1.5 group w-full"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md ring-2 ring-white/60 group-hover:ring-white">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left leading-tight">
                  <div className="text-xs text-white/70">Sua posição</div>
                  <div className="text-sm font-bold text-white">Ranking · #42</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main
        className={cn(
          'relative z-10 px-4 md:px-8',
          section === 'home'
            ? 'pt-6 md:pt-8 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] md:pb-[calc(8.5rem+env(safe-area-inset-bottom,0px))]'
            : 'pt-4 pb-32'
        )}
      >
        {section === 'home' && (
          <div className="flex justify-center -translate-y-7 md:-translate-y-9">
            <div className="relative flex w-full max-w-3xl flex-col items-center gap-6 md:gap-8">
              <div className="relative z-0 flex w-full flex-col items-center justify-center pt-1">
                <AvatarCharacter equip={avatarEquip} size="hero" />
              </div>

              <Button
                size="lg"
                onClick={onOpenLibrary}
                className="shrink-0 bg-white text-foreground hover:bg-white/90 font-bold rounded-full px-8 shadow-xl"
              >
                Continuar estudando
              </Button>
            </div>
          </div>
        )}

        {section !== 'home' && (
          section === 'quests' ? (
            <QuestsHub openPack={activeQuestPack} onOpenPack={setActiveQuestPack} />
          ) : section === 'store' ? (
            <ProStoreSection equip={avatarEquip} onToggleEquip={toggleAvatarEquip} />
          ) : (
            <PlaceholderSection section={section} />
          )
        )}
      </main>

      {/* Ranking fullscreen modal */}
      <Dialog open={rankingOpen} onOpenChange={setRankingOpen}>
        <DialogContent className="max-w-none w-full h-screen p-0 rounded-none border-none overflow-y-auto flex flex-col">
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 md:p-10 shrink-0">
            <div className="flex items-center justify-between gap-4 text-white max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRankingOpen(false)}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Trophy className="w-6 h-6 md:w-8 md:h-8 text-amber-300 fill-amber-300" />
                </div>
                <div>
                  <DialogTitle className="text-2xl md:text-4xl font-extrabold text-white">Ranking</DialogTitle>
                  <p className="text-sm md:text-lg text-white/80">Melhores estudantes em {languageName}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-4xl mx-auto text-center">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl py-4 md:py-6 border border-white/10">
                <div className="text-3xl md:text-5xl font-extrabold text-white">#42</div>
                <div className="text-[10px] md:text-xs text-white/70 uppercase tracking-widest mt-1">Sua posição</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl py-4 md:py-6 border border-white/10">
                <div className="text-3xl md:text-5xl font-extrabold text-white">12</div>
                <div className="text-[10px] md:text-xs text-white/70 uppercase tracking-widest mt-1">Seguindo</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl py-4 md:py-6 border border-white/10">
                <div className="text-3xl md:text-5xl font-extrabold text-white">28</div>
                <div className="text-[10px] md:text-xs text-white/70 uppercase tracking-widest mt-1">Seguidores</div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-background p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-3">
              {MOCK_RANKING.map((p, i) => {
                const isFollowing = following[p.id];
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted transition"
                  >
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                        i === 0 && 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white',
                        i === 1 && 'bg-gradient-to-br from-slate-300 to-slate-400 text-white',
                        i === 2 && 'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
                        i > 2 && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {i + 1}
                    </div>
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={p.avatar} />
                      <AvatarFallback>{p.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-foreground truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Zap className="w-3 h-3" /> {p.xp.toLocaleString()} XP
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isFollowing ? 'secondary' : 'default'}
                      onClick={() =>
                        setFollowing((s) => ({ ...s, [p.id]: !s[p.id] }))
                      }
                      className="rounded-full"
                    >
                      {isFollowing ? (
                        <><UserCheck className="w-4 h-4 mr-1" /> Seguindo</>
                      ) : (
                        <><UserPlus className="w-4 h-4 mr-1" /> Seguir</>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white/95 dark:bg-card/95 backdrop-blur-xl shadow-2xl rounded-full px-2 py-2 flex items-center gap-1 border border-white/40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = section === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleNav(item.key)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 md:px-4 py-2 rounded-full transition-all',
                active
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold hidden md:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}

type AvatarEquipState = {
  shirt: boolean;
  shorts: boolean;
  sandals: boolean;
  mouth: boolean;
  hat: boolean;
};

/** Mesma caixa e posição para todas as camadas (viewBox 210×297): base inferior alinhada, sem folga de inline-img */
function avatarLayerClass() {
  return cn(
    'absolute inset-0 block h-full w-full object-contain object-bottom pointer-events-none select-none'
  );
}

function AvatarCharacter({
  equip,
  size = 'default',
  /** Na loja: sem flutuar — a animação movia o conjunto e dava sensação de itens “fora” do corpo */
  enableFloat = true,
}: {
  equip: AvatarEquipState;
  size?: 'default' | 'hero' | 'store';
  enableFloat?: boolean;
}) {
  const L = avatarLayerClass();

  const widthClass =
    size === 'hero'
      ? 'w-[13.5rem] sm:w-[15.5rem] md:w-[18.5rem] lg:w-[20.5rem]'
      : size === 'store'
        ? 'mx-auto w-[min(100%,11.5rem)] sm:w-[min(100%,13rem)] md:w-[min(100%,14.5rem)]'
        : 'w-64 md:w-80';

  return (
    <div
      className={cn(
        'relative leading-[0]',
        enableFloat && 'animate-[float_4s_ease-in-out_infinite]',
        widthClass
      )}
    >
      {/* viewBox dos SVGs ~ 210×297 (retrato) */}
      <div className="relative isolate aspect-[210/297] w-full overflow-visible">
        <img src={AVATAR_LAYERS.corpo} alt="" loading="lazy" className={L} aria-hidden />
        {equip.shorts && (
          <img src={AVATAR_LAYERS.short} alt="" loading="lazy" className={cn(L, 'z-[1]')} aria-hidden />
        )}
        {equip.shirt && (
          <img src={AVATAR_LAYERS.blusa} alt="" loading="lazy" className={cn(L, 'z-[2]')} aria-hidden />
        )}
        {equip.sandals && (
          <img src={AVATAR_LAYERS.sandalia} alt="" loading="lazy" className={cn(L, 'z-[3]')} aria-hidden />
        )}
        {equip.mouth && (
          <img src={AVATAR_LAYERS.boca} alt="" loading="lazy" className={cn(L, 'z-[4]')} aria-hidden />
        )}
        {equip.hat && (
          <img src={AVATAR_LAYERS.bone} alt="" loading="lazy" className={cn(L, 'z-[5]')} aria-hidden />
        )}
      </div>
    </div>
  );
}

const PRO_STORE_ROWS: {
  key: keyof AvatarEquipState;
  title: string;
  subtitle: string;
  thumb: string;
}[] = [
  {
    key: 'shirt',
    title: 'Blusa',
    subtitle: 'Camiseta colorida',
    thumb: AVATAR_LAYERS.blusa,
  },
  {
    key: 'shorts',
    title: 'Short',
    subtitle: 'Bermuda',
    thumb: AVATAR_LAYERS.short,
  },
  {
    key: 'sandals',
    title: 'Sandálias',
    subtitle: 'Calçado',
    thumb: AVATAR_LAYERS.sandalia,
  },
  {
    key: 'mouth',
    title: 'Boca',
    subtitle: 'Expressão / detalhe da boca',
    thumb: AVATAR_LAYERS.boca,
  },
  {
    key: 'hat',
    title: 'Boné',
    subtitle: 'Acessório de cabeça',
    thumb: AVATAR_LAYERS.bone,
  },
];

function ProStoreSection({
  equip,
  onToggleEquip,
}: {
  equip: AvatarEquipState;
  onToggleEquip: (key: keyof AvatarEquipState) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
      <Card className="bg-white/15 backdrop-blur-md border-white/20 p-6">
        <h3 className="text-white text-xl font-bold mb-1">Preview do Avatar</h3>
        <p className="text-white/70 text-sm mb-6">Veja como os itens ficam no personagem.</p>
        <div className="flex min-h-[min(42vh,20rem)] items-center justify-center px-1 py-6 sm:py-8">
          <AvatarCharacter equip={equip} size="store" enableFloat={false} />
        </div>
      </Card>

      <Card className="bg-white/15 backdrop-blur-md border-white/20 p-6">
        <h3 className="text-white text-xl font-bold mb-1">Loja de Itens</h3>
        <p className="text-white/70 text-sm mb-6">Escolha o item para adicionar ao avatar.</p>

        <div className="space-y-3 max-h-[min(60vh,28rem)] overflow-y-auto pr-1">
          {PRO_STORE_ROWS.map((row) => {
            const on = equip[row.key];
            return (
              <div
                key={row.key}
                className="rounded-2xl bg-black/20 border border-white/10 p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 shrink-0 rounded-xl bg-white/10 grid place-items-center overflow-hidden">
                    <img src={row.thumb} alt="" className="w-10 h-10 object-contain" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{row.title}</p>
                    <p className="text-white/70 text-xs">{row.subtitle}</p>
                  </div>
                </div>

                <Button
                  onClick={() => onToggleEquip(row.key)}
                  className={cn(
                    'rounded-full px-5 shrink-0',
                    on ? 'bg-white text-foreground hover:bg-white/90' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  )}
                >
                  {on ? 'Remover' : 'Equipar'}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function StatPill({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full pl-1 pr-3 py-1">
      <div className={cn('w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-white shadow-md', color)}>
        {icon}
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-white">{value}</div>
        <div className="text-[9px] uppercase tracking-wider text-white/70">{label}</div>
      </div>
    </div>
  );
}

function PlaceholderSection({ section }: { section: HubSection }) {
  const titles: Record<HubSection, { title: string; desc: string; icon: string }> = {
    home: { title: 'Home', desc: '', icon: '🏠' },
    store: { title: 'ProStore', desc: 'Compre itens, power-ups e personalizações para seu avatar.', icon: '🛍️' },
    games: { title: 'Jogos', desc: 'Jogos interativos para praticar inglês de forma divertida.', icon: '🎮' },
    library: { title: 'Biblioteca', desc: '', icon: '📚' },
    quests: { title: 'Quests Diárias', desc: 'Complete missões e ganhe XP e moedas.', icon: '🎯' },
    proflix: { title: 'ProFlix', desc: 'Vídeos e séries para aprender inglês assistindo.', icon: '🎬' },
  };
  const t = titles[section];
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="text-7xl mb-4">{t.icon}</div>
      <h2 className="text-3xl font-extrabold text-white drop-shadow-lg mb-2">{t.title}</h2>
      <p className="text-white/80 max-w-md">{t.desc}</p>
      <div className="mt-6 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md text-white text-sm">
        Em breve ✨
      </div>
    </div>
  );
}

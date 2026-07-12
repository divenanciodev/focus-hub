import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Shirt,
  Coins,
  Users,
  MessageCircle,
  Target,
  Film,
  Library,
  Gamepad2,
  Star,
  Bell,
  MessageSquare,
  Search,
  Mic,
  Heart,
  Trophy,
  UserPlus,
  UserCheck,
  Zap,
  Settings,
} from 'lucide-react';
import { QuestsHub } from './quests/QuestsHub';
import { LearnFlixView } from './LearnFlixView';
import { ChatRoomsView } from './ChatRoomsView';
import { BibliotecaView } from './BibliotecaView';

interface GameHubProps {
  languageName: string;
  onBack: () => void;
  onOpenLibrary: () => void;
}

type HubSection = 'home' | 'loja' | 'vestir' | 'moedas' | 'amigos' | 'batepapo' | 'quests' | 'learnflix' | 'biblioteca' | 'game';

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

type AvatarEquipState = {
  shirt: boolean;
  shorts: boolean;
  sandals: boolean;
  mouth: boolean;
  hat: boolean;
};

export function GameHub({ languageName, onBack, onOpenLibrary }: GameHubProps) {
  const [section, setSection] = useState<HubSection>('home');
  const [profileName, setProfileName] = useState('Estudante');
  const [avatarUrl] = useState<string>(BASE_AVATAR_URL);
  const [profileOpen, setProfileOpen] = useState(false);
  const [rankingOpen, setRankingOpen] = useState(false);
  const [activeQuestPack, setActiveQuestPack] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0); // for the home grid arrows (placeholder)
  const [avatarEquip, setAvatarEquip] = useState<AvatarEquipState>({
    shirt: true,
    shorts: true,
    sandals: true,
    mouth: true,
    hat: true,
  });

  const toggleAvatarEquip = (key: keyof AvatarEquipState) => {
    setAvatarEquip((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [following, setFollowing] = useState<Record<string, boolean>>(
    Object.fromEntries(MOCK_RANKING.map(r => [r.id, r.following]))
  );

  // Mock player stats
  const stars = 4;
  const xp = 570;
  const coins = 1500;

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

  const HOME_BUTTONS: { key: HubSection; label: string; Icon: typeof ShoppingCart }[] = [
    { key: 'loja', label: 'Loja', Icon: ShoppingCart },
    { key: 'vestir', label: 'Vestir', Icon: Shirt },
    { key: 'moedas', label: 'Moedas', Icon: Coins },
    { key: 'amigos', label: 'Amigos', Icon: Users },
    { key: 'batepapo', label: 'Bate-Papo', Icon: MessageCircle },
    { key: 'quests', label: 'Quests', Icon: Target },
    { key: 'learnflix', label: 'LearnFlix', Icon: Film },
    { key: 'biblioteca', label: 'Biblioteca', Icon: Library },
    { key: 'game', label: 'Game', Icon: Gamepad2 },
  ];

  const handleHomeButton = (key: HubSection) => {
    setSection(key);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* TOP BAR — purple gradient */}
      <header className="relative z-30 bg-gradient-to-r from-purple-500 via-purple-500 to-fuchsia-500 px-2 md:px-4 py-3 shadow-md">
        <div className="flex items-center justify-between gap-3 w-full">
          {/* Back — pushed to far left */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="bg-white hover:bg-white/90 text-purple-600 rounded-full shrink-0 h-11 w-11 shadow ml-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Centered stats */}
          <div className="flex items-center gap-2 md:gap-3 flex-1 justify-center flex-wrap">
            {/* XP / Star pill with progress */}
            <div className="flex items-center bg-white rounded-full pl-1 pr-3 py-1 shadow-sm">
              <div className="relative -ml-1">
                <Star className="w-7 h-7 fill-amber-400 text-amber-500 drop-shadow" />
              </div>
              <div className="ml-1 flex items-center bg-purple-600 rounded-full pl-2 pr-1 py-0.5 min-w-[90px]">
                <span className="text-white text-sm font-extrabold">{stars}</span>
                <div className="ml-2 flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '50%' }} />
                </div>
              </div>
            </div>

            {/* XP coin */}
            <div className="flex items-center gap-2 bg-white rounded-full pl-1 pr-4 py-1 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-extrabold text-white shadow">
                XP
              </div>
              <span className="text-purple-700 font-extrabold text-sm tabular-nums">
                {xp.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">XPs</span>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-2 bg-white rounded-full pl-1 pr-4 py-1 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-400 to-purple-500 flex items-center justify-center text-white font-extrabold text-xs shadow">
                M
              </div>
              <span className="text-purple-700 font-extrabold text-sm tabular-nums">
                {coins.toLocaleString('pt-BR')}
              </span>
              <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">moedas</span>
            </div>
          </div>

          {/* Right: notifications + avatar (only on home/loja) */}
          <div className="flex items-center gap-2 shrink-0">
            {section === 'home' && (
              <>
                <button className="w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-purple-600 shadow relative">
                  <MessageSquare className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">2</span>
                </button>
                <button className="w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-purple-600 shadow relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">5</span>
                </button>
              </>
            )}
            <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
              <DialogTrigger asChild>
                <button className="rounded-full ring-2 ring-white/80 hover:ring-white">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={avatarUrl} alt={profileName} />
                    <AvatarFallback>{profileName[0]}</AvatarFallback>
                  </Avatar>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Perfil</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Nome</label>
                    <input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                    />
                  </div>
                  <Button className="w-full" onClick={() => setProfileOpen(false)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => { setProfileOpen(false); setRankingOpen(true); }}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Ver Ranking · #42
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10">
        {section === 'home' && (
          <HomeView
            equip={avatarEquip}
            buttons={HOME_BUTTONS}
            onSelect={handleHomeButton}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
          />
        )}

        {section === 'loja' && (
          <LojaView equip={avatarEquip} onToggleEquip={toggleAvatarEquip} />
        )}

        {section === 'quests' && (
          <div className="px-4 md:px-8 py-8">
            <QuestsHub openPack={activeQuestPack} onOpenPack={setActiveQuestPack} />
          </div>
        )}

        {section === 'learnflix' && (
          <LearnFlixView languageName={languageName} />
        )}

        {section === 'biblioteca' && (
          <BibliotecaView languageName={languageName} />
        )}

        {section === 'batepapo' && (
          <ChatRoomsView languageName={languageName} />
        )}

        {section !== 'home' && section !== 'loja' && section !== 'quests' && section !== 'learnflix' && section !== 'batepapo' && section !== 'biblioteca' && (
          <PlaceholderSection section={section} />
        )}
      </main>

      {/* Ranking modal (kept) */}
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

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

/* ============================ HOME VIEW ============================ */

function HomeView({
  equip,
  buttons,
  onSelect,
  pageIndex,
  setPageIndex,
}: {
  equip: AvatarEquipState;
  buttons: { key: HubSection; label: string; Icon: typeof ShoppingCart }[];
  onSelect: (key: HubSection) => void;
  pageIndex: number;
  setPageIndex: (n: number) => void;
}) {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 min-h-[calc(100vh-72px)] flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-14 items-center justify-center">
        {/* Avatar preview */}
        <div className="flex justify-center shrink-0">
          <AvatarCharacter equip={equip} size="hero" />
        </div>

        {/* Buttons grid with arrows */}
        <div className="flex items-center gap-4 md:gap-6 justify-center">
          <button
            onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
            className="shrink-0 text-purple-500 hover:text-purple-700 transition"
            aria-label="Anterior"
          >
            <ArrowLeft className="w-12 h-12 md:w-14 md:h-14 stroke-[3]" />
          </button>

          <div className="grid grid-cols-3 gap-4 md:gap-5">
            {buttons.map((btn) => {
              const Icon = btn.Icon;
              return (
                <button
                  key={btn.key}
                  onClick={() => onSelect(btn.key)}
                  className="group relative w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-500 to-fuchsia-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col items-center justify-center gap-2 text-white"
                >
                  <Icon className="w-11 h-11 md:w-14 md:h-14" strokeWidth={2.2} />
                  <span className="text-sm md:text-base font-bold">{btn.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPageIndex(pageIndex + 1)}
            className="shrink-0 text-purple-500 hover:text-purple-700 transition"
            aria-label="Próximo"
          >
            <ArrowRight className="w-12 h-12 md:w-14 md:h-14 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ LOJA VIEW ============================ */

const LOJA_TABS = ['Vestindo', 'Tudo', 'camisas', 'Shorts', 'Tênis', 'Acessórios'] as const;
type LojaTab = typeof LOJA_TABS[number];

type LojaItem = {
  id: string;
  tab: Exclude<LojaTab, 'Tudo' | 'Vestindo'>;
  price: number;
  promoPrice?: number;
  equipKey: keyof AvatarEquipState;
  thumb: string;
};

const TAB_CONFIG: Record<Exclude<LojaTab, 'Tudo' | 'Vestindo'>, { equipKey: keyof AvatarEquipState; thumb: string }> = {
  camisas: { equipKey: 'shirt', thumb: AVATAR_LAYERS.blusa },
  Shorts: { equipKey: 'shorts', thumb: AVATAR_LAYERS.short },
  'Tênis': { equipKey: 'sandals', thumb: AVATAR_LAYERS.sandalia },
  'Acessórios': { equipKey: 'hat', thumb: AVATAR_LAYERS.bone },
};

// Generate 50 items per category for pagination demo
const LOJA_ITEMS: LojaItem[] = (Object.keys(TAB_CONFIG) as Array<keyof typeof TAB_CONFIG>).flatMap((cat) =>
  Array.from({ length: 50 }, (_, i) => ({
    id: `${cat}-${i + 1}`,
    tab: cat,
    price: 350 + ((i * 10) % 200),
    promoPrice: i % 4 === 1 ? 500 + (i % 5) * 50 : undefined,
    equipKey: TAB_CONFIG[cat].equipKey,
    thumb: TAB_CONFIG[cat].thumb,
  }))
);

function LojaView({
  equip,
  onToggleEquip,
}: {
  equip: AvatarEquipState;
  onToggleEquip: (key: keyof AvatarEquipState) => void;
}) {
  const [tab, setTab] = useState<LojaTab>('Shorts');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [cartCount, setCartCount] = useState(2);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 6;
  const filtered = tab === 'Tudo' || tab === 'Vestindo'
    ? LOJA_ITEMS
    : LOJA_ITEMS.filter(i => i.tab === tab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Build sliding window of page numbers (max 7 visible)
  const windowSize = 7;
  const start = Math.max(1, Math.min(safePage - 3, totalPages - windowSize + 1));
  const pageWindow = Array.from({ length: Math.min(windowSize, totalPages) }, (_, i) => start + i);

  return (
    <div className="px-4 md:px-8 py-4 h-[calc(100vh-72px)] overflow-hidden">
      <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)] gap-6">
        {/* Avatar preview panel — extends to bottom of viewport */}
        <Card className="bg-slate-100 dark:bg-slate-900 border-0 rounded-3xl p-4 md:p-6 flex items-end justify-center h-full overflow-hidden">
          <AvatarCharacter equip={equip} size="store" enableFloat={false} />
        </Card>

        {/* Catalog */}
        <div className="flex flex-col h-full min-h-0 gap-3">
          {/* Tabs row */}
          <div className="flex items-center gap-2 md:gap-3">
            <button className="text-purple-500 hover:text-purple-700 shrink-0">
              <ArrowLeft className="w-7 h-7 stroke-[3]" />
            </button>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1">
              {LOJA_TABS.map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setPage(1); }}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-bold border-2 whitespace-nowrap transition',
                    tab === t
                      ? 'bg-purple-600 text-white border-purple-600 shadow'
                      : 'bg-white text-purple-700 border-purple-200 hover:border-purple-400'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <button className="text-purple-500 hover:text-purple-700 shrink-0">
              <ArrowRight className="w-7 h-7 stroke-[3]" />
            </button>
          </div>

          {/* Search bar + favorites + cart */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-white dark:bg-card rounded-full px-4 py-2 border border-border shadow-sm">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Buscar..."
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <Mic className="w-4 h-4 text-muted-foreground" />
            </div>
            <button className="text-purple-600 hover:text-purple-800">
              <Heart className="w-7 h-7" />
            </button>
            <button className="relative text-purple-600 hover:text-purple-800">
              <ShoppingCart className="w-7 h-7" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Pagination indicator */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-semibold">
            <span>Catálogo {safePage}/{totalPages}</span>
            <button
              className="text-purple-500 disabled:opacity-30"
              disabled={safePage === 1}
              onClick={() => setPage(Math.max(1, safePage - 1))}
            >‹</button>
            {pageWindow.map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={cn(
                  'px-2 py-0.5 rounded font-bold',
                  safePage === n ? 'bg-purple-600 text-white' : 'text-purple-700 hover:bg-purple-100'
                )}
              >
                {n}
              </button>
            ))}
            <button
              className="text-purple-500 disabled:opacity-30"
              disabled={safePage === totalPages}
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
            >›</button>
          </div>

          {/* Items grid — 3 cols x 2 rows, fits without scroll */}
          <div className="grid grid-cols-3 grid-rows-2 gap-3 flex-1 min-h-0">
            {pageItems.map(item => {
              const equipped = equip[item.equipKey];
              const fav = favorites[item.id];
              return (
                <div
                  key={item.id}
                  className="rounded-xl border-2 border-purple-300 bg-white dark:bg-card overflow-hidden flex flex-col min-h-0"
                >
                  <div className="flex-1 min-h-0 bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-2">
                    <img src={item.thumb} alt="" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="px-2 py-1 flex items-center justify-end gap-2 text-[11px]">
                    {item.promoPrice && (
                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                        <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                        {item.promoPrice.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                    <span className="text-purple-700 font-extrabold">
                      ₩ {item.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="px-2 pb-2 flex items-center justify-between gap-1">
                    <button
                      onClick={() => setFavorites(f => ({ ...f, [item.id]: !f[item.id] }))}
                      className={cn(
                        'w-6 h-6 rounded-full border flex items-center justify-center transition shrink-0',
                        fav ? 'border-rose-500 text-rose-500 bg-rose-50' : 'border-purple-200 text-purple-400 hover:text-rose-500'
                      )}
                    >
                      <Heart className={cn('w-3 h-3', fav && 'fill-current')} />
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onToggleEquip(item.equipKey)}
                        className="px-2 py-0.5 rounded-md bg-white text-purple-700 text-[10px] font-extrabold border border-purple-200 hover:bg-purple-50"
                      >
                        {equipped ? 'Tirar' : 'Experimentar'}
                      </button>
                      <button
                        onClick={() => setCartCount(c => c + 1)}
                        className="px-2 py-0.5 rounded-md bg-amber-400 hover:bg-amber-500 text-white text-[10px] font-extrabold"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ AVATAR ============================ */

function avatarLayerClass() {
  return cn('absolute inset-0 block h-full w-full object-contain object-bottom pointer-events-none select-none');
}

function AvatarCharacter({
  equip,
  size = 'default',
  enableFloat = true,
}: {
  equip: AvatarEquipState;
  size?: 'default' | 'hero' | 'store';
  enableFloat?: boolean;
}) {
  const L = avatarLayerClass();
  // Force-disable floating animation — avatar must stay still so SVG layers
  // line up exactly when overlaid.
  void enableFloat;

  // hero  → home grid (bigger than before, but stays inline)
  // store → fills the preview card vertically without triggering scroll
  const sizeClass =
    size === 'hero'
      ? 'w-[18rem] sm:w-[20rem] md:w-[24rem] lg:w-[26rem]'
      : size === 'store'
        ? 'h-full aspect-[210/297] max-w-full mx-auto'
        : 'w-64 md:w-80';

  const innerClass =
    size === 'store'
      ? 'relative isolate h-full w-full overflow-visible'
      : 'relative isolate aspect-[210/297] w-full overflow-visible';

  return (
    <div className={cn('relative leading-[0] flex flex-col items-center justify-end', sizeClass)}>
      <div className={innerClass}>
        <img src={AVATAR_LAYERS.corpo} alt="" className={L} aria-hidden />
        {equip.shorts && <img src={AVATAR_LAYERS.short} alt="" className={cn(L, 'z-[1]')} aria-hidden />}
        {equip.shirt && <img src={AVATAR_LAYERS.blusa} alt="" className={cn(L, 'z-[2]')} aria-hidden />}
        {equip.sandals && <img src={AVATAR_LAYERS.sandalia} alt="" className={cn(L, 'z-[3]')} aria-hidden />}
        {equip.mouth && <img src={AVATAR_LAYERS.boca} alt="" className={cn(L, 'z-[4]')} aria-hidden />}
        {equip.hat && <img src={AVATAR_LAYERS.bone} alt="" className={cn(L, 'z-[5]')} aria-hidden />}

        {/* Ground shadow under the feet */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 bottom-[1%] w-[55%] h-[3.5%] rounded-[50%] bg-black/35 blur-md pointer-events-none"
        />
      </div>
    </div>
  );
}

/* ============================ PLACEHOLDER ============================ */

function PlaceholderSection({ section }: { section: HubSection }) {
  const titles: Partial<Record<HubSection, { title: string; desc: string; icon: string }>> = {
    vestir: { title: 'Vestir', desc: 'Combine roupas e acessórios já adquiridos.', icon: '👕' },
    moedas: { title: 'Moedas', desc: 'Compre e gerencie suas moedas.', icon: '🪙' },
    amigos: { title: 'Amigos', desc: 'Conecte-se com outros estudantes.', icon: '👥' },
    batepapo: { title: 'Bate-Papo', desc: 'Pratique conversação com outros usuários.', icon: '💬' },
    learnflix: { title: 'LearnFlix', desc: 'Vídeos e séries para aprender assistindo.', icon: '🎬' },
    biblioteca: { title: 'Biblioteca', desc: '', icon: '📚' },
    game: { title: 'Game', desc: 'Jogos interativos para praticar de forma divertida.', icon: '🎮' },
  };
  const t = titles[section] ?? { title: section, desc: '', icon: '✨' };
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="text-7xl mb-4">{t.icon}</div>
      <h2 className="text-3xl font-extrabold text-foreground mb-2">{t.title}</h2>
      <p className="text-muted-foreground max-w-md">{t.desc}</p>
      <div className="mt-6 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
        Em breve ✨
      </div>
    </div>
  );
}

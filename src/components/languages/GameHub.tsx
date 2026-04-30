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
import avatar3D from '@/assets/avatar-3d-placeholder.png';
import avatarDefault from '@/assets/avatar-profile-default.png';

interface GameHubProps {
  languageName: string;
  onBack: () => void;
  onOpenLibrary: () => void;
}

type HubSection = 'home' | 'store' | 'games' | 'library' | 'quests' | 'proflix';

const AVATAR_OPTIONS = [
  avatarDefault,
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Max',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Kai',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Mia',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Bot1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Bot2',
];

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
  const [avatarUrl, setAvatarUrl] = useState<string>(avatarDefault);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
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
    <div className="relative min-h-[calc(100vh-4rem)] -m-6 lg:-m-8 overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-yellow-300/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-pink-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-cyan-300/30 blur-3xl" />

      {/* TOP BAR */}
      <header className="relative z-10 px-4 md:px-8 pt-4 pb-2">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: back + language */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-md rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="px-4 py-2 rounded-full bg-white/15 backdrop-blur-md text-white font-semibold flex items-center gap-2">
              <span className="text-xl">🇺🇸</span>
              <span>{languageName}</span>
            </div>
          </div>

          {/* Center: stats */}
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <StatPill icon={<Zap className="w-4 h-4" />} value={`${xp} / ${xpMax}`} label="XP" color="from-amber-400 to-orange-500" />
            <StatPill icon={<Heart className="w-4 h-4 fill-current" />} value={`${lives}/${livesMax}`} label="Vidas" color="from-rose-500 to-red-500" />
            <StatPill icon={<Gem className="w-4 h-4" />} value={proCoins.toString()} label="ProCoins" color="from-cyan-400 to-blue-500" />
            <StatPill icon={<Coins className="w-4 h-4" />} value={freeCoins.toString()} label="Moedas" color="from-yellow-400 to-amber-500" />
          </div>

          {/* Right: profile */}
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
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Escolha um avatar</p>
                  <div className="grid grid-cols-4 gap-3">
                    {AVATAR_OPTIONS.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setAvatarUrl(url)}
                        className={cn(
                          'rounded-full overflow-hidden border-2 transition aspect-square',
                          avatarUrl === url ? 'border-primary ring-2 ring-primary/40' : 'border-border hover:border-foreground/40'
                        )}
                      >
                        <img src={url} alt={`avatar ${i}`} className="w-full h-full object-cover bg-muted" />
                      </button>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={() => setAvatarPickerOpen(false)}>
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 px-4 md:px-8 pb-32 pt-4">
        {section === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            {/* Avatar stage */}
            <div className="relative flex flex-col items-center justify-center min-h-[60vh]">
              {/* Welcome */}
              <div className="text-center mb-4 animate-fade-in">
                <h2 className="text-white/80 text-lg">Bem-vindo de volta,</h2>
                <h1 className="text-white text-4xl md:text-5xl font-extrabold drop-shadow-lg">
                  {profileName}!
                </h1>
              </div>

              {/* Avatar name tag */}
              <div className="relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-foreground font-bold text-sm shadow-lg whitespace-nowrap">
                  {profileName}
                </div>

                {/* Floating platform shadow */}
                <div className="relative">
                  <img
                    src={avatar3D}
                    alt="Avatar 3D"
                    width={768}
                    height={1024}
                    loading="lazy"
                    className="w-64 md:w-80 h-auto drop-shadow-2xl animate-[float_4s_ease-in-out_infinite]"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 h-6 bg-black/30 rounded-full blur-md" />
                </div>
              </div>

              {/* Quick action */}
              <Button
                size="lg"
                onClick={onOpenLibrary}
                className="mt-8 bg-white text-foreground hover:bg-white/90 font-bold rounded-full px-8 shadow-xl"
              >
                Continuar estudando
              </Button>
            </div>

            {/* Ranking */}
            <Card className="bg-white/95 dark:bg-card/95 backdrop-blur-md border-white/40 shadow-2xl rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Ranking</h3>
                    <p className="text-xs text-muted-foreground">Melhores em {languageName}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {MOCK_RANKING.map((p, i) => {
                  const isFollowing = following[p.id];
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition"
                    >
                      <div
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                          i === 0 && 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white',
                          i === 1 && 'bg-gradient-to-br from-slate-300 to-slate-400 text-white',
                          i === 2 && 'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
                          i > 2 && 'bg-muted text-muted-foreground'
                        )}
                      >
                        {i + 1}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={p.avatar} />
                        <AvatarFallback>{p.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">{p.name}</div>
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
                        className="h-8 px-2 rounded-full"
                      >
                        {isFollowing ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-foreground">#42</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Sua pos.</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">12</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Seguindo</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">28</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Seguidores</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {section !== 'home' && (
          <PlaceholderSection section={section} />
        )}
      </main>

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

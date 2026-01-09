import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { mockUserProfile } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Mail,
  Calendar,
  Sun,
  Moon,
  Bell,
  Volume2,
  Clock,
  Shield,
  Palette,
  Globe,
  Save,
  LogOut,
  Camera,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

export default function Perfil() {
  const profile = mockUserProfile;
  const { theme, setTheme } = useTheme();
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [pomodoroTime, setPomodoroTime] = useState('25');
  const [language, setLanguage] = useState('pt-BR');
  
  // Profile edit state
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSaveProfile = () => {
    toast.success('Perfil atualizado com sucesso!');
  };

  const handleSaveSettings = () => {
    toast.success('Configurações salvas!');
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Meu Perfil"
        description="Gerencie seu perfil e configurações"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary text-primary-foreground text-3xl font-bold">
                  {name.charAt(0)}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-secondary rounded-full border border-border hover:bg-secondary/80 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">{name}</h2>
              <p className="text-sm text-muted-foreground mb-3">{email}</p>
              <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1 rounded-full">
                <Calendar className="w-3 h-3" />
                Membro desde {formatDate(profile.joinedAt)}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-xl p-4">
            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sair da conta
            </Button>
          </div>
        </div>

        {/* Settings Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-foreground" />
              <h3 className="font-semibold text-foreground">Informações Pessoais</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveProfile} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Salvar alterações
              </Button>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Palette className="w-5 h-5 text-foreground" />
              <h3 className="font-semibold text-foreground">Aparência</h3>
            </div>
            
            <div className="space-y-6">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">Tema</p>
                    <p className="text-sm text-muted-foreground">
                      {theme === 'dark' ? 'Modo escuro ativado' : 'Modo claro ativado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-2 rounded-md transition-colors ${
                      theme === 'light' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-2 rounded-md transition-colors ${
                      theme === 'dark' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Idioma</p>
                    <p className="text-sm text-muted-foreground">Idioma da interface</p>
                  </div>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (BR)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-foreground" />
              <h3 className="font-semibold text-foreground">Notificações</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Notificações push</p>
                    <p className="text-sm text-muted-foreground">Receber alertas no navegador</p>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Notificações por e-mail</p>
                    <p className="text-sm text-muted-foreground">Resumos e lembretes por e-mail</p>
                  </div>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Efeitos sonoros</p>
                    <p className="text-sm text-muted-foreground">Sons ao completar ações</p>
                  </div>
                </div>
                <Switch checked={soundEffects} onCheckedChange={setSoundEffects} />
              </div>
            </div>
          </div>

          {/* Study Preferences */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-foreground" />
              <h3 className="font-semibold text-foreground">Preferências de Estudo</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Tempo do Pomodoro</p>
                    <p className="text-sm text-muted-foreground">Duração de cada sessão de foco</p>
                  </div>
                </div>
                <Select value={pomodoroTime} onValueChange={setPomodoroTime}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="25">25 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Save className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Salvamento automático</p>
                    <p className="text-sm text-muted-foreground">Salvar progresso automaticamente</p>
                  </div>
                </div>
                <Switch checked={autoSave} onCheckedChange={setAutoSave} />
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-foreground" />
              <h3 className="font-semibold text-foreground">Privacidade e Segurança</h3>
            </div>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Alterar senha
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Gerenciar dados
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                Excluir conta
              </Button>
            </div>
          </div>

          {/* Save All Settings */}
          <Button onClick={handleSaveSettings} size="lg" className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Salvar todas as configurações
          </Button>
        </div>
      </div>
    </div>
  );
}

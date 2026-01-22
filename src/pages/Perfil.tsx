import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { useUserSettings } from '@/hooks/useUserSettings';
import { TrashSection } from '@/components/profile/TrashSection';
import { useAuth } from '@/hooks/useAuth';
import { useUsers, UserWithRole } from '@/hooks/useUsers';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
  Loader2,
  Key,
  Users,
  Trash2,
  Crown,
  UserCheck,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Perfil() {
  const navigate = useNavigate();
  const { settings, loading, updateSettings } = useUserSettings();
  const { user, profile, isAdmin, signOut, updatePassword, updateProfile, loading: authLoading } = useAuth();
  const { users, loading: usersLoading, updateUserRole, deleteUser, createUser } = useUsers();
  const { theme, setTheme } = useTheme();
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [pomodoroTime, setPomodoroTime] = useState('25');
  const [language, setLanguage] = useState('pt-BR');
  
  // Profile edit state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password change modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Data management modal
  const [dataModalOpen, setDataModalOpen] = useState(false);

  // Delete account modal
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);

  // Create user modal
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');
  const [createUserLoading, setCreateUserLoading] = useState(false);

  // Sync state with profile and settings
  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '');
      setEmail(profile.email);
    }
  }, [profile]);

  useEffect(() => {
    if (settings) {
      setNotifications(settings.notificationsEnabled);
      setEmailNotifications(settings.emailNotifications);
      setSoundEffects(settings.soundEffects);
      setAutoSave(settings.autoSave);
      setPomodoroTime(settings.pomodoroTime.toString());
      setLanguage(settings.language);
      if (settings.theme) {
        setTheme(settings.theme);
      }
    }
  }, [settings, setTheme]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSaveProfile = async () => {
    const { error } = await updateProfile({ full_name: name });
    if (error) {
      toast.error('Erro ao atualizar perfil');
    } else {
      toast.success('Perfil atualizado com sucesso!');
    }
  };

  const handleSaveSettings = async () => {
    await updateSettings({
      notificationsEnabled: notifications,
      emailNotifications: emailNotifications,
      soundEffects: soundEffects,
      autoSave: autoSave,
      pomodoroTime: parseInt(pomodoroTime),
      language: language,
      theme: theme || 'dark',
    });
    toast.success('Configurações salvas!');
  };

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    await updateSettings({ theme: newTheme });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setPasswordLoading(true);
    const { error } = await updatePassword(newPassword);
    setPasswordLoading(false);

    if (error) {
      toast.error('Erro ao alterar senha');
    } else {
      toast.success('Senha alterada com sucesso!');
      setPasswordModalOpen(false);
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast.error('Email e senha são obrigatórios');
      return;
    }
    if (newUserPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setCreateUserLoading(true);
    const { error } = await createUser(newUserEmail, newUserPassword, newUserName, newUserRole);
    setCreateUserLoading(false);

    if (!error) {
      setCreateUserModalOpen(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserRole('user');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
                  {name?.charAt(0) || email?.charAt(0) || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-secondary rounded-full border border-border hover:bg-secondary/80 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">{name || 'Usuário'}</h2>
              <p className="text-sm text-muted-foreground mb-2">{email}</p>
              {isAdmin && (
                <Badge className="mb-3 bg-amber-500/20 text-amber-500 border-amber-500/30">
                  <Crown className="w-3 h-3 mr-1" />
                  Administrador
                </Badge>
              )}
              {profile?.created_at && (
                <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  <Calendar className="w-3 h-3" />
                  Membro desde {formatDate(profile.created_at)}
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-xl p-4">
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
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
                    disabled
                    className="bg-muted"
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
                    onClick={() => handleThemeChange('light')}
                    className={`p-2 rounded-md transition-colors ${
                      theme === 'light' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
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
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setPasswordModalOpen(true)}
              >
                <Key className="w-4 h-4 mr-2" />
                Alterar senha
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setDataModalOpen(true)}
              >
                <User className="w-4 h-4 mr-2" />
                Gerenciar dados
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => setDeleteAccountModalOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir conta
              </Button>
            </div>
          </div>

          {/* User Management (Admin Only) */}
          {isAdmin && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-foreground" />
                  <h3 className="font-semibold text-foreground">Gerenciar Usuários</h3>
                  <Badge className="ml-2 bg-amber-500/20 text-amber-500 border-amber-500/30">Admin</Badge>
                </div>
                <Button onClick={() => setCreateUserModalOpen(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Usuário
                </Button>
              </div>

              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum usuário encontrado</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Papel</TableHead>
                        <TableHead>Membro desde</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                                {u.full_name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                              </div>
                              {u.full_name || 'Sem nome'}
                            </div>
                          </TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Select
                              value={u.role}
                              onValueChange={(value) => updateUserRole(u.id, value as 'admin' | 'user')}
                              disabled={u.id === user?.id}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">
                                  <div className="flex items-center gap-2">
                                    <Crown className="w-3 h-3" />
                                    Admin
                                  </div>
                                </SelectItem>
                                <SelectItem value="user">
                                  <div className="flex items-center gap-2">
                                    <UserCheck className="w-3 h-3" />
                                    Usuário
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{formatDate(u.created_at)}</TableCell>
                          <TableCell className="text-right">
                            {u.id !== user?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deleteUser(u.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* Trash Section */}
          <TrashSection />

          {/* Save All Settings */}
          <Button onClick={handleSaveSettings} size="lg" className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Salvar todas as configurações
          </Button>
        </div>
      </div>

      {/* Change Password Modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirmar nova senha</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} disabled={passwordLoading}>
              {passwordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Alterando...
                </>
              ) : (
                'Alterar senha'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Management Modal */}
      <Dialog open={dataModalOpen} onOpenChange={setDataModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Dados</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-muted-foreground">
              Aqui você pode gerenciar seus dados pessoais armazenados na plataforma.
            </p>
            <div className="space-y-2">
              <h4 className="font-medium">Dados armazenados:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Perfil (nome, email)</li>
                <li>Disciplinas e progresso de estudos</li>
                <li>Objetivos e metas</li>
                <li>Links salvos</li>
                <li>Registros financeiros</li>
                <li>Hábitos e cronogramas</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Para solicitar a exportação ou exclusão de seus dados, entre em contato com o suporte.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setDataModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={deleteAccountModalOpen} onOpenChange={setDeleteAccountModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Excluir Conta
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-muted-foreground">
              Esta ação é <strong>irreversível</strong>. Todos os seus dados serão permanentemente excluídos.
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive">
                Ao excluir sua conta, você perderá:
              </p>
              <ul className="list-disc list-inside text-sm text-destructive mt-2 space-y-1">
                <li>Todas as disciplinas e progresso</li>
                <li>Objetivos e metas</li>
                <li>Links e pastas</li>
                <li>Registros financeiros</li>
                <li>Configurações personalizadas</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAccountModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive">
              Confirmar exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Modal */}
      <Dialog open={createUserModalOpen} onOpenChange={setCreateUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-user-name">Nome completo</Label>
              <Input
                id="new-user-name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Nome do usuário"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-email">Email *</Label>
              <Input
                id="new-user-email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-password">Senha *</Label>
              <Input
                id="new-user-password"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-role">Papel</Label>
              <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as 'admin' | 'user')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3 h-3" />
                      Usuário
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Crown className="w-3 h-3" />
                      Administrador
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateUserModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={createUserLoading}>
              {createUserLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar usuário'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

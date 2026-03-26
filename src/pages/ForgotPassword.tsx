import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, Zap, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast.error('Erro ao enviar email de recuperação');
    } else {
      setSent(true);
      toast.success('Email de recuperação enviado!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground leading-tight">PRODUTIVIDADE</h1>
              <p className="text-sm text-muted-foreground -mt-1">MÁXIMA</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-center mb-2">Recuperar Senha</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {sent
              ? 'Verifique seu email para o link de redefinição de senha.'
              : 'Digite seu email para receber um link de recuperação.'}
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar link de recuperação'
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Se o email estiver cadastrado, você receberá um link para redefinir sua senha.
              </p>
              <Button variant="outline" onClick={() => setSent(false)} className="w-full">
                Enviar novamente
              </Button>
            </div>
          )}

          <Link
            to="/auth"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}

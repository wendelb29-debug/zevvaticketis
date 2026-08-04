import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useUI } from '@/hooks/use-ui';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { openOverlay } = useUI();

  useEffect(() => {
    openOverlay('auth', 'login');
    navigate({ to: '/' });
  }, []);

  return null;
}

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Login realizado com sucesso!');
      navigate({ to: '/' });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(`Erro ao entrar com ${provider}`);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-inter">
      {/* Left Panel - Hidden on small screens (< 860px) */}
      <div className="hidden min-[860px]:flex w-[40%] bg-gradient-to-br from-navy to-[#241f3a] p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Decorative symbol */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-gold/10 rounded-full blur-[100px]" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-20 group">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center font-manrope font-black text-navy text-2xl group-hover:scale-110 transition-transform">
              Z
            </div>
            <span className="text-2xl font-manrope font-black tracking-tight">Zevva <span className="text-gold">Tickets</span></span>
          </Link>

          <div className="space-y-6">
            <h1 className="text-5xl font-manrope font-extrabold leading-tight">
              Bem-vindo à <br />
              <span className="text-gold">nova era</span> de eventos.
            </h1>
            <p className="text-xl text-white/70 font-medium max-w-md">
              Acesse sua conta para gerenciar seus ingressos, caravanas e experiências internacionais.
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-auto">
          <div className="flex flex-col gap-4 max-w-sm">
            <Quote className="w-8 h-8 text-gold/40" />
            <p className="text-lg italic font-medium text-white/80">
              "Tudo o que fizerem, façam de todo o coração, como para o Senhor."
            </p>
            <span className="text-gold font-bold text-sm uppercase tracking-widest">— Colossenses 3:23</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col p-6 sm:p-12 relative">
        <Button 
          variant="ghost" 
          className="absolute top-8 left-8 text-navy font-bold hover:bg-surface rounded-xl flex items-center gap-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>

        <div className="m-auto w-full max-w-[400px] space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-manrope font-extrabold text-navy">Acesse sua conta</h2>
            <p className="text-muted font-medium">Bem-vindo de volta! Por favor, insira seus dados.</p>
          </div>

          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full h-14 rounded-[14px] border-slate-200 hover:bg-slate-50 font-bold text-navy flex items-center justify-center gap-3 transition-all"
              onClick={() => handleSocialLogin('google')}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continuar com Google
            </Button>
            
            <Button 
              className="w-full h-14 rounded-[14px] bg-navy hover:bg-[#1a2035] text-white font-bold flex items-center justify-center gap-3 transition-all"
              onClick={() => handleSocialLogin('apple')}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
              Continuar com Apple
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-muted-foreground font-bold tracking-widest">ou com e-mail</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-navy font-bold text-sm">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="email" 
                    placeholder="exemplo@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-12 rounded-[12px] border-slate-200 focus:border-gold focus:ring-gold/20 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-navy font-bold text-sm">Senha</Label>
                  <Link to="/" className="text-gold font-bold text-sm hover:underline">Esqueci a senha</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-12 rounded-[12px] border-slate-200 focus:border-gold focus:ring-gold/20 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" className="rounded-md border-slate-300 data-[state=checked]:bg-navy data-[state=checked]:border-navy" />
              <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer">Manter conectado</label>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 rounded-[14px] bg-gradient-to-r from-gold-bright to-gold text-white font-black uppercase tracking-widest shadow-lg shadow-gold/20 hover:opacity-90 transition-all border-0"
            >
              {loading ? 'Entrando...' : 'Entrar na minha conta'}
            </Button>
          </form>

          <p className="text-center text-slate-500 font-medium">
            Não tem uma conta? <Link to="/cadastro" className="text-gold font-bold hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

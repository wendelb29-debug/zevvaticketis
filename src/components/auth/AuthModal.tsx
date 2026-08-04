import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Mail, ArrowLeft, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = "options" | "email_login" | "forgot_password";

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<AuthView>("options");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setView("options");
      setEmail("");
      password && setPassword("");
      setLoading(false);
    }
  }, [isOpen]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Senha incorreta ou usuário não encontrado.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Login realizado com sucesso.");
      
      // Get user profile to determine redirect
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      // Also check organization membership for producer role
      const { data: member } = await supabase
        .from("organization_members")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      if (member) {
        navigate({ to: "/produtor" });
      } else {
        navigate({ to: "/app" });
      }
      onClose();
    } catch (err: any) {
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(`Erro ao entrar com ${provider}: ${err.message}`);
      setLoading(false);
    }
  };

  const renderOptions = () => (
    <div className="space-y-4 pt-4">
      <Button 
        variant="outline" 
        className="w-full h-12 justify-start px-6 rounded-[12px] border-2 border-line hover:border-gold/50 hover:bg-surface transition-all font-bold text-navy"
        onClick={() => setView("email_login")}
        disabled={loading}
      >
        <Mail className="mr-3 w-5 h-5 text-muted" />
        Continuar com e-mail e senha
      </Button>

      <Button 
        variant="outline" 
        className="w-full h-12 justify-start px-6 rounded-[12px] border-2 border-line hover:border-gold/50 hover:bg-surface transition-all font-bold text-navy"
        onClick={() => handleOAuthLogin('google')}
        disabled={loading}
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="mr-3 w-5 h-5" alt="Google" />
        Continuar com Google
      </Button>

      <Button 
        variant="outline" 
        className="w-full h-12 justify-start px-6 rounded-[12px] border-2 border-line hover:border-gold/50 hover:bg-surface transition-all font-bold text-navy"
        onClick={() => handleOAuthLogin('apple')}
        disabled={loading}
      >
        <svg className="mr-3 w-5 h-5 fill-current" viewBox="0 0 384 512">
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
        </svg>
        Continuar com Apple
      </Button>

      <div className="pt-4 text-center">
        <p className="text-sm text-muted">
          Não possui uma conta? <button onClick={() => navigate({to: '/cadastro'})} className="text-gold font-bold hover:underline">Cadastre-se</button>
        </p>
      </div>
    </div>
  );

  const renderEmailLogin = () => (
    <form onSubmit={handleEmailLogin} className="space-y-4 pt-4">
      <div className="flex items-center mb-2">
        <button 
          type="button" 
          onClick={() => setView("options")}
          className="p-1 -ml-1 hover:bg-surface rounded-full transition-colors text-muted hover:text-navy"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="ml-2 text-sm font-bold text-navy">Voltar</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="exemplo@email.com" 
          className="h-12 border-line rounded-[12px] bg-surface/50 focus:bg-white transition-all"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Senha</Label>
          <button 
            type="button" 
            onClick={() => setView("forgot_password")}
            className="text-xs text-gold font-bold hover:underline"
          >
            Esqueci minha senha
          </button>
        </div>
        <div className="relative">
          <Input 
            id="password" 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••"
            className="h-12 border-line rounded-[12px] bg-surface/50 focus:bg-white transition-all pr-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-navy transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2 py-2">
        <Checkbox 
          id="remember" 
          checked={rememberMe} 
          onCheckedChange={(checked) => setRememberMe(!!checked)}
          className="rounded-[4px] border-line data-[state=checked]:bg-gold data-[state=checked]:border-gold" 
        />
        <label htmlFor="remember" className="text-sm font-medium leading-none text-navy">
          Manter conectado
        </label>
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 bg-gradient-to-r from-gold-bright to-gold hover:opacity-90 text-white font-bold rounded-[12px] shadow-[0_4px_12px_rgba(201,154,62,0.25)] border-0"
        disabled={loading}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Entrar na conta"}
      </Button>
    </form>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] p-8 rounded-[20px] bg-white border-0 shadow-2xl backdrop-blur-xl">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-2xl font-heading font-extrabold text-navy">
            Crie sua conta ou faça login
          </DialogTitle>
          <DialogDescription className="text-muted font-medium">
            Para se inscrever em eventos e gerenciar suas reservas, acesse sua conta.
          </DialogDescription>
        </DialogHeader>

        {view === "options" && renderOptions()}
        {view === "email_login" && renderEmailLogin()}
        {view === "forgot_password" && (
          <div className="pt-4 space-y-4">
            <button 
              onClick={() => setView("email_login")}
              className="flex items-center text-sm font-bold text-navy hover:text-gold transition-colors"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
            </button>
            <p className="text-sm text-muted">Funcionalidade de recuperação de senha em breve.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

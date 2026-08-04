import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Apple, Ticket, Store, ChevronRight, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'register'>(defaultView);
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'participante' | 'produtor' | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmailFields, setShowEmailFields] = useState(false);
  const navigate = useNavigate();

  // Registration Form State
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    senha: '',
    orgNome: '',
    orgDocumento: '',
    paisId: '',
    aceiteTermos: false
  });

  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    setView(defaultView);
    setStep(1);
    setShowEmailFields(false);
  }, [defaultView, isOpen]);

  useEffect(() => {
    if (view === 'register' && step === 2) {
      async function fetchCountries() {
        const { data } = await supabase.from('countries').select('*').order('name');
        if (data) setCountries(data);
      }
      fetchCountries();
    }
  }, [view, step]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: formData.email, 
        password: formData.senha 
      });
      if (error) throw error;
      toast.success('Login realizado com sucesso!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.aceiteTermos) {
      toast.error('Você precisa aceitar os termos de uso.');
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: {
          data: {
            nome: `${formData.nome} ${formData.sobrenome}`,
            role: role
          }
        }
      });

      if (authError) throw authError;

      if (role === 'produtor' && authData.user) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            nome: formData.orgNome,
            documento: formData.orgDocumento,
            pais_id: formData.paisId || null,
            status: 'pendente'
          })
          .select()
          .single();

        if (orgError) throw orgError;

        await supabase.from('organization_members').insert({
          organization_id: orgData.id,
          user_id: authData.user.id,
          role: 'produtor_owner'
        });

        toast.success('Cadastro enviado para aprovação!');
        navigate({ to: '/produtor-pendente' });
      } else {
        toast.success('Conta criada com sucesso!');
        navigate({ to: '/app' });
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar cadastro');
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] p-0 rounded-[24px] bg-white border-0 shadow-2xl overflow-hidden">
        <div className="p-8 space-y-6 max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-2xl font-manrope font-extrabold text-navy text-center">
            {view === 'login' ? "Que bom ter você aqui!" : (step === 1 ? "Como quer usar a Zevva?" : "Crie sua conta")}
          </DialogTitle>

          {view === 'login' ? (
            <div className="space-y-4">
              <Button 
                variant="outline" 
                onClick={() => handleSocialLogin('google')}
                className="w-full justify-start gap-4 h-14 rounded-[16px] border-line font-extrabold text-navy hover:bg-surface transition-all group"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Continuar com Google
              </Button>

              <Button 
                variant="outline" 
                onClick={() => handleSocialLogin('apple')}
                className="w-full justify-start gap-4 h-14 rounded-[16px] bg-navy text-white hover:bg-navy/90 border-navy font-extrabold transition-all"
              >
                <Apple className="w-5 h-5 fill-current" />
                Continuar com Apple
              </Button>

              {!showEmailFields ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowEmailFields(true)}
                  className="w-full justify-start gap-4 h-14 rounded-[16px] border-line font-extrabold text-navy hover:bg-surface transition-all"
                >
                  <Mail className="w-5 h-5 text-muted" />
                  Continuar com e-mail
                </Button>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                  <Input 
                    placeholder="Seu e-mail" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="h-12 rounded-[14px] border-line focus:ring-coral"
                  />
                  <Input 
                    type="password" 
                    placeholder="Sua senha" 
                    value={formData.senha} 
                    onChange={(e) => setFormData({...formData, senha: e.target.value})} 
                    className="h-12 rounded-[14px] border-line focus:ring-coral"
                  />
                  <Button disabled={loading} className="w-full h-14 rounded-[16px] bg-coral hover:bg-coral-dark font-extrabold text-white shadow-lg shadow-coral/20">
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                  <button type="button" onClick={() => setShowEmailFields(false)} className="w-full text-center text-xs font-bold text-muted hover:text-navy py-1">
                    Voltar para opções sociais
                  </button>
                </form>
              )}
            </div>
          ) : step === 1 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setRole('participante')}
                  className={cn(
                    "flex flex-col items-center p-6 rounded-[20px] border-2 transition-all space-y-4 text-center",
                    role === 'participante' ? "border-coral bg-coral/5" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", role === 'participante' ? "bg-coral text-white" : "bg-slate-50 text-slate-400")}>
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy text-sm">Participante</h3>
                    <p className="text-[10px] text-slate-500">Quero comprar</p>
                  </div>
                </button>
                <button 
                  onClick={() => setRole('produtor')}
                  className={cn(
                    "flex flex-col items-center p-6 rounded-[20px] border-2 transition-all space-y-4 text-center",
                    role === 'produtor' ? "border-coral bg-coral/5" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", role === 'produtor' ? "bg-navy text-white" : "bg-slate-50 text-slate-400")}>
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy text-sm">Produtor</h3>
                    <p className="text-[10px] text-slate-500">Quero vender</p>
                  </div>
                </button>
              </div>
              <Button 
                onClick={() => role ? setStep(2) : toast.error('Selecione seu perfil')}
                className="w-full h-14 rounded-[16px] bg-navy text-white font-bold flex items-center justify-center gap-2 group"
              >
                Próximo passo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} className="h-11 rounded-[12px] border-line" required />
                <Input placeholder="Sobrenome" value={formData.sobrenome} onChange={(e) => setFormData({...formData, sobrenome: e.target.value})} className="h-11 rounded-[12px] border-line" required />
              </div>
              <Input type="email" placeholder="E-mail" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-11 rounded-[12px] border-line" required />
              <Input type="password" placeholder="Senha" value={formData.senha} onChange={(e) => setFormData({...formData, senha: e.target.value})} className="h-11 rounded-[12px] border-line" required />

              {role === 'produtor' && (
                <div className="space-y-4 pt-4 border-t border-line">
                  <div className="bg-coral/5 p-3 rounded-xl flex gap-3">
                    <ShieldCheck className="w-4 h-4 text-coral shrink-0 mt-0.5" />
                    <p className="text-[10px] text-coral-dark font-medium">Sua organização passará por aprovação.</p>
                  </div>
                  <Input placeholder="Nome da Organização" value={formData.orgNome} onChange={(e) => setFormData({...formData, orgNome: e.target.value})} className="h-11 rounded-[12px] border-line" required />
                  <div className="grid grid-cols-2 gap-3">
                    <select value={formData.paisId} onChange={(e) => setFormData({...formData, paisId: e.target.value})} className="h-11 rounded-[12px] border-line bg-white border px-3 text-sm" required>
                      <option value="">País...</option>
                      {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <Input placeholder="Documento" value={formData.orgDocumento} onChange={(e) => setFormData({...formData, orgDocumento: e.target.value})} className="h-11 rounded-[12px] border-line" required />
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox id="terms" checked={formData.aceiteTermos} onCheckedChange={(c) => setFormData({...formData, aceiteTermos: c as boolean})} className="mt-1" />
                <label htmlFor="terms" className="text-[10px] text-muted leading-tight">
                  Concordo com os Termos e Privacidade.
                </label>
              </div>

              <Button disabled={loading} className="w-full h-14 rounded-[16px] bg-coral hover:bg-coral-dark text-white font-extrabold uppercase tracking-widest shadow-lg shadow-coral/20">
                {loading ? "Processando..." : (role === 'produtor' ? "Solicitar Aprovação" : "Criar Conta")}
              </Button>
            </form>
          )}

          <p className="text-[11px] text-center text-muted font-medium leading-relaxed">
            Ao entrar, concordo com os <a href="#" className="underline hover:text-navy">Termos de Uso</a> e <a href="#" className="underline hover:text-navy">Política de Privacidade</a>.
          </p>
        </div>

        <div className="bg-surface/50 p-6 border-t border-line text-center">
          <p className="text-sm font-bold text-navy">
            {view === 'login' ? "Não tem conta? " : "Já tem conta? "}
            <button 
              onClick={() => {
                setView(view === 'login' ? 'register' : 'login');
                setStep(1);
              }}
              className="text-coral hover:text-coral-dark underline decoration-2 underline-offset-4"
            >
              {view === 'login' ? "Cadastre-se" : "Entrar"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

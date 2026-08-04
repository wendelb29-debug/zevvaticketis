import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cadastro")({
  component: Cadastro,
});

type RegistrationType = "participant" | "producer" | null;

function Cadastro() {
  const [type, setType] = useState<RegistrationType>(null);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Producer specific
  const [orgNome, setOrgNome] = useState("");
  const [orgDocumento, setOrgDocumento] = useState("");
  const [pais, setPais] = useState("");

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error("Erro Google: " + error.message);
  };

  const handleAppleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error("Erro Apple: " + error.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) {
      toast.error("Por favor, escolha como deseja usar a plataforma.");
      return;
    }
    if (!termsAccepted) {
      toast.error("Você precisa aceitar os termos de uso.");
      return;
    }
    
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: `${nome} ${sobrenome}`,
          },
        },
      });

      if (authError) throw authError;

      if (type === "producer" && authData.user) {
        const { error: orgError } = await supabase
          .from("organizations")
          .insert({
            nome: orgNome,
            documento: orgDocumento,
            status: "pendente",
          })
          .select()
          .single();

        if (orgError) throw orgError;
      }

      toast.success(type === "producer" 
        ? "Cadastro enviado! Aguarde a aprovação da nossa equipe." 
        : "Cadastro realizado com sucesso!");
      
      navigate({ to: type === "producer" ? "/produtor" : "/app" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Esquerda - 40% */}
      <div className="hidden lg:flex w-[40%] bg-gradient-to-br from-[#14182A] to-[#241f3a] p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="relative z-10">
          <Link to="/" className="text-4xl font-heading font-extrabold text-primary tracking-tighter">
            Z
          </Link>
          <div className="mt-20">
            <h1 className="text-4xl font-heading font-bold leading-tight">
              Crie sua conta na <br />
              <span className="text-primary">Zevva Tickets</span>
            </h1>
            <p className="mt-4 text-white/60 text-lg max-w-xs">
              Junte-se a milhares de pessoas em caravanas e eventos inesquecíveis.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/40 italic text-sm">
            "Ide por todo o mundo, pregai o evangelho a toda criatura."
            <span className="block not-italic mt-1 text-xs opacity-60">— Marcos 16:15</span>
          </p>
        </div>
      </div>

      {/* Direita - 60% */}
      <div className="w-full lg:w-[60%] flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-6 left-6 text-muted-foreground hover:text-foreground"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <div className="w-full max-w-[450px] space-y-8 py-12">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-heading font-bold text-[#05070F]">Começar</h2>
            <p className="text-muted-foreground mt-2">Escolha seu perfil e preencha os dados abaixo.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType("participant")}
              className={cn(
                "p-4 rounded-[14px] border-2 transition-all text-left space-y-2 group",
                type === "participant" 
                  ? "border-[#C99A3E] bg-[#C99A3E]/5" 
                  : "border-slate-100 hover:border-slate-200"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-[10px] flex items-center justify-center transition-colors",
                type === "participant" ? "bg-[#C99A3E] text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
              )}>
                <User className="w-5 h-5" />
              </div>
              <p className="font-bold text-sm">Quero comprar ingressos</p>
            </button>

            <button
              type="button"
              onClick={() => setType("producer")}
              className={cn(
                "p-4 rounded-[14px] border-2 transition-all text-left space-y-2 group",
                type === "producer" 
                  ? "border-[#C99A3E] bg-[#C99A3E]/5" 
                  : "border-slate-100 hover:border-slate-200"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-[10px] flex items-center justify-center transition-colors",
                type === "producer" ? "bg-[#C99A3E] text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
              )}>
                <Building2 className="w-5 h-5" />
              </div>
              <p className="font-bold text-sm">Quero vender ingressos</p>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-12 border-slate-200 hover:bg-slate-50 text-black font-medium rounded-[12px]"
              onClick={handleGoogleLogin}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-2" alt="Google" />
              Google
            </Button>
            <Button 
              className="h-12 bg-[#05070F] hover:bg-[#1a1f2e] text-white font-medium rounded-[12px]"
              onClick={handleAppleLogin}
            >
              <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
              </svg>
              Apple
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-muted-foreground">ou com e-mail</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" className="h-12 border-slate-200 rounded-[12px]" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sobrenome">Sobrenome</Label>
                <Input id="sobrenome" className="h-12 border-slate-200 rounded-[12px]" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" className="h-12 border-slate-200 rounded-[12px]" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" className="h-12 border-slate-200 rounded-[12px]" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {type === "producer" && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Dados da Organização</p>
                <div className="space-y-2">
                  <Label htmlFor="orgNome">Nome da Organização</Label>
                  <Input id="orgNome" className="h-12 border-slate-200 rounded-[12px]" value={orgNome} onChange={(e) => setOrgNome(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgDocumento">CNPJ / Documento</Label>
                    <Input id="orgDocumento" className="h-12 border-slate-200 rounded-[12px]" value={orgDocumento} onChange={(e) => setOrgDocumento(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pais">País</Label>
                    <Input id="pais" className="h-12 border-slate-200 rounded-[12px]" value={pais} onChange={(e) => setPais(e.target.value)} required />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-[12px] border border-slate-100">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Nota:</strong> Sua organização passará por aprovação da plataforma antes de você poder publicar eventos.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-2 py-2">
              <Checkbox id="terms" className="mt-1 rounded-[4px] border-slate-300" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(!!checked)} />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                Eu aceito os <Link to="/" className="text-primary font-bold hover:underline">Termos de Uso</Link> e a <Link to="/" className="text-primary font-bold hover:underline">Política de LGPD</Link>.
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-[#E4BA6C] to-[#C99A3E] hover:from-[#d3ab5d] hover:to-[#b8892f] text-white font-bold rounded-[12px] shadow-lg shadow-primary/20 border-0"
              disabled={loading}
            >
              {loading ? "Processando..." : (type === "producer" ? "Enviar cadastro pra aprovação" : "Criar minha conta")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Já tem uma conta? <Link to="/login" className="text-primary font-bold hover:underline">Entrar agora</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
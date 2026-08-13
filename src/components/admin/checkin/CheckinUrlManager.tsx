import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  QrCode, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw,
  Link as LinkIcon,
  Globe,
  Settings,
  Smartphone
} from "lucide-react";
import { useTenants } from "@/hooks/use-tenants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CheckinUrlManager() {
  const { activeTenant } = useTenants();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const checkinUrl = activeTenant 
    ? `${window.location.origin}/checkin/${activeTenant.slug || activeTenant.id}` 
    : "Selecione um projeto para gerar o link";

  const copyToClipboard = () => {
    if (!activeTenant) {
      toast.error("Selecione um projeto primeiro");
      return;
    }
    navigator.clipboard.writeText(checkinUrl);
    toast.success("Link copiado para a área de transferência!");
  };

  const openUrl = () => {
    if (!activeTenant) {
      toast.error("Selecione um projeto primeiro");
      return;
    }
    navigate({ to: `/checkin/${activeTenant.slug || activeTenant.id}` });
  };

  const refreshUrl = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Link de acesso atualizado!");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 font-inter">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-manrope font-black text-foreground uppercase tracking-tighter">Link de Check-in</h1>
        <p className="text-muted-foreground font-medium">Gere e gerencie links exclusivos para sua equipe de recepção.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-line shadow-xl rounded-[32px] overflow-hidden">
          <CardHeader className="bg-navy text-primary-foreground pb-8">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-manrope font-black flex items-center gap-3">
                <LinkIcon className="w-6 h-6 text-coral" /> Link Operacional
              </CardTitle>
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                Ativo
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest px-1">URL de Acesso Direto</label>
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                  <Input 
                    readOnly 
                    value={checkinUrl}
                    className="h-14 pl-12 pr-4 bg-surface border-line rounded-2xl font-bold text-foreground outline-none focus-visible:ring-primary/20"
                  />
                </div>
                <Button 
                  onClick={copyToClipboard}
                  className="h-14 w-14 rounded-2xl bg-card border border-line text-foreground hover:bg-surface shadow-sm"
                  title="Copiar Link"
                >
                  <Copy className="w-5 h-5" />
                </Button>
                <Button 
                  onClick={openUrl}
                  className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground hover:bg-coral-dark shadow-lg shadow-coral/20"
                  title="Abrir Link"
                >
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 bg-muted rounded-3xl border border-line space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-foreground shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-foreground uppercase">Segurança de Acesso</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Este link exige login de um membro da equipe com permissão de Check-in. 
                    Ideal para tablets e coletores na entrada do evento.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center justify-between border-t border-line">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Expiração: Nunca</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={refreshUrl}
                  className="text-primary font-black text-[10px] uppercase hover:bg-primary/5 gap-2"
                >
                  {isRefreshing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Atualizar Token
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-line shadow-xl rounded-[32px] overflow-hidden bg-surface/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-manrope font-black text-foreground flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-coral" /> Mobile Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="aspect-square bg-card rounded-3xl border border-line p-6 flex flex-col items-center justify-center space-y-4 shadow-inner">
              <div className="relative">
                <QrCode className="w-32 h-32 text-foreground" />
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                   <QrCode className="w-full h-full text-coral" />
                </div>
              </div>
              <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest text-center">Escaneie para configurar <br /> o coletor mobile</p>
            </div>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full h-12 rounded-xl border-line text-foreground font-bold text-xs uppercase tracking-widest gap-2 bg-card">
                <Settings className="w-4 h-4" /> Configurações
              </Button>
              <Button variant="ghost" className="w-full h-12 rounded-xl text-muted-foreground font-bold text-xs uppercase tracking-widest">
                Ajuda na Recepção
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-card rounded-[40px] border border-line shadow-sm space-y-4">
          <h3 className="font-manrope font-black text-foreground text-xl">Como usar?</h3>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-coral/10 text-coral flex items-center justify-center font-black shrink-0">1</span>
              <p className="text-sm text-muted-foreground font-medium">Copie o link acima e envie para os operadores de recepção.</p>
            </li>
            <li className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-coral/10 text-coral flex items-center justify-center font-black shrink-0">2</span>
              <p className="text-sm text-muted-foreground font-medium">Ao acessar, eles poderão selecionar o evento e iniciar o scanner.</p>
            </li>
            <li className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-coral/10 text-coral flex items-center justify-center font-black shrink-0">3</span>
              <p className="text-sm text-muted-foreground font-medium">Todos os dados de check-in serão sincronizados em tempo real com este painel.</p>
            </li>
          </ul>
        </div>

        <div className="p-8 bg-navy rounded-[40px] text-white space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-coral/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-coral/20 transition-all duration-700" />
          <div className="space-y-2 relative z-10">
            <h3 className="font-manrope font-black text-2xl">Zevva Staff</h3>
            <p className="text-white/60 text-sm font-medium">O ambiente operacional de check-in (Zevva Staff) está configurado. Acesse agora para gerenciar a entrada dos participantes.</p>
          </div>
          <Button 
            onClick={() => navigate({ to: activeTenant ? `/checkin/${activeTenant.slug || activeTenant.id}` : '/checkin' })}
            className="w-full h-14 bg-coral hover:bg-coral-dark text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-coral/20 relative z-10"
          >
            Acessar Zevva Staff
          </Button>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { 
  Building2, 
  CreditCard, 
  Clock, 
  Loader2,
  Image as ImageIcon,
  Save,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTenants } from "@/hooks/use-tenants";

export const Route = createFileRoute("/produtor/configuracoes")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/" });
  },
  component: OrgSettings,
});

function OrgSettings() {
  const { activeTenant, refreshTenants } = useTenants();
  const [formData, setFormData] = useState<any>({
    nome: "",
    logo: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTenant) {
      setFormData({
        nome: activeTenant.nome || "",
        logo: activeTenant.logo || "",
      });
      setLoading(false);
    }
  }, [activeTenant]);

  const handleSave = async () => {
    if (!activeTenant) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("tenants")
        .update({
          nome: formData.nome,
          logo: formData.logo,
        } as any)
        .eq("id", activeTenant.id);

      if (error) throw error;
      await refreshTenants();
      toast.success("Configurações atualizadas com sucesso!");
    } catch (error: any) {

      toast.error(error.message || "Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-coral" />
      <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Carregando configurações...</p>
    </div>
  );

  return (
    <div className="space-y-10 font-inter animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-manrope font-black text-foreground tracking-tighter uppercase">⚙️ Configurações do Projeto</h1>
          <p className="text-sm text-muted-foreground font-medium">Gestão de identidade, pagamentos e regras operacionais.</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-navy hover:bg-navy/90 text-white gap-2 font-black px-8 h-12 shadow-lg rounded-xl uppercase tracking-widest text-xs w-full sm:w-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Alterações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Identidade do Projeto */}
          <section className="bg-card rounded-[32px] border border-line p-8 space-y-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-coral/10 rounded-2xl text-coral">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-manrope font-black text-foreground uppercase tracking-tight">Identidade Visual</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome do Projeto</label>
                <Input 
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="h-12 rounded-xl border-line"
                  placeholder="Ex: Minha Caravana"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL do Logo</label>
                <div className="flex gap-2">
                  <Input 
                    value={formData.logo}
                    onChange={(e) => setFormData({...formData, logo: e.target.value})}
                    className="h-12 rounded-xl border-line"
                    placeholder="https://..."
                  />
                  <div className="w-12 h-12 rounded-xl border border-line bg-surface flex items-center justify-center overflow-hidden shrink-0">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            </div>

          </section>

          {/* Integrações */}
          <section className="bg-card rounded-[32px] border border-line p-8 space-y-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-navy/5 rounded-2xl text-foreground">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-manrope font-black text-foreground uppercase tracking-tight">Pagamentos e Taxas</h2>
            </div>

            <div className="bg-surface rounded-2xl border border-line p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-card border border-line flex items-center justify-center">
                    <Globe className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground uppercase tracking-tight">Stripe Connect</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Receba pagamentos diretamente em sua conta.</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 font-black text-[9px] uppercase tracking-widest">
                  Desconectado
                </Badge>
              </div>
              <Button className="w-full bg-navy text-primary-foreground font-black h-12 rounded-xl uppercase tracking-widest text-[10px]">
                Configurar Stripe Connect
              </Button>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Status do Projeto */}
          <section className="bg-navy rounded-[32px] p-8 text-white space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Status do Tenant</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xl font-manrope font-black uppercase tracking-tight">Ativo & Verificado</span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-white/60">Plano Atual</span>
                <Badge className="bg-primary text-primary-foreground border-none font-black text-[9px] uppercase">Zevva Pro</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-white/60">Membros</span>
                <span className="text-xs font-black">04 / 10</span>
              </div>
            </div>
          </section>

          {/* Automações Padrão */}
          <section className="bg-card rounded-[32px] border border-line p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-good/10 rounded-xl text-good">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-manrope font-black text-foreground uppercase text-sm tracking-tight">Operação</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-foreground uppercase tracking-tight">Falta Automática</p>
                  <p className="text-[10px] text-muted-foreground font-medium">No-show automático.</p>
                </div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-foreground uppercase tracking-tight">Check-in Pós-Evento</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Permitir após término.</p>
                </div>
                <Switch />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


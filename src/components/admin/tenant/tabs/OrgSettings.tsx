import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  CreditCard, 
  Clock, 
  Loader2,
  Image as ImageIcon,
  Save,
  Globe,
  Settings as SettingsIcon,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function OrgSettings({ tenantId }: { tenantId: string }) {
  const [formData, setFormData] = useState<any>({
    nome: "",
    logo: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTenant() {
      if (!tenantId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tenants")
          .select("*")
          .eq("id", tenantId)
          .single();

        if (error) throw error;
        if (data) {
          setFormData({
            nome: data.nome || "",
            logo: data.logo || "",
          });
        }
      } catch (error: any) {
        toast.error("Erro ao carregar configurações");
      } finally {
        setLoading(false);
      }
    }
    loadTenant();
  }, [tenantId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("tenants")
        .update({
          nome: formData.nome,
          logo: formData.logo,
        } as any)
        .eq("id", tenantId);

      if (error) throw error;
      toast.success("Configurações atualizadas com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[400px] gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Carregando configurações...</p>
    </div>
  );

  return (
    <div className="space-y-10 font-inter animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-manrope font-black text-foreground tracking-tighter uppercase">⚙️ Configurações do Projeto</h1>
          <p className="text-sm text-muted-foreground font-medium">Gestão administrativa de identidade e regras operacionais.</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-navy hover:bg-navy/90 text-primary-foreground gap-2 font-black px-8 h-12 shadow-lg rounded-2xl uppercase tracking-widest text-xs w-full sm:w-auto transition-all active:scale-95"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Alterações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-card rounded-[40px] border border-border p-10 space-y-10 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-4 bg-primary/10 rounded-[20px] text-primary shadow-inner">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-manrope font-black text-navy uppercase tracking-tight">Identidade Visual</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Nome do Projeto</label>
                <Input 
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="h-14 rounded-2xl border-border bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  placeholder="Ex: Evento Zevva"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">URL do Logo</label>
                <div className="flex gap-4">
                  <Input 
                    value={formData.logo}
                    onChange={(e) => setFormData({...formData, logo: e.target.value})}
                    className="h-14 rounded-2xl border-border bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                    placeholder="https://..."
                  />
                  <div className="w-14 h-14 rounded-2xl border border-border bg-card flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-card rounded-[40px] border border-border p-10 space-y-10 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-navy/5 rounded-[20px] text-navy">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-manrope font-black text-navy uppercase tracking-tight">Pagamentos</h2>
            </div>

            <div className="bg-muted/30 rounded-[32px] border border-border/60 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm">
                    <Globe className="w-6 h-6 text-navy" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-navy uppercase tracking-tight">Stripe Connect</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Split de pagamentos automático.</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1">
                  Pendente
                </Badge>
              </div>
              <Button className="w-full bg-navy text-primary-foreground font-black h-12 rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-navy/20">
                Vincular Conta Stripe
              </Button>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-navy rounded-[40px] p-10 text-primary-foreground space-y-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
            <div className="space-y-3 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground/40">Status do Ambiente</p>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse" />
                <span className="text-2xl font-manrope font-black uppercase tracking-tight">Operacional</span>
              </div>
            </div>
            <div className="pt-8 border-t border-white/10 space-y-5 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary-foreground/50 uppercase tracking-widest">Segurança RLS</span>
                <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] uppercase tracking-widest">Hardened</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary-foreground/50 uppercase tracking-widest">SLA Resposta</span>
                <span className="text-xs font-black">99.9%</span>
              </div>
            </div>
          </section>

          <section className="bg-card rounded-[40px] border border-border p-10 space-y-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-[16px] text-primary">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-manrope font-black text-navy uppercase text-sm tracking-tight">Políticas</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between group">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-navy uppercase tracking-tight group-hover:text-primary transition-colors">Aprovação Manual</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Validar novos membros.</p>
                </div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between group">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-navy uppercase tracking-tight group-hover:text-primary transition-colors">Relatórios por E-mail</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Envio semanal de KPIs.</p>
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

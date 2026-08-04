import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { 
  Building2, 
  CreditCard, 
  Clock, 
  Settings as SettingsIcon,
  ShieldCheck,
  Loader2,
  Globe,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/produtor/configuracoes")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/" });

    const { data: member } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (member?.role !== 'produtor_owner') {
      throw redirect({ to: "/produtor" });
    }
  },
  component: OrgSettings,
});

function OrgSettings() {
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrg();
  }, []);

  async function fetchOrg() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: member } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (member) {
      const { data } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", member.organization_id)
        .single();
      
      setOrg(data);
    }
    setLoading(false);
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          name: org.name,
          // document: org.document, // assuming columns exist or will be added
        })
        .eq("id", org.id);

      if (error) throw error;
      toast.success("Configurações salvas!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-gold" />
    </div>
  );

  return (
    <div className="space-y-10 font-sans max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-heading font-extrabold text-navy">Configurações</h1>
        <p className="text-muted font-medium">Dados da organização e preferências da conta.</p>
      </div>

      <div className="grid gap-8">
        {/* Organization Info */}
        <div className="bg-white rounded-[32px] border border-line p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gold/10 rounded-2xl text-gold">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-heading font-extrabold text-navy">Dados da Organização</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted">Nome da Organização</label>
              <Input 
                value={org?.name || ""} 
                onChange={(e) => setOrg({...org, name: e.target.value})}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted">Documento (CNPJ/TAX ID)</label>
              <Input 
                value={org?.document || ""} 
                placeholder="00.000.000/0000-00"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted">País Sede</label>
              <Select defaultValue="BR">
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Selecione o país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BR">Brasil</SelectItem>
                  <SelectItem value="US">Estados Unidos</SelectItem>
                  <SelectItem value="PT">Portugal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted">Moeda Padrão</label>
              <Select defaultValue="BRL">
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (R$)</SelectItem>
                  <SelectItem value="USD">Dólar (US$)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Payment Integration */}
        <div className="bg-white rounded-[32px] border border-line p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-navy/5 rounded-2xl text-navy">
              <CreditCard className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-heading font-extrabold text-navy">Pagamentos (Stripe Connect)</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface p-6 rounded-2xl border border-line">
            <div className="space-y-1">
              <p className="font-bold text-navy">Status da Conta</p>
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 font-extrabold text-[10px] uppercase">Pendente de Configuração</Badge>
            </div>
            <Button className="bg-navy text-white font-extrabold px-8 rounded-xl h-12">
              Conectar com Stripe
            </Button>
          </div>
        </div>

        {/* Global Event Defaults */}
        <div className="bg-white rounded-[32px] border border-line p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-good/5 rounded-2xl text-good">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-heading font-extrabold text-navy">Regras de No-Show (Falta Automática)</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
              <div className="space-y-1">
                <p className="font-bold text-navy">Ativar falta automática por padrão</p>
                <p className="text-xs text-muted font-medium">Aplica-se a todos os novos eventos criados.</p>
              </div>
              <Switch />
            </div>
            
            <div className="space-y-2 max-w-xs">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted">Tempo de tolerância (minutos)</label>
              <Input type="number" defaultValue="15" className="h-12 rounded-xl" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-gold hover:bg-gold-deep text-white font-extrabold px-12 rounded-xl h-14 shadow-xl shadow-gold/20"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </div>
  );
}

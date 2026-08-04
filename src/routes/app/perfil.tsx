import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Shield, 
  History, 
  Save, 
  Loader2,
  Lock,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/app/perfil")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/" });
  },
  component: UserProfile,
});

function UserProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    setProfile(data);
    setLoading(false);
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nome: profile.nome,
        })
        .eq("id", profile.id);

      if (error) throw error;
      toast.success("Perfil atualizado!");
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
    <div className="space-y-10 font-sans max-w-2xl mx-auto pb-20">
      <div className="space-y-1">
        <h1 className="text-3xl font-heading font-extrabold text-navy">Meu Perfil</h1>
        <p className="text-muted font-medium">Gerencie suas informações pessoais e preferências.</p>
      </div>

      <div className="grid gap-8">
        {/* Personal Info */}
        <div className="bg-white rounded-[32px] border border-line p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gold/10 rounded-2xl text-gold">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-heading font-extrabold text-navy">Dados Pessoais</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted">Nome Completo</label>
              <Input 
                value={profile?.nome || ""} 
                onChange={(e) => setProfile({...profile, nome: e.target.value})}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted">E-mail</label>
              <Input 
                value={profile?.email || ""} 
                disabled
                className="h-12 rounded-xl bg-surface/50 text-muted"
              />
              <p className="text-[10px] text-muted font-bold">O e-mail não pode ser alterado diretamente.</p>
            </div>
          </div>
        </div>

        {/* Security & Privacy */}
        <div className="bg-white rounded-[32px] border border-line p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-navy/5 rounded-2xl text-navy">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-heading font-extrabold text-navy">Privacidade e LGPD</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
              <div className="space-y-1">
                <p className="font-bold text-navy">Receber ofertas por e-mail</p>
                <p className="text-xs text-muted font-medium">Novos eventos e promoções exclusivas.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
              <div className="space-y-1">
                <p className="font-bold text-navy">Perfil público no catálogo</p>
                <p className="text-xs text-muted font-medium">Mostrar seu nome em listas de participantes.</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Security Actions */}
        <div className="bg-white rounded-[32px] border border-line p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-good/5 rounded-2xl text-good">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-heading font-extrabold text-navy">Segurança</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" className="h-14 rounded-xl font-bold border-line hover:bg-surface">
              <Lock className="w-4 h-4 mr-2" /> Alterar Senha
            </Button>
            <Button variant="outline" className="h-14 rounded-xl font-bold border-line hover:bg-surface">
              <Smartphone className="w-4 h-4 mr-2" /> Autenticação 2FA
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-gold hover:bg-gold-deep text-white font-extrabold px-12 rounded-xl h-14 shadow-xl shadow-gold/20"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
}

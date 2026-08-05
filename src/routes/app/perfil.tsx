import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { 
  User, 
  Mail, 
  Shield, 
  History, 
  Save, 
  Loader2,
  Lock,
  Smartphone,
  Camera,
  Trash2,
  Bell,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Ticket,
  ChevronRight,
  LogOut,
  Map,
  CreditCard,
  Settings,
  Moon,
  Sun,
  Monitor,
  Phone,
  Hash,
  AlertTriangle,
  ChevronDown,
  Activity,
  Workflow,
  Users,
  Star,
  Bot,
  Layers,
  Radio,
  FileText,
  Scan,
  Coins,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUI } from "@/hooks/use-ui";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbNavigation } from "@/components/layout/BreadcrumbNavigation";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [uploading, setUploading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [newPassword, setNewPassword] = useState({ current: "", new: "", confirm: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useUI();

  useEffect(() => {
    fetchProfile();
    fetchSessions();
    fetchTickets();
    fetchHistory();
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

  async function fetchSessions() {
    const { data } = await supabase.from("active_sessions").select("*").order("last_access", { ascending: false });
    if (data) setSessions(data);
  }

  async function fetchTickets() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("tickets")
      .select("*, events(title, location, city, start_date)")
      .eq("owner_id", user.id)
      .limit(3);
    if (data) setMyTickets(data);
  }

  async function fetchHistory() {
    // Simulated history for timeline
    setActivities([
      { id: 1, type: "compra", title: "Compra realizada", desc: "Evento Caravanas Internacionais", date: "05/08/2026" },
      { id: 2, type: "perfil", title: "Perfil atualizado", desc: "Foto de perfil alterada", date: "04/08/2026" },
      { id: 3, type: "login", title: "Login realizado", desc: "Dispositivo Chrome / Windows", date: "04/08/2026" },
    ]);
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB.");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath || "");

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success("Foto atualizada com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao fazer upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (error) throw error;
      setProfile({ ...profile, avatar_url: null });
      toast.success("Foto removida.");
    } catch (error: any) {
      toast.error("Erro ao remover foto: " + error.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nome: profile.nome,
          telefone: profile.telefone,
          data_nascimento: profile.data_nascimento,
          documento: profile.documento,
          cidade: profile.cidade,
          estado: profile.estado,
          cep: profile.cep,
          rua: profile.rua,
          numero: profile.numero,
          complemento: profile.complemento,
          notif_lembrete_evento: profile.notif_lembrete_evento,
          notif_novidades: profile.notif_novidades,
        })
        .eq("id", profile.id);

      if (error) throw error;
      toast.success("Alterações salvas com sucesso!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.new !== newPassword.confirm) {
      toast.error("As senhas não conferem.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword.new });
    if (error) toast.error(error.message);
    else {
      toast.success("Senha atualizada com sucesso!");
      setNewPassword({ current: "", new: "", confirm: "" });
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    const { error } = await supabase.from("active_sessions").delete().eq("id", sessionId);
    if (error) toast.error("Erro ao encerrar sessão.");
    else {
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success("Sessão encerrada.");
    }
  };

  const handleDeleteAccount = async () => {
    toast.error("Esta função requer suporte administrativo para garantir a exclusão segura de todos os dados.");
  };

  const initials = profile?.nome 
    ? profile.nome.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email?.slice(0, 2).toUpperCase();

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-coral" />
      <p className="mt-4 text-xs font-bold text-muted uppercase tracking-widest">Carregando perfil...</p>
    </div>
  );

  return (
    <div className="space-y-10 font-inter max-w-2xl mx-auto pb-20 pt-6">
      <BreadcrumbNavigation />
      <div className="space-y-1">
        <h1 className="text-3xl font-manrope font-extrabold text-navy">Meu Perfil</h1>
        <p className="text-muted font-medium">Gerencie suas informações pessoais e preferências.</p>
      </div>

      <div className="grid gap-8">
        {/* Personal Info */}
        <div className="bg-white rounded-[32px] border border-line p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-coral/10 rounded-2xl text-coral">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-manrope font-extrabold text-navy">Dados Pessoais</h2>
          </div>

          <div className="flex flex-col items-center gap-6 pb-4">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-surface shadow-xl">
                <AvatarImage src={profile?.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-coral/20 to-coral/40 text-2xl font-black text-navy uppercase">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-1 right-1 w-10 h-10 bg-coral text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            {profile?.avatar_url && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRemovePhoto}
                className="text-error hover:text-error hover:bg-error/5 font-bold"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Remover foto
              </Button>
            )}
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

        {/* Notifications Preference */}
        <div className="bg-white rounded-[32px] border border-line p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-coral/10 rounded-2xl text-coral">
              <Bell className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-manrope font-extrabold text-navy">Notificações</h2>
            <Button variant="outline" size="sm" className="ml-auto rounded-lg text-[10px] font-bold uppercase tracking-wider h-8">Ativar tudo</Button>
          </div>

          <p className="text-xs text-muted font-medium mb-6">Escolha quais alertas você recebe e por onde.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fila e SLA */}
            <NotificationItem 
              icon={Activity} 
              title="Fila e SLA" 
              description="Fila crítica e demora no atendimento." 
            />
            
            {/* Canais */}
            <NotificationItem 
              icon={Radio} 
              title="Canais" 
              description="Conexão de WhatsApp, Instagram e outros." 
            />

            {/* Fluxos */}
            <NotificationItem 
              icon={Workflow} 
              title="Fluxos" 
              description="Erros e mudanças nos seus fluxos." 
            />

            {/* Relatórios */}
            <NotificationItem 
              icon={FileText} 
              title="Relatórios" 
              description="Relatórios e backups prontos." 
            />

            {/* Equipe */}
            <NotificationItem 
              icon={Users} 
              title="Equipe" 
              description="Convites e mudanças na equipe." 
            />

            {/* Contatos */}
            <NotificationItem 
              icon={Scan} 
              title="Contatos" 
              description="Bloqueios e sincronização de contatos." 
            />

            {/* Pesquisas (CSAT) */}
            <NotificationItem 
              icon={Star} 
              title="Pesquisas (CSAT)" 
              description="Resultados de pesquisas de satisfação." 
            />

            {/* Análise de conteúdo */}
            <NotificationItem 
              icon={Info} 
              title="Análise de conteúdo" 
              description="Mensagens que acionaram regras." 
            />

            {/* Supervisor IA */}
            <NotificationItem 
              icon={Bot} 
              title="Supervisor IA" 
              description="Alertas e falhas da auditoria automática..." 
            />

            {/* Plano e cobrança */}
            <NotificationItem 
              icon={Coins} 
              title="Plano e cobrança" 
              description="Bloqueios e nível do projeto." 
            />

            {/* Modelos */}
            <NotificationItem 
              icon={Layers} 
              title="Modelos" 
              description="Falhas na sincronização de modelos." 
            />
          </div>
        </div>

        {/* Privacy & LGPD */}
        <div className="bg-white rounded-[32px] border border-line p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-navy/5 rounded-2xl text-navy">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-manrope font-extrabold text-navy">Privacidade e LGPD</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
              <div className="space-y-1">
                <p className="font-bold text-navy">Perfil público no catálogo</p>
                <p className="text-xs text-muted font-medium">Mostrar seu nome em listas de participantes.</p>
              </div>
              <Switch />
            </div>
            <div className="p-4 bg-navy/5 rounded-xl border border-navy/10">
              <p className="text-xs text-navy font-bold leading-relaxed">
                Seus dados são processados de acordo com a nossa Política de Privacidade. 
                Você pode solicitar a exportação ou exclusão total dos seus dados a qualquer momento via suporte.
              </p>
            </div>
          </div>
        </div>

        {/* Security Actions */}
        <div className="bg-white rounded-[32px] border border-line p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-good/5 rounded-2xl text-good">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-manrope font-extrabold text-navy">Segurança</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" className="h-14 rounded-xl font-bold border-line hover:bg-surface transition-all active:scale-95">
              <Lock className="w-4 h-4 mr-2" /> Alterar Senha
            </Button>
            <Button variant="outline" className="h-14 rounded-xl font-bold border-line hover:bg-surface transition-all active:scale-95">
              <Smartphone className="w-4 h-4 mr-2" /> Autenticação 2FA
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-coral hover:bg-coral-dark text-white font-extrabold px-12 rounded-xl h-14 shadow-xl shadow-coral/20 transition-all active:scale-95"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function NotificationItem({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface/50 rounded-2xl border border-line/5 hover:border-coral/20 transition-all group">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-navy/5 rounded-xl text-navy/40 group-hover:text-coral group-hover:bg-coral/10 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-navy">{title}</p>
            <Info className="w-3 h-3 text-muted/40 cursor-help" />
          </div>
          <p className="text-[10px] text-muted font-medium leading-tight">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 bg-navy/5 rounded-lg text-navy/40 hover:text-coral hover:bg-coral-dark transition-all" title="No app">
          <Bell className="w-3.5 h-3.5" />
        </button>
        <button className="p-2 bg-navy/5 rounded-lg text-navy/40 hover:text-coral hover:bg-coral-dark transition-all" title="E-mail">
          <Mail className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

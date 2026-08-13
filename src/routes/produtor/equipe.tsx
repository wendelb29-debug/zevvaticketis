import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Plus,
  Loader2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useTenants } from "@/hooks/use-tenants";

export const Route = createFileRoute("/produtor/equipe")({
  component: TeamManagement,
});


const PERMISSIONS = [
  { id: 'checkin', label: 'Check-in' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'suporte', label: 'Suporte' },
  { id: 'eventos', label: 'Eventos' },
];

function TeamManagement() {
  const { activeTenant } = useTenants();
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    if (activeTenant) {
      fetchTeamData();
    }
  }, [activeTenant]);


  async function fetchTeamData() {
    if (!activeTenant) return;
    setLoading(true);

    const { data: member } = await supabase
      .from("tenant_members")
      .select("tenant_id")
      .eq("tenant_id", activeTenant.id)
      .limit(1)
      .single();


    if (member) {
      // Fetch members
      const { data: memberList } = await supabase
        .from("tenant_members")
        .select(`
          *,
          profiles:user_id (
            nome,
            email,
            avatar_url
          )
        `)
        .eq("tenant_id", member.tenant_id);
      
      if (memberList) setMembers(memberList);

      // Fetch pending invites
      const { data: inviteList } = await supabase
        .from("team_invites")
        .select("*")
        .eq("tenant_id", member.tenant_id)
        .eq("status", "pendente");
      
      if (inviteList) setInvites(inviteList);
    }
    setLoading(false);
  }

  const handleSendInvite = async () => {
    if (!inviteEmail) return;
    setSendingInvite(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: member } = await supabase
        .from("tenant_members")
        .select("tenant_id")
        .eq("user_id", user.id)
        .single();

      if (!member?.tenant_id) throw new Error("Organização não encontrada");

      const { error } = await supabase
        .from("team_invites")
        .insert({
          tenant_id: member.tenant_id,
          email: inviteEmail,
          permissions: selectedPermissions,
          status: 'pendente'
        });

      if (error) throw error;

      toast.success("Convite enviado com sucesso!");
      setInviteEmail("");
      setSelectedPermissions([]);
      setIsInviteOpen(false);
      fetchTeamData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSendingInvite(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Carregando equipe...</p>
    </div>
  );

  return (
    <div className="space-y-8 font-inter max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-manrope font-extrabold text-foreground">Equipe do Projeto</h1>
          <p className="text-muted-foreground font-medium">Gerencie membros e permissões deste ambiente.</p>
        </div>

        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark text-primary-foreground font-extrabold px-6 rounded-xl h-12 shadow-lg shadow-primary/20">
              <UserPlus className="w-5 h-5 mr-2" /> Convidar membro
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px] sm:max-w-md p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-manrope font-extrabold text-foreground">Convidar para Equipe</DialogTitle>
              <p className="text-muted-foreground font-medium pt-2">
                Envie um convite por e-mail e defina as permissões de acesso.
              </p>
            </DialogHeader>
            
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">E-mail do convidado</label>
        <Input 
          placeholder="exemplo@email.com" 
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          className="h-12 rounded-xl"
        />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Permissões</label>
                <div className="grid grid-cols-2 gap-4">
                  {PERMISSIONS.map((perm) => (
                    <div key={perm.id} className="flex items-center space-x-3 bg-card p-3 rounded-xl border border-border/50">
                      <Checkbox 
                        id={perm.id} 
                        checked={selectedPermissions.includes(perm.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedPermissions([...selectedPermissions, perm.id]);
                          else setSelectedPermissions(selectedPermissions.filter(p => p !== perm.id));
                        }}
                      />
                      <label htmlFor={perm.id} className="text-xs font-bold text-foreground cursor-pointer">{perm.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={handleSendInvite}
                disabled={sendingInvite || !inviteEmail}
                className="w-full h-14 bg-navy text-primary-foreground font-extrabold rounded-2xl shadow-xl"
              >
                {sendingInvite ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar Convite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8">
        {/* Active Members */}
        <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-border bg-card/30">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-foreground">Membros Ativos</h3>
          </div>
          <div className="divide-y divide-line">
            {members.map((member) => (
              <div key={member.id} className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-extrabold text-xl overflow-hidden">
                    {member.profiles?.avatar_url ? (
                      <img src={member.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (member.profiles?.nome || member.profiles?.email || "U").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">{member.profiles?.nome || "Usuário sem nome"}</p>
                    <p className="text-xs text-muted-foreground font-medium">{member.profiles?.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-coral/20 font-extrabold text-[10px] uppercase px-3">
                    {member.role === 'OWNER' ? 'Dono' : 'Equipe'}
                  </Badge>
                  {(member.permissions as string[] || []).map(perm => (
                    <Badge key={perm} className="bg-navy/5 text-foreground border-navy/10 font-extrabold text-[10px] uppercase px-3">
                      {perm}
                    </Badge>
                  ))}
                </div>

                {member.role !== 'OWNER' && (
                   <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                     <Trash2 className="w-5 h-5" />
                   </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-border bg-card/30">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary flex items-center gap-2">
                <Clock className="w-4 h-4" /> Convites Pendentes
              </h3>
            </div>
            <div className="divide-y divide-line">
              {invites.map((invite) => (
                <div key={invite.id} className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center text-muted-foreground">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-foreground">{invite.email}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                        Enviado em {new Date(invite.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(invite.permissions as string[] || []).map(perm => (
                      <Badge key={perm} variant="outline" className="border-border text-muted-foreground font-extrabold text-[10px] uppercase px-3">
                        {perm}
                      </Badge>
                    ))}
                  </div>

                  <Button variant="ghost" className="text-destructive font-bold text-xs">
                    Cancelar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

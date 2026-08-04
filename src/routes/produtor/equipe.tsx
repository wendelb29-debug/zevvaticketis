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
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, []);

  async function fetchTeamData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get organization ID
    const { data: member } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (member) {
      // Fetch members
      const { data: memberList } = await supabase
        .from("organization_members")
        .select(`
          *,
          profiles:user_id (
            nome,
            email,
            avatar_url
          )
        `)
        .eq("organization_id", member.organization_id);
      
      if (memberList) setMembers(memberList);

      // Fetch pending invites
      const { data: inviteList } = await supabase
        .from("team_invites")
        .select("*")
        .eq("organization_id", member.organization_id)
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
      const { data: member } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user?.id)
        .single();

      const { error } = await supabase
        .from("team_invites")
        .insert({
          organization_id: member?.organization_id as string,
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
      <Loader2 className="w-8 h-8 animate-spin text-gold" />
      <p className="text-muted font-bold uppercase tracking-widest text-[10px]">Carregando equipe...</p>
    </div>
  );

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-extrabold text-navy">Minha Equipe</h1>
          <p className="text-muted font-medium">Gerencie membros e permissões da sua organização.</p>
        </div>

        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-deep text-white font-extrabold px-6 rounded-xl h-12 shadow-lg shadow-gold/20">
              <UserPlus className="w-5 h-5 mr-2" /> Convidar membro
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px] sm:max-w-md p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading font-extrabold text-navy">Convidar para Equipe</DialogTitle>
              <p className="text-muted font-medium pt-2">
                Envie um convite por e-mail e defina as permissões de acesso.
              </p>
            </DialogHeader>
            
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted">E-mail do convidado</label>
        <Input 
          placeholder="exemplo@email.com" 
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          className="h-12 rounded-xl"
        />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted">Permissões</label>
                <div className="grid grid-cols-2 gap-4">
                  {PERMISSIONS.map((perm) => (
                    <div key={perm.id} className="flex items-center space-x-3 bg-surface p-3 rounded-xl border border-line/50">
                      <Checkbox 
                        id={perm.id} 
                        checked={selectedPermissions.includes(perm.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedPermissions([...selectedPermissions, perm.id]);
                          else setSelectedPermissions(selectedPermissions.filter(p => p !== perm.id));
                        }}
                      />
                      <label htmlFor={perm.id} className="text-xs font-bold text-navy cursor-pointer">{perm.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={handleSendInvite}
                disabled={sendingInvite || !inviteEmail}
                className="w-full h-14 bg-navy text-white font-extrabold rounded-2xl shadow-xl"
              >
                {sendingInvite ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar Convite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8">
        {/* Active Members */}
        <div className="bg-white rounded-[32px] border border-line shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-line bg-surface/30">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-navy">Membros Ativos</h3>
          </div>
          <div className="divide-y divide-line">
            {members.map((member) => (
              <div key={member.id} className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold font-extrabold text-xl overflow-hidden">
                    {member.profiles?.avatar_url ? (
                      <img src={member.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (member.profiles?.nome || member.profiles?.email || "U").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-navy">{member.profiles?.nome || "Usuário sem nome"}</p>
                    <p className="text-xs text-muted font-medium">{member.profiles?.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-gold/5 text-gold border-gold/20 font-extrabold text-[10px] uppercase px-3">
                    {member.role === 'produtor_owner' ? 'Dono' : 'Equipe'}
                  </Badge>
                  {(member.permissions as string[] || []).map(perm => (
                    <Badge key={perm} className="bg-navy/5 text-navy border-navy/10 font-extrabold text-[10px] uppercase px-3">
                      {perm}
                    </Badge>
                  ))}
                </div>

                {member.role !== 'produtor_owner' && (
                   <Button variant="ghost" size="icon" className="text-muted hover:text-destructive">
                     <Trash2 className="w-5 h-5" />
                   </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="bg-white rounded-[32px] border border-line shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-line bg-surface/30">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-gold flex items-center gap-2">
                <Clock className="w-4 h-4" /> Convites Pendentes
              </h3>
            </div>
            <div className="divide-y divide-line">
              {invites.map((invite) => (
                <div key={invite.id} className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-muted">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-navy">{invite.email}</p>
                      <p className="text-[10px] text-muted font-medium uppercase tracking-widest">
                        Enviado em {new Date(invite.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(invite.permissions as string[] || []).map(perm => (
                      <Badge key={perm} variant="outline" className="border-line text-muted font-extrabold text-[10px] uppercase px-3">
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

import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar, 
  Hash, 
  User, 
  Clock, 
  MoreHorizontal,
  Edit,
  History,
  FileText,
  Users,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { AttendanceDetailModal } from '@/components/admin/contacts/AttendanceDetailModal';

export const Route = createFileRoute('/admin/contatos/$id/')({
  component: ContactDetailsPage,
});

function ContactDetailsPage() {
  const { id } = Route.useParams();
  const [selectedAttendance, setSelectedAttendance] = useState<{ id: string, protocol?: string } | null>(null);

  const { data: contact, isLoading } = useQuery({
    queryKey: ['admin-contact', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select(`
          *,
          whatsapp_contact_group_memberships(
            whatsapp_contact_groups(id, name, color)
          ),
          whatsapp_attendances(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold">Contato não encontrado</h2>
        <Button variant="link" asChild className="mt-2">
          <Link to="/admin/contatos">Voltar para a lista</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/admin/contatos">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border-2 border-primary/20 shrink-0 shadow-lg">
              {contact.avatar_url ? (
                <img src={contact.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
              ) : (
                contact.name?.[0]?.toUpperCase() || '?'
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight">{contact.name || 'Sem nome'}</h1>
                <Badge className={cn(
                  "text-[10px] uppercase font-black",
                  contact.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                )}>
                  {contact.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {contact.phone}</span>
                {contact.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {contact.email}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 font-bold border-border">
            <Edit className="w-4 h-4" /> Editar
          </Button>
          <Button asChild className="gap-2 bg-primary hover:bg-primary/90 font-bold">
            <Link to="/admin/chat">
              <MessageSquare className="w-4 h-4" /> Abrir Chat
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Informações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-2"><Hash className="w-4 h-4" /> ID Externo</span>
                <span className="font-mono text-xs">{contact.external_contact_id || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Primeiro Contato</span>
                <span className="font-medium">{contact.first_contact_at ? format(new Date(contact.first_contact_at), "dd/MM/yyyy") : '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Última Interação</span>
                <span className="font-medium">{contact.last_interaction_at ? format(new Date(contact.last_interaction_at), "dd/MM HH:mm", { locale: ptBR }) : '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-2"><History className="w-4 h-4" /> Atendimentos</span>
                <Badge variant="secondary" className="font-black">{(contact.whatsapp_attendances as any[])?.length || 0}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Grupos</CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-primary">
                <Users className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(contact.whatsapp_contact_group_memberships as any[])?.length > 0 ? (
                  (contact.whatsapp_contact_group_memberships as any[]).map((m, idx) => (
                    <Badge 
                      key={idx} 
                      className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 font-bold px-3 py-1"
                      style={{ 
                        backgroundColor: `${m.whatsapp_contact_groups?.color}20`,
                        color: m.whatsapp_contact_groups?.color,
                        borderColor: `${m.whatsapp_contact_groups?.color}40`
                      }}
                    >
                      {m.whatsapp_contact_groups?.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">Sem grupos vinculados</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-muted border border-border w-full justify-start h-12 p-1 mb-6">
              <TabsTrigger value="overview" className="data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider px-6 h-full">Visão Geral</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider px-6 h-full">Histórico</TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider px-6 h-full">Observações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-black">Resumo do Perfil</CardTitle>
                  <CardDescription>Dados detalhados do contato registrados no sistema.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Documento / CPF</span>
                    <p className="font-medium">{contact.document || 'Não informado'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Canal de Entrada</span>
                    <p className="font-medium capitalize">{contact.channel || 'WhatsApp'}</p>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Observações do CRM</span>
                    <p className="text-muted-foreground leading-relaxed">
                      {contact.notes || 'Nenhuma observação geral adicionada a este contato.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-muted/30 border-dashed border-border flex items-center justify-center py-10">
                  <div className="text-center space-y-2">
                    <History className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-sm font-bold text-muted-foreground">Último Atendimento</p>
                    <p className="text-xs text-muted-foreground">Há 2 dias</p>
                  </div>
                </Card>
                <Card className="bg-muted/30 border-dashed border-border flex items-center justify-center py-10">
                  <div className="text-center space-y-2">
                    <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-sm font-bold text-muted-foreground">Mensagens Trocadas</p>
                    <p className="text-xs text-muted-foreground">42 mensagens</p>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                {(contact.whatsapp_attendances as any[])?.length > 0 ? (
                  (contact.whatsapp_attendances as any[]).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((att) => (
                    <Card key={att.id} className="bg-card border-border hover:border-primary/30 transition-all group">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "p-2 rounded-lg",
                              att.status === 'finalized' ? "bg-zinc-500/10 text-zinc-500" : "bg-emerald-500/10 text-emerald-500"
                            )}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">Protocolo: {att.protocol || att.id.slice(0,8)}</span>
                                <Badge className={cn(
                                  "text-[9px] font-black uppercase",
                                  att.status === 'finalized' ? "bg-zinc-500/10 text-zinc-500" : "bg-emerald-500/10 text-emerald-500"
                                )}>
                                  {att.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Iniciado em {format(new Date(att.created_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setSelectedAttendance({ id: att.id, protocol: att.protocol })}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed border-border">
                    <History className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                    <p className="text-muted-foreground">Nenhum histórico de atendimento.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notes">
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-black">Notas Internas</CardTitle>
                    <CardDescription>Anotações exclusivas para a equipe administrativa.</CardDescription>
                  </div>
                  <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 font-bold">
                    <Plus className="w-4 h-4" /> Adicionar Nota
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10">
                    <p className="text-muted-foreground text-sm italic">Nenhuma nota interna registrada para este contato.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AttendanceDetailModal 
        isOpen={!!selectedAttendance}
        onClose={() => setSelectedAttendance(null)}
        attendanceId={selectedAttendance?.id || null}
        protocol={selectedAttendance?.protocol}
      />
    </div>
  );
}

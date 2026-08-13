import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  Calendar,
  UserPlus,
  MessageSquare,
  FileText,
  Archive,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/contatos/')({
  component: ContactsPage,
});

function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['admin-contacts', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('whatsapp_contacts')
        .select(`
          *,
          whatsapp_contact_group_memberships(
            whatsapp_contact_groups(name, color)
          ),
          whatsapp_attendances(count)
        `)
        .order('last_interaction_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-contacts-stats'],
    queryFn: async () => {
      const { count: total } = await supabase.from('whatsapp_contacts').select('*', { count: 'exact', head: true });
      const { count: active } = await supabase.from('whatsapp_attendances').select('*', { count: 'exact', head: true }).eq('status', 'active');
      
      return { total, active };
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-manrope font-black tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Contatos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie clientes, grupos e históricos de atendimento de forma centralizada.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
            <UserPlus className="w-4 h-4" />
            Novo Contato
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Total de Contatos</CardDescription>
            <CardTitle className="text-2xl font-black">{stats?.total || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Atendimentos Ativos</CardDescription>
            <CardTitle className="text-2xl font-black text-primary">{stats?.active || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Novos Hoje</CardDescription>
            <CardTitle className="text-2xl font-black">0</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Sem Grupo</CardDescription>
            <CardTitle className="text-2xl font-black">0</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-md overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome, telefone ou e-mail..." 
              className="pl-10 bg-background border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="shrink-0 border-border">
              <Filter className="w-4 h-4" />
            </Button>
            <select 
              className="bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="blocked">Bloqueado</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="font-bold text-foreground">Contato</TableHead>
                <TableHead className="font-bold text-foreground">Telefone</TableHead>
                <TableHead className="font-bold text-foreground">Canal</TableHead>
                <TableHead className="font-bold text-foreground">Grupos</TableHead>
                <TableHead className="font-bold text-foreground">Última Interação</TableHead>
                <TableHead className="font-bold text-foreground">Status</TableHead>
                <TableHead className="text-right font-bold text-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse border-border">
                    <TableCell colSpan={7}>
                      <div className="h-10 bg-muted/50 rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : contacts?.length === 0 ? (
                <TableRow className="hover:bg-transparent border-border">
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Nenhum contato encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                contacts?.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-muted/30 border-border transition-colors group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-primary/20">
                          {contact.avatar_url ? (
                            <img src={contact.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                          ) : (
                            contact.name?.[0]?.toUpperCase() || '?'
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{contact.name || 'Sem nome'}</span>
                          {contact.email && <span className="text-[10px] text-muted-foreground truncate">{contact.email}</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {contact.phone}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter bg-muted/50 border-border">
                        {contact.channel || 'whatsapp'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(contact.whatsapp_contact_group_memberships as any[])?.slice(0, 2).map((m, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className="text-[9px] px-1.5 py-0 border-transparent text-white"
                            style={{ backgroundColor: m.whatsapp_contact_groups?.color || '#333' }}
                          >
                            {m.whatsapp_contact_groups?.name}
                          </Badge>
                        ))}
                        {(contact.whatsapp_contact_group_memberships as any[])?.length > 2 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{(contact.whatsapp_contact_group_memberships as any[]).length - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {contact.last_interaction_at ? format(new Date(contact.last_interaction_at), "dd MMM, HH:mm", { locale: ptBR }) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={cn(
                          "text-[10px] uppercase font-bold",
                          contact.status === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          contact.status === 'blocked' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                          "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                        )}
                      >
                        {contact.status === 'active' ? 'Ativo' : contact.status === 'blocked' ? 'Bloqueado' : 'Arquivado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border min-w-[160px]">
                          <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary focus:text-primary-foreground">
                            <FileText className="w-4 h-4" /> Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <MessageSquare className="w-4 h-4 text-primary" /> Abrir Chat
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Archive className="w-4 h-4 text-orange-500" /> Arquivar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

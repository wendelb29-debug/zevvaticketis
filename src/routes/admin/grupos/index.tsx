import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Plus, 
  MoreHorizontal, 
  Settings2,
  Trash2,
  Edit,
  Circle,
  Hash,
  Filter,
  Search,
  Users2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Route = createFileRoute('/admin/grupos/')({
  component: GroupsPage,
});

function GroupsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery({
    queryKey: ['admin-groups', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('whatsapp_contact_groups')
        .select(`
          *,
          whatsapp_contact_group_memberships(count)
        `)
        .order('name');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-groups-stats'],
    queryFn: async () => {
      const { count: totalGroups } = await supabase.from('whatsapp_contact_groups').select('*', { count: 'exact', head: true });
      const { count: totalMembers } = await supabase.from('whatsapp_contact_group_memberships').select('*', { count: 'exact', head: true });
      
      return { totalGroups, totalMembers };
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('whatsapp_contact_groups').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      toast.success('Grupo excluído com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir grupo: ' + error.message);
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-manrope font-black tracking-tight flex items-center gap-3 text-foreground">
            <Hash className="w-8 h-8 text-primary" />
            Grupos de Clientes
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize seus contatos em segmentos para atendimentos, campanhas e relatórios.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
            <Plus className="w-4 h-4" />
            Novo Grupo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Grupos Ativos</CardDescription>
            <CardTitle className="text-2xl font-black">{stats?.totalGroups || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Total de Membros</CardDescription>
            <CardTitle className="text-2xl font-black text-primary">{stats?.totalMembers || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-md overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome do grupo..." 
              className="pl-10 bg-background border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="shrink-0 border-border">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="font-bold text-foreground">Nome do Grupo</TableHead>
                <TableHead className="font-bold text-foreground">Cor</TableHead>
                <TableHead className="font-bold text-foreground">Membros</TableHead>
                <TableHead className="font-bold text-foreground">Criação</TableHead>
                <TableHead className="font-bold text-foreground">Status</TableHead>
                <TableHead className="text-right font-bold text-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse border-border">
                    <TableCell colSpan={6}>
                      <div className="h-10 bg-muted/50 rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : groups?.length === 0 ? (
                <TableRow className="hover:bg-transparent border-border">
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Nenhum grupo encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                groups?.map((group) => (
                  <TableRow key={group.id} className="hover:bg-muted/30 border-border transition-colors group">
                    <TableCell className="font-bold">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: group.color || '#3B82F6' }}
                        />
                        <span className="truncate">{group.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded border border-border font-mono">
                        {group.color || '#3B82F6'}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users2 className="w-4 h-4 text-primary/60" />
                        {(group.whatsapp_contact_group_memberships as any)?.[0]?.count || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(group.created_at), "dd MMM yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                        Ativo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Edit className="w-4 h-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Settings2 className="w-4 h-4" /> Gerenciar Membros
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir este grupo?')) {
                                deleteMutation.mutate(group.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" /> Excluir
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

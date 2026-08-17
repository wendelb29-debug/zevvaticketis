import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, Calendar, BarChart3, MoreHorizontal, Edit, Play, Pause, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


export function CampaignList() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: campaigns, isLoading, refetch } = useQuery({
    queryKey: ['ad-campaigns-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*, ad_advertisers(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ativa' ? 'pausada' : 'ativa';
    const { error } = await supabase
      .from('ad_campaigns')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar status');
    } else {
      toast.success(`Campanha ${newStatus === 'ativa' ? 'ativada' : 'pausada'}`);
      refetch();
    }
  };

  const filtered = campaigns?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ad_advertisers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar campanhas..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Nova Campanha
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Campanha / Anunciante</th>
              <th className="px-6 py-4">Período</th>
              <th className="px-6 py-4">Prioridade</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Carregando...</td></tr>
            ) : filtered?.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Nenhuma campanha encontrada.</td></tr>
            ) : filtered?.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-foreground text-sm">{campaign.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                      {campaign.ad_advertisers?.name || 'Sem anunciante'}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-[10px]">
                    <span className="flex items-center gap-1 text-foreground/70">
                      <Calendar className="h-3 w-3" /> 
                      {format(new Date(campaign.start_at), 'dd/MM/yy', { locale: ptBR })} - 
                      {format(new Date(campaign.end_at), 'dd/MM/yy', { locale: ptBR })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="text-[10px]">
                    P{campaign.priority}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge 
                    className={cn(
                      "text-[10px] uppercase font-bold",
                      campaign.status === 'ativa' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                    )}
                  >
                    {campaign.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleUpdateStatus(campaign.id, campaign.status)}
                    >
                      {campaign.status === 'ativa' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-green-500" />}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <BarChart3 className="h-4 w-4" /> Métricas
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit className="h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive">
                          <Trash2 className="h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

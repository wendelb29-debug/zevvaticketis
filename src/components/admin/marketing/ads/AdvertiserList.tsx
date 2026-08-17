import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, Building2, Mail, Globe, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AdvertiserList() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: advertisers, isLoading, refetch } = useQuery({
    queryKey: ['ad-advertisers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_advertisers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este anunciante?')) return;
    
    const { error } = await supabase
      .from('ad_advertisers')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir anunciante');
    } else {
      toast.success('Anunciante excluído');
      refetch();
    }
  };

  const filtered = advertisers?.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar anunciantes..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Novo Anunciante
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Anunciante</th>
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Carregando...</td></tr>
            ) : filtered?.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Nenhum anunciante encontrado.</td></tr>
            ) : filtered?.map((adv) => (
              <tr key={adv.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{adv.name}</p>
                      {adv.website && (
                        <a href={adv.website} target="_blank" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                          <Globe className="h-2 w-2" /> {adv.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}

                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-foreground/70 flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {adv.email || 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={adv.status === 'ativo' ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold">
                    {adv.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Edit className="h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(adv.id)}>
                        <Trash2 className="h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

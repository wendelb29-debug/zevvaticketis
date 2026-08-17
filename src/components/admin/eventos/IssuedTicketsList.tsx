import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Filter, 
  User, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Download,
  ExternalLink,
  Ticket as TicketIcon,
  Loader2,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface IssuedTicketsListProps {
  eventId: string;
}

export function IssuedTicketsList({ eventId }: IssuedTicketsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["issued-tickets", eventId || 'all'],
    queryFn: async () => {
      let query = supabase
        .from("tickets")
        .select(`
          *
        `);
      
      if (eventId) {
        query = query.eq("event_id", eventId);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const filteredTickets = tickets?.filter(t => 
    t.attendee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.attendee_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.token_hash?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Carregando Ingressos Emitidos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-3xl border border-border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Buscar por nome, e-mail ou código..." 
            className="pl-11 h-12 rounded-2xl border-border bg-accent/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="h-12 px-6 rounded-2xl border-border font-bold gap-2 flex-1 md:flex-none">
            <Filter className="w-4 h-4" /> Filtros
          </Button>
          <Button className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 flex-1 md:flex-none">
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      <div className="rounded-[32px] border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-muted-foreground pl-8">Participante</TableHead>
              <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Ingresso</TableHead>
              <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-muted-foreground text-center">Status</TableHead>
              <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Check-in</TableHead>
              <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-muted-foreground text-right pr-8">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets?.map((ticket) => (
              <TableRow key={ticket.id} className="hover:bg-accent/5 border-border">
                <TableCell className="py-4 pl-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-brand font-black text-sm border border-brand/5">
                      {ticket.attendee_name?.charAt(0) || "P"}
                    </div>
                    <div>
                      <p className="font-bold text-foreground leading-none mb-1">{ticket.attendee_name}</p>
                      <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {ticket.attendee_email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-bold text-foreground leading-none mb-1">{ticket.name || "Ingresso"}</p>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">{ticket.token_hash?.substring(0, 16)}...</p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                    ticket.status === 'utilizado' 
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                      : "bg-blue-100 text-blue-700 border-blue-200"
                  )}>
                    {ticket.status === 'utilizado' ? 'Utilizado' : 'Ativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {ticket.checked_in_at ? (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold">{new Date(ticket.checked_in_at).toLocaleString('pt-BR')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <XCircle className="w-4 h-4 opacity-30" />
                      <span className="text-xs font-medium">Não realizado</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right pr-8">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-accent">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-border shadow-xl font-inter">
                      <DropdownMenuItem className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-foreground cursor-pointer">
                        <ExternalLink className="w-4 h-4 text-brand" /> Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-foreground cursor-pointer">
                        <Mail className="w-4 h-4 text-blue-500" /> Reenviar E-mail
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-destructive cursor-pointer">
                        <XCircle className="w-4 h-4" /> Cancelar Ingresso
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredTickets?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <TicketIcon className="w-12 h-12 opacity-20" />
                    <p className="font-bold">Nenhum ingresso encontrado para os termos da busca.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

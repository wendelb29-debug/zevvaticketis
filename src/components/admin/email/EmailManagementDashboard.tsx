import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  CheckCircle2, 
  Eye, 
  AlertCircle, 
  RotateCcw, 
  Search,
  Filter,
  Download,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { resendTicketEmail } from "@/lib/email/email.functions";

export function EmailManagementDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["email-logs", statusFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("email_logs")
        .select(`
          *,
          events(title),
          tickets(id)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      
      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const handleResend = async (logId: string) => {
    try {
      await resendTicketEmail({ data: { logId } });
      toast.success("E-mail reenviado com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao reenviar e-mail.");
      console.error(error);
    }
  };

  const stats = {
    total: logs?.length || 0,
    delivered: logs?.filter(l => l.status === "delivered" || l.status === "sent").length || 0,
    opened: logs?.filter(l => l.status === "opened").length || 0,
    failed: logs?.filter(l => l.status === "failed").length || 0,
    resent: logs?.filter(l => (l.metadata as any)?.resend).length || 0,
  };

  const deliveryRate = stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(1) : 0;
  const openRate = stats.delivered > 0 ? ((stats.opened / stats.delivered) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-manrope font-extrabold text-foreground dark:text-creme">Gestão de Comunicação</h1>
          <p className="text-muted-foreground-foreground">Monitore e gerencie todos os envios de ingressos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("Exportação em breve")}>
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="TOTAL ENVIADOS" 
          value={stats.total} 
          icon={Mail} 
          description="Total de tentativas"
        />
        <StatCard 
          title="ENTREGUES" 
          value={stats.delivered} 
          icon={CheckCircle2} 
          description={`${deliveryRate}% de entrega`}
          color="text-green-600"
        />
        <StatCard 
          title="ABERTOS" 
          value={stats.opened} 
          icon={Eye} 
          description={`${openRate}% taxa de abertura`}
          color="text-blue-600"
        />
        <StatCard 
          title="FALHAS" 
          value={stats.failed} 
          icon={AlertCircle} 
          description="Erros de entrega"
          color="text-red-600"
        />
        <StatCard 
          title="REENVIADOS" 
          value={stats.resent} 
          icon={RotateCcw} 
          description="Envios manuais"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground-foreground" />
              <Input 
                placeholder="Buscar por e-mail ou assunto..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participante</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10">Carregando...</TableCell></TableRow>
              ) : logs?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10">Nenhum log encontrado.</TableCell></TableRow>
              ) : (
                logs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <p className="font-bold">{log.email}</p>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {(log.events as any)?.title || "N/A"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{log.subject}</TableCell>
                    <TableCell>
                      {format(new Date(log.created_at || ""), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={log.status} />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleResend(log.id)}>
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, description, color }: any) {
  return (
    <Card className="border-none shadow-md">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground-foreground">{title}</p>
          <Icon className={cn("w-4 h-4", color || "text-muted-foreground-foreground")} />
        </div>
        <p className={cn("text-2xl font-black", color)}>{value}</p>
        <p className="text-[10px] text-muted-foreground-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    sent: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
    opened: "bg-purple-100 text-purple-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <Badge variant="secondary" className={cn("text-[10px] font-black uppercase", styles[status] || "bg-gray-100")}>
      {status}
    </Badge>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

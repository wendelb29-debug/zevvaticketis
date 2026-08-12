import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  Ticket, 
  Users, 
  DollarSign, 
  Plus, 
  Download, 
  FileText,
  FileSpreadsheet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { exportToPDF, exportToExcel } from "@/lib/export";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

import { useTenants } from "@/hooks/use-tenants";

export function ProducerDashboardPanel() {
  const { activeTenant } = useTenants();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeEvents: 0,
    ticketsSold: 0,
    totalParticipants: 0,
    revenue: 0
  });
  const [events, setEvents] = useState<any[]>([]);
  const [salesReport, setSalesReport] = useState<any[]>([]);

  useEffect(() => {
    if (activeTenant) {
      fetchProducerData();
    }
  }, [activeTenant]);


  async function fetchProducerData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !activeTenant) return;

      const { data: eventsData } = await supabase
        .from("events")
        .select("*, ticket_types(*)")
        .eq("tenant_id", activeTenant.id);


      const activeEvents = eventsData?.filter(e => e.status === "publicado").length || 0;
      
      // Fetch orders for these events
      const eventIds = eventsData?.map(e => e.id) || [];
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .in("event_id", eventIds)
        .eq("status", "pago");

      const revenue = ordersData?.reduce((acc, curr) => acc + (Number(curr.valor_bruto) || 0), 0) || 0;
      const zevvaFees = ordersData?.reduce((acc, curr) => acc + (Number(curr.taxa_plataforma) || 0), 0) || 0;

      setStats({
        activeEvents,
        ticketsSold: ordersData?.length || 0,
        totalParticipants: ordersData?.length || 0,
        revenue: revenue - zevvaFees
      });

      setEvents(eventsData || []);

      setSalesReport(ordersData?.map(order => ({
        event: eventsData?.find(e => e.id === order.event_id)?.title || "Evento",
        ticket: "Ingresso Geral",
        quantity: 1,
        value: order.valor_bruto,
        fee: order.taxa_plataforma,
        net: order.valor_liquido_produtor
      })) || []);

    } catch (error) {
      console.error("Error fetching producer data:", error);
      toast.error("Erro ao carregar dados do produtor");
    } finally {
      setLoading(false);
    }
  }

  const handleExportPDF = () => {
    exportToPDF(
      salesReport,
      [
        { header: "Evento", key: "event" },
        { header: "Valor Bruto", key: "value" },
        { header: "Taxa", key: "fee" },
        { header: "Líquido", key: "net" }
      ],
      { title: "Relatório de Vendas - Produtor", fileName: "vendas_produtor" }
    );
    toast.success("PDF gerado");
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-manrope font-black text-navy tracking-tighter uppercase">📊 Dashboard do Projeto</h1>
          <p className="text-sm text-muted font-medium">Gestão integrada de vendas e operações em tempo real.</p>
        </div>
        <div className="flex gap-2">

          <Button asChild variant="outline" className="border-navy text-navy gap-2 px-6 rounded-xl font-bold">
            <Link to="/produtor/tickets">
              <Ticket className="w-5 h-5" /> Ver Ingressos
            </Link>
          </Button>
          <Button asChild className="bg-coral hover:bg-coral/90 text-white gap-2 px-6 rounded-xl font-bold">
            <Link to="/produtor/novo-evento">
              <Plus className="w-5 h-5" /> Criar Evento
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-fg">Eventos Ativos</CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-manrope font-extrabold text-navy">{stats.activeEvents}</div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-fg">Ingressos Vendidos</CardTitle>
            <Ticket className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-manrope font-extrabold text-navy">{stats.ticketsSold}</div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-fg">Participantes</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-manrope font-extrabold text-navy">{stats.totalParticipants}</div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-fg">Receita Líquida</CardTitle>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-manrope font-extrabold text-navy">
              R$ {stats.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-manrope font-bold">Relatório de Vendas</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-primary text-primary" onClick={handleExportPDF}>
              <FileText className="w-4 h-4" /> PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-2 border-primary text-primary" onClick={() => exportToExcel([{ name: "Vendas", data: salesReport }], "vendas_produtor")}>
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-accent/30">
                <TableHead className="font-bold">Evento</TableHead>
                <TableHead className="font-bold">Ingresso</TableHead>
                <TableHead className="font-bold">Qtd</TableHead>
                <TableHead className="font-bold">Valor Bruto</TableHead>
                <TableHead className="font-bold">Taxa Zevva</TableHead>
                <TableHead className="font-bold">Valor Líquido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesReport.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{row.event}</TableCell>
                  <TableCell>{row.ticket}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>R$ {row.value.toLocaleString()}</TableCell>
                  <TableCell className="text-destructive">- R$ {row.fee.toLocaleString()}</TableCell>
                  <TableCell className="text-emerald-600 font-bold">R$ {row.net.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {salesReport.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-fg">Nenhuma venda registrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

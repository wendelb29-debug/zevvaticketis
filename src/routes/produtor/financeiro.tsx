import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download,
  Calendar,
  Wallet
} from "lucide-react";
import { useTenants } from "@/hooks/use-tenants";


export const Route = createFileRoute("/produtor/financeiro")({
  component: FinanceiroPage,
});

function FinanceiroPage() {
  const { activeTenant } = useTenants();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["producer-financial-stats", activeTenant?.id],
    enabled: !!activeTenant,
    queryFn: async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("valor_bruto, taxa_plataforma, valor_liquido_produtor, created_at, status")
        .eq("tenant_id", activeTenant?.id || "")
        .eq("status", "pago");



      const faturamentoBruto = orders?.reduce((acc: number, curr: any) => acc + Number(curr.valor_bruto || 0), 0) || 0;
      const taxas = orders?.reduce((acc: number, curr: any) => acc + Number(curr.taxa_plataforma || 0), 0) || 0;
      const faturamentoLiquido = orders?.reduce((acc: number, curr: any) => acc + Number(curr.valor_liquido_produtor || 0), 0) || 0;


      return {
        bruto: faturamentoBruto,
        taxas: taxas,
        liquido: faturamentoLiquido,
        vendas: orders || []
      };
    }
  });

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-coral border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="container mx-auto py-8 space-y-8 font-inter">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-manrope font-extrabold text-foreground">Financeiro do Projeto</h1>
          <p className="text-muted-foreground font-medium">Acompanhe receitas, taxas e repasses deste ambiente.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-line">
            <Calendar className="mr-2 h-4 w-4" /> Últimos 30 dias
          </Button>
          <Button className="bg-navy text-primary-foreground hover:bg-navy/90 rounded-xl">
            <Download className="mr-2 h-4 w-4" /> Exportar Relatório
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-line overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Vendas Brutas</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">R$ {stats?.bruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            <p className="text-[10px] text-green-600 font-bold flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +12.5% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-line overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Comissão Zevva (10%)</CardTitle>
            <TrendingUp className="h-4 w-4 text-coral" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">R$ {stats?.taxas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            <p className="text-[10px] text-muted-foreground font-bold mt-1 italic">Retido automaticamente</p>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-card/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white/60">Saldo a Receber</CardTitle>
            <Wallet className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">R$ {stats?.liquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            <p className="text-[10px] text-white/60 font-bold mt-1">Previsão de repasse em 07 dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-manrope font-extrabold text-foreground">Histórico de Transações</h2>
        <Card className="bg-card border-line overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-accent/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-line">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Venda Bruta</th>
                  <th className="px-6 py-4">Comissão Zevva</th>
                  <th className="px-6 py-4 text-right">Seu Recebimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {stats?.vendas.map((venda: any, i: number) => (
                  <tr key={i} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">
                      {new Date(venda.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase px-2 py-1 rounded-full">
                        {venda.status === 'pago' ? 'Aprovado' : venda.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-muted-foreground-fg">
                      R$ {Number(venda.valor_bruto || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 font-medium text-coral">
                      - R$ {Number(venda.taxa_plataforma || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-foreground">
                      R$ {Number(venda.valor_liquido_produtor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>

                  </tr>
                ))}
                {stats?.vendas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                      Nenhuma transação registrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  Download,
  Calendar,
  Wallet,
  Loader2
} from "lucide-react";

export function FinanceiroView({ tenantId }: { tenantId: string }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-tenant-financial-stats", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("valor_bruto, taxa_plataforma, valor_liquido_produtor, created_at, status")
        .eq("tenant_id", tenantId)
        .eq("status", "pago");

      if (error) throw error;

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

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Carregando financeiro...</p>
    </div>
  );

  return (
    <div className="space-y-8 font-inter animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-manrope font-black text-foreground tracking-tighter uppercase">💰 Financeiro do Projeto</h1>
          <p className="text-muted-foreground font-medium text-sm">Acompanhe receitas, taxas e repasses deste tenant.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-border h-11 font-bold">
            <Calendar className="mr-2 h-4 w-4" /> Período
          </Button>
          <Button className="bg-navy text-primary-foreground hover:bg-navy/90 rounded-xl h-11 font-bold">
            <Download className="mr-2 h-4 w-4" /> Relatório
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border overflow-hidden rounded-[32px] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Vendas Brutas</CardTitle>
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
               <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-navy">R$ {stats?.bruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            <p className="text-[10px] text-green-600 font-bold flex items-center mt-2">
              <ArrowUpRight className="w-3 h-3 mr-1" /> Performance consolidada
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border overflow-hidden rounded-[32px] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Taxas Plataforma</CardTitle>
             <div className="w-8 h-8 bg-navy/5 rounded-xl flex items-center justify-center text-navy">
                <TrendingUp className="h-4 w-4" />
             </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-navy">R$ {stats?.taxas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            <p className="text-[10px] text-muted-foreground font-bold mt-2 italic">Retenção Zevva</p>
          </CardContent>
        </Card>

        <Card className="bg-navy text-primary-foreground border-none overflow-hidden relative rounded-[32px] shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground/60">Saldo Produtor</CardTitle>
            <Wallet className="h-4 w-4 text-primary-foreground/60" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-white">R$ {stats?.liquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            <p className="text-[10px] text-primary-foreground/60 font-bold mt-2">Disponível para saque</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-manrope font-black text-foreground uppercase tracking-tight">Histórico de Transações</h2>
        <Card className="bg-card border-border overflow-hidden rounded-[32px] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-8 py-5">Data</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Bruto</th>
                  <th className="px-8 py-5">Taxas</th>
                  <th className="px-8 py-5 text-right">Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {stats?.vendas.map((venda: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/10 transition-colors">
                    <td className="px-8 py-5 font-bold text-navy">
                      {new Date(venda.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-8 py-5">
                      <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100">
                        {venda.status === 'pago' ? 'Aprovado' : venda.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-medium text-muted-foreground">
                      R$ {Number(venda.valor_bruto || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-5 font-medium text-rose-500">
                      - R$ {Number(venda.taxa_plataforma || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-5 text-right font-black text-navy">
                      R$ {Number(venda.valor_liquido_produtor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {stats?.vendas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-muted-foreground font-medium italic">
                      Nenhuma transação registrada para este período.
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

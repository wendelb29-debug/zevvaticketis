import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, History } from "lucide-react";

export const Route = createFileRoute("/admin/auditoria")({
  component: AuditoriaPage,
});

function AuditoriaPage() {
  const { data: logs, isLoading: loadingActions } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data } = await (supabase
        .from("audit_logs" as any)
        .select("*, profiles(nome)")
        .order("created_at", { ascending: false }) as any);
      return data;
    }
  });

  const { data: accessLogs, isLoading: loadingAccess } = useQuery({
    queryKey: ["access-logs"],
    queryFn: async () => {
      const { data } = await (supabase
        .from("access_logs" as any)
        .select("*, profiles:admin_id(nome)")
        .order("created_at", { ascending: false }) as any);
      return data;
    }
  });

  if (loadingActions || loadingAccess) return <div className="p-10 text-center text-muted-foreground-fg">Carregando auditoria...</div>;

  return (
    <div className="space-y-6 text-foreground max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-manrope font-black text-foreground tracking-tighter uppercase flex items-center gap-3">
          <History className="w-8 h-8 text-primary" /> Auditoria do Sistema
        </h1>
        <p className="text-sm text-muted-foreground-fg font-medium">Monitoramento completo de ações administrativas e registrar tentativas negadas de acesso (ex.: quando um usuário recebe 403/404 por permissão) no painel de auditoria.</p>
      </div>

      <Tabs defaultValue="acoes" className="w-full">
        <TabsList className="bg-card border border-line p-1 rounded-2xl h-14 shadow-sm mb-8">
          <TabsTrigger value="acoes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] gap-2 transition-all">
            <History className="w-4 h-4" /> Ações do Sistema
          </TabsTrigger>
          <TabsTrigger value="acessos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] gap-2 transition-all">
            <ShieldAlert className="w-4 h-4" /> Auditoria de Acesso
          </TabsTrigger>
        </TabsList>

        <TabsContent value="acoes" className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-accent/50 text-muted-foreground-fg text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Admin</th>
                  <th className="px-8 py-5">Ação</th>
                  <th className="px-8 py-5">Alvo</th>
                  <th className="px-8 py-5">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-accent/30 transition-colors group">
                    <td className="px-8 py-6 font-bold text-foreground">{log.profiles?.nome || 'Sistema'}</td>
                    <td className="px-8 py-6 text-sm font-medium">{log.acao}</td>
                    <td className="px-8 py-6 text-sm font-medium">
                      <span className="text-primary">{log.alvo_tipo}</span>
                      <span className="text-muted-foreground-fg font-normal ml-2">({log.alvo_id})</span>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-bold text-muted-foreground-fg font-inter uppercase">{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="acessos" className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-accent/50 text-muted-foreground-fg text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Admin</th>
                  <th className="px-8 py-5">Recurso Visualizado</th>
                  <th className="px-8 py-5">Detalhe</th>
                  <th className="px-8 py-5">Data e Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {accessLogs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-accent/30 transition-colors group">
                    <td className="px-8 py-6 font-bold text-foreground">{log.profiles?.nome || 'Admin'}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-primary" />
                        <span className="text-sm font-black uppercase tracking-tight">{log.resource_type.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-medium text-muted-foreground-fg">{log.resource_id}</td>
                    <td className="px-8 py-6 text-[10px] font-bold text-muted-foreground-fg font-inter uppercase">{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
                {(!accessLogs || accessLogs.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-muted-foreground-fg font-inter">Nenhum log de acesso registrado ainda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Eye, RefreshCcw, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type AuditLog = {
  id: string;
  admin_id: string | null;
  acao: string;
  alvo_tipo: string;
  alvo_id: string;
  categoria: string | null;
  payload: any;
  dados_antes: any;
  dados_depois: any;
  created_at: string;
  profiles?: { nome: string | null; email: string | null; avatar_url: string | null } | null;
};

const PERIODOS = [
  { value: "all", label: "Selecionar período" },
  { value: "today", label: "Hoje" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
];

function countKeys(obj: any): number {
  if (!obj || typeof obj !== "object") return 0;
  let n = 0;
  for (const k of Object.keys(obj)) {
    n += 1;
    if (obj[k] && typeof obj[k] === "object") n += countKeys(obj[k]);
  }
  return n;
}

function JsonView({ value, tone }: { value: any; tone?: "add" | "remove" }) {
  const text = JSON.stringify(value ?? {}, null, 2);
  const lines = text.split("\n");
  return (
    <div className="rounded-lg border border-border bg-accent/30 overflow-auto max-h-[50vh] font-mono text-[11px] leading-5">
      {lines.map((line, i) => (
        <div
          key={i}
          className={cn(
            "flex gap-3 px-3 whitespace-pre",
            tone === "add" && line.trim() && line.trim() !== "{" && line.trim() !== "}" && "bg-emerald-500/15",
            tone === "remove" && line.trim() && "bg-destructive/15",
          )}
        >
          <span className="select-none text-muted-fg/60 w-6 text-right shrink-0">{i + 1}</span>
          <span className="text-foreground">{line}</span>
        </div>
      ))}
    </div>
  );
}

export function AuditoriaPanel() {
  const [search, setSearch] = useState("");
  const [acao, setAcao] = useState("all");
  const [usuario, setUsuario] = useState("all");
  const [periodo, setPeriodo] = useState("all");
  const [perPage, setPerPage] = useState("10");
  const [page, setPage] = useState(1);
  const [payloadLog, setPayloadLog] = useState<AuditLog | null>(null);
  const [diffLog, setDiffLog] = useState<AuditLog | null>(null);

  const { data: logs = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["audit-logs-full"],
    queryFn: async () => {
      const { data } = await (supabase
        .from("audit_logs" as any)
        .select("*, profiles:admin_id(nome, email, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(1000) as any);
      return (data ?? []) as AuditLog[];
    },
  });

  const acoes = useMemo(
    () => Array.from(new Set(logs.map((l) => l.acao).filter(Boolean))).sort(),
    [logs],
  );
  const usuarios = useMemo(() => {
    const map = new Map<string, string>();
    logs.forEach((l) => {
      if (l.admin_id) map.set(l.admin_id, l.profiles?.nome || l.profiles?.email || "Usuário");
    });
    return Array.from(map.entries());
  }, [logs]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const cut =
      periodo === "today" ? new Date(new Date().setHours(0, 0, 0, 0)).getTime()
      : periodo === "7d" ? now - 7 * 864e5
      : periodo === "30d" ? now - 30 * 864e5
      : periodo === "90d" ? now - 90 * 864e5
      : 0;
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      if (acao !== "all" && l.acao !== acao) return false;
      if (usuario !== "all" && l.admin_id !== usuario) return false;
      if (cut && new Date(l.created_at).getTime() < cut) return false;
      if (!q) return true;
      return [l.acao, l.alvo_tipo, l.alvo_id, l.categoria, l.profiles?.nome, l.profiles?.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [logs, acao, usuario, periodo, search]);

  const size = Number(perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * size, current * size);

  const resetPage = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(1); };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-start gap-3 px-5 py-4 border-b border-border">
          <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-bold text-foreground">Auditoria</h3>
            <p className="text-xs text-muted-fg">eu garantir que apenas administradores possam visualizar e auditar as ações.</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-end gap-3 px-5 py-4 border-b border-border">
          <div className="min-w-[200px] flex-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-fg">Pesquisar</label>
            <Input value={search} onChange={(e) => resetPage(setSearch)(e.target.value)} className="h-9 mt-1" placeholder="Ação, alvo, usuário..." />
          </div>
          <div className="w-[170px]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-fg">Ação</label>
            <Select value={acao} onValueChange={resetPage(setAcao)}>
              <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {acoes.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[190px]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-fg">Usuários</label>
            <Select value={usuario} onValueChange={resetPage(setUsuario)}>
              <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {usuarios.map(([id, nome]) => <SelectItem key={id} value={id}>{nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-fg">Período</label>
            <Select value={periodo} onValueChange={resetPage(setPeriodo)}>
              <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PERIODOS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 border border-border" onClick={() => refetch()} title="Atualizar">
            <RefreshCcw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-bold text-muted-fg">Mostrar</span>
            <Select value={perPage} onValueChange={resetPage(setPerPage)}>
              <SelectTrigger className="h-9 w-[80px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["10", "25", "50", "100"].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-accent/40 text-muted-fg text-[11px] font-extrabold uppercase tracking-widest border-b border-border">
              <tr>
                <th className="px-5 py-3">Data e hora</th>
                <th className="px-5 py-3">Usuário</th>
                <th className="px-5 py-3">Ação</th>
                <th className="px-5 py-3">Payload</th>
                <th className="px-5 py-3">Alterações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-fg animate-pulse">Carregando registros...</td></tr>
              )}
              {!isLoading && rows.map((log) => {
                const nome = log.profiles?.nome || "Sistema";
                const changes = countKeys(log.dados_depois);
                return (
                  <tr key={log.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-5 py-3 text-sm text-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-extrabold overflow-hidden shrink-0">
                          {log.profiles?.avatar_url
                            ? <img src={log.profiles.avatar_url} alt={nome} className="w-full h-full object-cover" />
                            : nome.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="leading-tight">
                          <div className="text-sm font-bold text-foreground">{nome}</div>
                          <div className="text-[11px] text-muted-fg">{log.profiles?.email || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="leading-tight">
                        <div className="text-sm font-semibold text-foreground">{log.acao}</div>
                        <div className="text-[11px] font-mono text-muted-fg">{log.alvo_tipo}.{log.alvo_id?.slice(0, 8)}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => setPayloadLog(log)} className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Ver Payload
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => setDiffLog(log)} className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Ver alterações ({changes})
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-fg">Nenhum registro de auditoria encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-t border-border">
          <span className="text-xs text-muted-fg">
            Mostrando {filtered.length === 0 ? 0 : (current - 1) * size + 1} até {Math.min(current * size, filtered.length)} de {filtered.length} registros
          </span>
          <span className="text-xs text-muted-fg mx-auto">Página {current} de {totalPages}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 border border-border" disabled={current <= 1} onClick={() => setPage(current - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 border border-border" disabled={current >= totalPages} onClick={() => setPage(current + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={!!payloadLog} onOpenChange={(o) => !o && setPayloadLog(null)}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader><DialogTitle>Payload</DialogTitle></DialogHeader>
          <JsonView value={payloadLog?.payload} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!diffLog} onOpenChange={(o) => !o && setDiffLog(null)}>
        <DialogContent className="max-w-4xl bg-card">
          <DialogHeader><DialogTitle>Alterações</DialogTitle></DialogHeader>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-muted-fg mb-1.5">Antes</p>
              <JsonView value={diffLog?.dados_antes} tone="remove" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-fg mb-1.5">Depois</p>
              <JsonView value={diffLog?.dados_depois} tone="add" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

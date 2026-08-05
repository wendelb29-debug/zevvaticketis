import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  BookOpen,
  Plus,
  RefreshCw,
  Pencil,
  ArrowLeftRight,
  PieChart,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

type Member = {
  id: string;
  name: string;
  email: string;
  departments: string[];
  supervision: string[];
  permission: string;
  status: "online" | "offline";
};

const ALL_DEPARTMENTS = ["Atendimento", "Benefícios Ativos", "Adm", "Comercial"];
const PERMISSIONS = [
  "Atendente (Padrão)",
  "Atendente",
  "Supervisor (Padrão)",
  "Supervisor",
  "Administrador",
];

const INITIAL_MEMBERS: Member[] = [
  { id: "1", name: "Thaylla Floriano Gonçalves", email: "thayllathayy1@gmail.com", departments: ["Atendimento"], supervision: [], permission: "Atendente (Padrão)", status: "offline" },
  { id: "2", name: "Gabriel Vitor Moreira Era", email: "apgabrielera@gmail.com", departments: ["Benefícios Ativos"], supervision: [], permission: "Atendente (Padrão)", status: "offline" },
  { id: "3", name: "João Ricardo", email: "joaomenezessav1200@gmail.com", departments: ["Atendimento"], supervision: [], permission: "Atendente", status: "offline" },
  { id: "4", name: "Matheus Damasceno", email: "damascenomatheus74@outlook.com", departments: ["Atendimento"], supervision: [], permission: "Atendente (Padrão)", status: "offline" },
  { id: "5", name: "Miucha Bittencourt", email: "bittencourtmiucha@gmail.com", departments: ["Atendimento"], supervision: [], permission: "Atendente", status: "offline" },
  { id: "6", name: "Alice Vieira", email: "alicevieiraii214@gmail.com", departments: ["Atendimento"], supervision: [], permission: "Atendente (Padrão)", status: "offline" },
  { id: "7", name: "Kamilla Sousa", email: "kamillasavecar@gmail.com", departments: ["Benefícios Ativos"], supervision: [], permission: "Atendente (Padrão)", status: "offline" },
  { id: "8", name: "Maria Eduarda Cristine Rosa Garrao", email: "garraoeduarda@gmail.com", departments: ["Adm"], supervision: [], permission: "Atendente (Padrão)", status: "offline" },
  { id: "9", name: "Wendel Bondim", email: "wendelb29@gmail.com", departments: ["Benefícios Ativos"], supervision: ["Atendimento"], permission: "Supervisor (Padrão)", status: "online" },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function TeamManagement() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("todas");
  const [pageSize, setPageSize] = useState("10");
  const [invitesOpen, setInvitesOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [transferring, setTransferring] = useState<Member | null>(null);
  const [transferTo, setTransferTo] = useState("");
  const [statsFor, setStatsFor] = useState<Member | null>(null);
  const [removing, setRemoving] = useState<Member | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", department: ALL_DEPARTMENTS[0]!, permission: PERMISSIONS[0]! });
  const [invites, setInvites] = useState([
    { id: "i1", email: "novo.agente@savecar.com", sentAt: "02/08/2026", status: "Pendente" },
    { id: "i2", email: "supervisor@savecar.com", sentAt: "28/07/2026", status: "Aceito" },
  ]);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase());
      const matchesDept = deptFilter === "todas" || m.departments.includes(deptFilter);
      return matchesSearch && matchesDept;
    });
  }, [members, search, deptFilter]);

  const visible = filtered.slice(0, Number(pageSize));

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5 border-b border-border">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-primary mt-1" />
          <div>
            <h3 className="font-manrope font-extrabold text-lg text-foreground">Gerenciar equipe</h3>
            <p className="text-sm text-muted-fg">Gerencie os membros da equipe e seus acessos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setInvitesOpen(true)}>
            <BookOpen className="w-4 h-4" /> Convites enviados
          </Button>
          <Button className="gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Adicionar usuário
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end justify-between gap-4 px-6 py-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-fg">Pesquisar</Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`${filtered.length} registros`}
              className="w-64"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-fg">Departamentos</Label>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {ALL_DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setMembers([...INITIAL_MEMBERS]); toast.success("Lista atualizada"); }}
            title="Atualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-fg">Mostrar</span>
          <Select value={pageSize} onValueChange={setPageSize}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["10", "25", "50", "100"].map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-6">
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Usuário</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Departamentos de atendimento</TableHead>
                <TableHead>Departamentos de supervisão</TableHead>
                <TableHead>Permissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {initials(m.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-foreground">{m.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-primary">{m.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.departments.map((d) => (
                        <Badge key={d} variant="outline" className="font-normal">{d}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.supervision.map((d) => (
                        <Badge key={d} variant="outline" className="font-normal">{d}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-fg">{m.permission}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={m.status === "online"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 font-normal"
                        : "text-muted-fg font-normal"}
                    >
                      {m.status === "online" ? "Online" : "Offline"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => setEditing({ ...m })}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Transferir atendimentos" onClick={() => { setTransferring(m); setTransferTo(""); }}>
                        <ArrowLeftRight className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Desempenho" onClick={() => setStatsFor(m)}>
                        <PieChart className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Remover" onClick={() => setRemoving(m)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-fg py-10">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add user */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Adicionar usuário</DialogTitle>
            <DialogDescription>Envie um convite de acesso para um novo membro.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Departamento</Label>
                <Select value={newUser.department} onValueChange={(v) => setNewUser({ ...newUser, department: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Permissão</Label>
                <Select value={newUser.permission} onValueChange={(v) => setNewUser({ ...newUser, permission: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PERMISSIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!newUser.name || !newUser.email) {
                  toast.error("Preencha nome e e-mail.");
                  return;
                }
                setMembers([
                  ...members,
                  {
                    id: crypto.randomUUID(),
                    name: newUser.name,
                    email: newUser.email,
                    departments: [newUser.department],
                    supervision: [],
                    permission: newUser.permission,
                    status: "offline",
                  },
                ]);
                setInvites([{ id: crypto.randomUUID(), email: newUser.email, sentAt: new Date().toLocaleDateString("pt-BR"), status: "Pendente" }, ...invites]);
                setNewUser({ name: "", email: "", department: ALL_DEPARTMENTS[0]!, permission: PERMISSIONS[0]! });
                setAddOpen(false);
                toast.success("Convite enviado!");
              }}
            >
              Enviar convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invites */}
      <Dialog open={invitesOpen} onOpenChange={setInvitesOpen}>
        <DialogContent className="bg-card border-border sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Convites enviados</DialogTitle>
            <DialogDescription>Acompanhe o status dos convites de acesso.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {invites.map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{i.email}</p>
                  <p className="text-xs text-muted-fg">Enviado em {i.sentAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-normal">{i.status}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setInvites(invites.filter((x) => x.id !== i.id)); toast.success("Convite cancelado"); }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {invites.length === 0 && <p className="text-sm text-muted-fg py-6 text-center">Nenhum convite pendente.</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
            <DialogDescription>{editing?.email}</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Departamento de atendimento</Label>
                <Select
                  value={editing.departments[0] ?? ""}
                  onValueChange={(v) => setEditing({ ...editing, departments: [v] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Permissão</Label>
                <Select value={editing.permission} onValueChange={(v) => setEditing({ ...editing, permission: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PERMISSIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!editing) return;
                setMembers(members.map((m) => (m.id === editing.id ? editing : m)));
                setEditing(null);
                toast.success("Usuário atualizado");
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer */}
      <Dialog open={!!transferring} onOpenChange={(o) => !o && setTransferring(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Transferir atendimentos</DialogTitle>
            <DialogDescription>
              Mover os atendimentos de {transferring?.name} para outro agente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Destino</Label>
            <Select value={transferTo} onValueChange={setTransferTo}>
              <SelectTrigger><SelectValue placeholder="Selecione um agente" /></SelectTrigger>
              <SelectContent>
                {members.filter((m) => m.id !== transferring?.id).map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferring(null)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!transferTo) { toast.error("Selecione um agente."); return; }
                setTransferring(null);
                toast.success("Atendimentos transferidos");
              }}
            >
              Transferir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <Dialog open={!!statsFor} onOpenChange={(o) => !o && setStatsFor(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Desempenho — {statsFor?.name}</DialogTitle>
            <DialogDescription>Resumo dos últimos 30 dias.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Atendimentos", value: "128" },
              { label: "Tempo médio", value: "4m 12s" },
              { label: "Satisfação", value: "94%" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border p-4 text-center">
                <p className="text-2xl font-manrope font-extrabold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-fg">{s.label}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove */}
      <Dialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Remover usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover {removing?.name}? Esta ação revoga o acesso imediatamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                setMembers(members.filter((m) => m.id !== removing?.id));
                setRemoving(null);
                toast.success("Usuário removido");
              }}
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

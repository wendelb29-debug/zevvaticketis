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
  Send,

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

type Invite = {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  status: "Aceito" | "Pendente" | "Expirado";
};

const INVITE_ROLES = ["Atendente", "Supervisor", "Administrador"];

const INITIAL_INVITES: Invite[] = [
  { id: "i1", email: "thayllathayy1@gmail.com", role: "Atendente", invitedBy: "Rafael Marcenes", createdAt: "27/07/2026, 11:40:18", expiresAt: "03/08/2026, 11:40:18", status: "Aceito" },
  { id: "i2", email: "apgabrielera@gmail.com", role: "Atendente", invitedBy: "Wendel Bondim", createdAt: "17/07/2026, 10:49:13", expiresAt: "24/07/2026, 10:49:13", status: "Aceito" },
  { id: "i3", email: "joaomenezessav1200@gmail.com", role: "Atendente", invitedBy: "Rafael Marcenes", createdAt: "16/07/2026, 16:02:09", expiresAt: "23/07/2026, 16:02:09", status: "Aceito" },
  { id: "i4", email: "bittencourtmiucha@gmail.com", role: "Atendente", invitedBy: "Rafael Marcenes", createdAt: "16/07/2026, 15:33:38", expiresAt: "23/07/2026, 15:33:38", status: "Aceito" },
  { id: "i5", email: "joaomeneezea1200@gmail.com", role: "Atendente", invitedBy: "Rafael Marcenes", createdAt: "16/07/2026, 15:33:06", expiresAt: "23/07/2026, 17:03:24", status: "Expirado" },
  { id: "i6", email: "kamillasavecar@gmail.com", role: "Atendente", invitedBy: "Rafael Marcenes", createdAt: "16/07/2026, 15:33:05", expiresAt: "23/07/2026, 15:33:05", status: "Aceito" },
  { id: "i7", email: "damascenomatheus74@outlook.com", role: "Atendente", invitedBy: "Rafael Marcenes", createdAt: "16/07/2026, 15:33:05", expiresAt: "23/07/2026, 15:33:05", status: "Aceito" },
  { id: "i8", email: "alicevieiraii214@gmail.com", role: "Atendente", invitedBy: "Rafael Marcenes", createdAt: "16/07/2026, 15:33:05", expiresAt: "23/07/2026, 15:33:05", status: "Aceito" },
  { id: "i9", email: "juliandreoup@gmail.com", role: "Atendente", invitedBy: "Rafael Marcenes", createdAt: "16/07/2026, 15:33:04", expiresAt: "23/07/2026, 15:33:04", status: "Expirado" },
  { id: "i10", email: "garraoeduarda@gmail.com", role: "Atendente", invitedBy: "Rafael Marcenes", createdAt: "16/07/2026, 09:20:48", expiresAt: "23/07/2026, 09:20:48", status: "Aceito" },
  { id: "i11", email: "novo.agente@savecar.com", role: "Atendente", invitedBy: "Wendel Bondim", createdAt: "02/08/2026, 09:12:00", expiresAt: "09/08/2026, 09:12:00", status: "Pendente" },
  { id: "i12", email: "supervisor@savecar.com", role: "Supervisor", invitedBy: "Wendel Bondim", createdAt: "28/07/2026, 14:05:22", expiresAt: "04/08/2026, 14:05:22", status: "Pendente" },
];

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
  const [invites, setInvites] = useState<Invite[]>(INITIAL_INVITES);
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteStatus, setInviteStatus] = useState("todos");
  const [inviteRole, setInviteRole] = useState("todos");
  const [inviteBy, setInviteBy] = useState("todos");
  const [invitePageSize, setInvitePageSize] = useState("10");
  const [invitePage, setInvitePage] = useState(1);

  const filteredInvites = useMemo(() => {
    const q = inviteSearch.trim().toLowerCase();
    return invites.filter((i) =>
      (!q || i.email.toLowerCase().includes(q) || i.invitedBy.toLowerCase().includes(q)) &&
      (inviteStatus === "todos" || i.status === inviteStatus) &&
      (inviteRole === "todos" || i.role === inviteRole) &&
      (inviteBy === "todos" || i.invitedBy === inviteBy)
    );
  }, [invites, inviteSearch, inviteStatus, inviteRole, inviteBy]);

  const invitePerPage = Number(invitePageSize);
  const inviteTotalPages = Math.max(1, Math.ceil(filteredInvites.length / invitePerPage));
  const invitePageSafe = Math.min(invitePage, inviteTotalPages);
  const invitesPageRows = filteredInvites.slice((invitePageSafe - 1) * invitePerPage, invitePageSafe * invitePerPage);
  const inviteSenders = Array.from(new Set(invites.map((i) => i.invitedBy)));


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
                setInvites([
                  {
                    id: crypto.randomUUID(),
                    email: newUser.email,
                    role: newUser.permission.includes("Supervisor") ? "Supervisor" : newUser.permission.includes("Admin") ? "Administrador" : "Atendente",
                    invitedBy: "Você",
                    createdAt: new Date().toLocaleString("pt-BR"),
                    expiresAt: new Date(Date.now() + 7 * 864e5).toLocaleString("pt-BR"),
                    status: "Pendente",
                  },
                  ...invites,
                ]);
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
        <DialogContent className="bg-card border-border max-w-[95vw] sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Convites enviados</DialogTitle>
            <DialogDescription>Aqui você pode visualizar os convites enviados de usuários para o projeto.</DialogDescription>
          </DialogHeader>

          {/* Filters */}
          <div className="rounded-xl border border-border bg-background/40 p-4 flex flex-wrap items-end gap-4">
            <div className="space-y-1.5 min-w-[200px] flex-1">
              <Label className="text-xs">Pesquisar</Label>
              <Input
                placeholder="Email ou convidado por..."
                value={inviteSearch}
                onChange={(e) => { setInviteSearch(e.target.value); setInvitePage(1); }}
              />
            </div>
            <div className="space-y-1.5 w-40">
              <Label className="text-xs">Status</Label>
              <Select value={inviteStatus} onValueChange={(v) => { setInviteStatus(v); setInvitePage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Aceito">Aceito</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Expirado">Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 w-40">
              <Label className="text-xs">Cargo</Label>
              <Select value={inviteRole} onValueChange={(v) => { setInviteRole(v); setInvitePage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {INVITE_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 w-44">
              <Label className="text-xs">Convidado por</Label>
              <Select value={inviteBy} onValueChange={(v) => { setInviteBy(v); setInvitePage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {inviteSenders.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 w-28">
              <Label className="text-xs">Mostrar</Label>
              <Select value={invitePageSize} onValueChange={(v) => { setInvitePageSize(v); setInvitePage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["10", "25", "50"].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border overflow-x-auto max-h-[45vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Convidado por</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Válido até</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitesPageRows.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium text-foreground">{i.email}</TableCell>
                    <TableCell className="text-muted-fg">{i.role}</TableCell>
                    <TableCell className="text-muted-fg">{i.invitedBy}</TableCell>
                    <TableCell className="text-muted-fg whitespace-nowrap">{i.createdAt}</TableCell>
                    <TableCell className="text-muted-fg whitespace-nowrap">{i.expiresAt}</TableCell>
                    <TableCell>
                      <span className={
                        i.status === "Aceito" ? "text-sm font-semibold text-emerald-500"
                        : i.status === "Expirado" ? "text-sm font-semibold text-amber-500"
                        : "text-sm font-semibold text-primary"
                      }>{i.status}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Reenviar convite"
                          disabled={i.status === "Aceito"}
                          onClick={() => {
                            setInvites(invites.map((x) => x.id === i.id ? {
                              ...x,
                              status: "Pendente",
                              createdAt: new Date().toLocaleString("pt-BR"),
                              expiresAt: new Date(Date.now() + 7 * 864e5).toLocaleString("pt-BR"),
                            } : x));
                            toast.success(`Convite reenviado para ${i.email}`);
                          }}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Excluir convite"
                          onClick={() => {
                            setInvites(invites.filter((x) => x.id !== i.id));
                            toast.success("Convite excluído");
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {invitesPageRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-fg py-8">Nenhum convite encontrado.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-fg">
            <span>
              Mostrando {filteredInvites.length === 0 ? 0 : (invitePageSafe - 1) * invitePerPage + 1} até{" "}
              {Math.min(invitePageSafe * invitePerPage, filteredInvites.length)} de {filteredInvites.length} registros
            </span>
            <span>Página {invitePageSafe} de {inviteTotalPages}</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={invitePageSafe === 1} onClick={() => setInvitePage(invitePageSafe - 1)}>
                Anterior
              </Button>
              {Array.from({ length: inviteTotalPages }).map((_, idx) => (
                <Button
                  key={idx}
                  variant={idx + 1 === invitePageSafe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInvitePage(idx + 1)}
                >
                  {idx + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={invitePageSafe === inviteTotalPages} onClick={() => setInvitePage(invitePageSafe + 1)}>
                Próxima
              </Button>
            </div>
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

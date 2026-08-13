import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Shield, Plus, Search, Filter, Edit2, Copy, Users, Trash2, 
  ChevronRight, AlertTriangle, Check, Info, Layout, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  getPermissionDefinitions, 
  getProjectRoles, 
  upsertProjectRole, 
  deleteProjectRole 
} from "@/lib/permissions.functions";

interface PermissionsRolesManagerProps {
  tenantId: string;
}

export function PermissionsRolesManager({ tenantId }: PermissionsRolesManagerProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  // Queries
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["project-roles", tenantId],
    queryFn: () => getProjectRoles({ tenantId })
  });

  const { data: permissionDefs = [], isLoading: isLoadingDefs } = useQuery({
    queryKey: ["permission-definitions"],
    queryFn: () => getPermissionDefinitions()
  });

  // Mutations
  const upsertMutation = useMutation({
    mutationFn: upsertProjectRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-roles", tenantId] });
      toast.success(editingRole?.id ? "Cargo atualizado com sucesso!" : "Cargo criado com sucesso!");
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar cargo.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProjectRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-roles", tenantId] });
      toast.success("Cargo excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir cargo.");
    }
  });

  // Filters
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" ? true : (statusFilter === "active" ? role.is_active : !role.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [roles, searchTerm, statusFilter]);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, any[]> = {};
    permissionDefs.forEach(def => {
      if (!groups[def.module]) groups[def.module] = [];
      groups[def.module].push(def);
    });
    return groups;
  }, [permissionDefs]);

  const handleOpenModal = (role?: any) => {
    if (role) {
      setEditingRole(role);
      setSelectedPermissions(role.role_permissions?.map((rp: any) => rp.permission_id) || []);
    } else {
      setEditingRole({ name: "", description: "", color: "#E8604A", is_active: true });
      setSelectedPermissions([]);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingRole.name || !editingRole.description) {
      toast.error("Nome e descrição são obrigatórios.");
      return;
    }
    
    upsertMutation.mutate({
      id: editingRole.id,
      tenantId,
      name: editingRole.name,
      description: editingRole.description,
      color: editingRole.color,
      isActive: editingRole.is_active,
      permissionIds: selectedPermissions
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cargo?")) {
      deleteMutation.mutate({ id, tenantId });
    }
  };

  const togglePermission = (id: string) => {
    setSelectedPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleModule = (module: string, defs: any[]) => {
    const allIds = defs.map(d => d.id);
    const someSelected = allIds.some(id => selectedPermissions.includes(id));
    
    if (someSelected) {
      setSelectedPermissions(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...allIds])]);
    }
  };

  if (isLoadingRoles || isLoadingDefs) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total de cargos", value: roles.length, icon: Layers },
          { label: "Cargos ativos", value: roles.filter(r => r.is_active).length, icon: Shield },
          { label: "Usuários vinculados", value: roles.reduce((acc, r) => acc + (r.users_count || 0), 0), icon: Users },
          { label: "Sem usuários", value: roles.filter(r => (r.users_count || 0) === 0).length, icon: AlertTriangle },
        ].map((stat, i) => (
          <Card key={i} className="border-border bg-card/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-manrope font-extrabold text-foreground">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-primary/20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle className="text-xl font-manrope font-extrabold">Permissões e Cargos</CardTitle>
            <CardDescription>Defina o que cada cargo pode visualizar e executar.</CardDescription>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-primary text-primary-foreground font-bold gap-2">
            <Plus className="w-4 h-4" /> Novo cargo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome..." 
                className="pl-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={statusFilter === "all" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStatusFilter("all")}
                className="font-bold text-xs"
              >Todos</Button>
              <Button 
                variant={statusFilter === "active" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStatusFilter("active")}
                className="font-bold text-xs"
              >Ativos</Button>
              <Button 
                variant={statusFilter === "inactive" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStatusFilter("inactive")}
                className="font-bold text-xs"
              >Inativos</Button>
            </div>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-accent/40 text-muted-foreground text-[10px] font-extrabold uppercase tracking-widest border-b border-border">
                <tr>
                  <th className="px-6 py-4">Nome do cargo</th>
                  <th className="px-6 py-4">Permissões</th>
                  <th className="px-6 py-4">Usuários</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRoles.map(role => (
                  <tr key={role.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: role.color || '#E8604A' }} />
                        <div>
                          <p className="font-bold text-foreground">{role.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{role.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="font-bold text-[10px]">{role.permissions_count} permissões</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-bold">{role.users_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {role.is_system ? (
                        <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 text-[9px] font-bold">SISTEMA</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] font-bold">CUSTOM</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={role.is_active ? "default" : "secondary"} className={cn("text-[9px] font-bold", role.is_active ? "bg-emerald-500 hover:bg-emerald-600" : "")}>
                        {role.is_active ? "ATIVO" : "INATIVO"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(role)} title="Editar">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                          const newRole = { ...role, id: undefined, name: `${role.name} (Cópia)`, is_system: false, is_protected: false };
                          handleOpenModal(newRole);
                          setSelectedPermissions(role.role_permissions?.map((rp: any) => rp.permission_id) || []);
                        }} title="Duplicar">
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        {!role.is_protected && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                            onClick={() => handleDelete(role.id)}
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Editor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0 overflow-hidden bg-card border-border">
          <DialogHeader className="p-6 border-b border-border">
            <DialogTitle className="text-2xl font-manrope font-extrabold">
              {editingRole?.id ? "Editar Cargo" : "Novo Cargo"}
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes e as permissões granulares para este cargo.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Nome do Cargo <span className="text-primary">*</span></Label>
                  <Input 
                    value={editingRole?.name || ""} 
                    onChange={e => setEditingRole({...editingRole, name: e.target.value})}
                    placeholder="Ex: Supervisor de Atendimento"
                    disabled={editingRole?.is_protected}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Cor identificadora</Label>
                  <div className="flex gap-2 h-10 items-center">
                    {["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#E8604A", "#6366f1", "#a855f7"].map(color => (
                      <button
                        key={color}
                        onClick={() => setEditingRole({...editingRole, color})}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-all",
                          editingRole?.color === color ? "border-foreground scale-110" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">Descrição <span className="text-primary">*</span></Label>
                <Input 
                  value={editingRole?.description || ""} 
                  onChange={e => setEditingRole({...editingRole, description: e.target.value})}
                  placeholder="Descreva brevemente as responsabilidades deste cargo"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">Matriz de Permissões</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="xs" onClick={() => setSelectedPermissions([])} className="text-[10px] font-bold">LIMPAR TODAS</Button>
                    <Button variant="outline" size="xs" onClick={() => setSelectedPermissions(permissionDefs.map(d => d.id))} className="text-[10px] font-bold">MARCAR TODAS</Button>
                  </div>
                </div>

                <Accordion type="multiple" className="w-full space-y-3">
                  {Object.entries(groupedPermissions).map(([module, defs]) => {
                    const selectedCount = defs.filter(d => selectedPermissions.includes(d.id)).length;
                    return (
                      <AccordionItem key={module} value={module} className="border border-border rounded-xl px-4 bg-background/50">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            id={`mod-${module}`} 
                            checked={selectedCount === defs.length}
                            onCheckedChange={() => toggleModule(module, defs)}
                            className="w-4 h-4"
                          />
                          <AccordionTrigger className="hover:no-underline py-4 flex-1">
                            <div className="flex items-center gap-2 text-left">
                              <span className="font-bold text-sm uppercase tracking-wider">{module}</span>
                              <Badge variant="secondary" className="text-[9px] font-bold">{selectedCount}/{defs.length}</Badge>
                            </div>
                          </AccordionTrigger>
                        </div>
                        <AccordionContent className="pb-4 pt-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                            {defs.map(def => (
                              <div key={def.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card/30 hover:bg-accent/50 transition-colors">
                                <Checkbox 
                                  id={def.id} 
                                  checked={selectedPermissions.includes(def.id)}
                                  onCheckedChange={() => togglePermission(def.id)}
                                />
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <label htmlFor={def.id} className="text-xs font-bold leading-none cursor-pointer">{def.name}</label>
                                    {def.risk_level === 'crítico' && (
                                      <Badge variant="destructive" className="text-[8px] h-3 px-1 font-bold">CRÍTICO</Badge>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground leading-tight">{def.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 border-t border-border bg-accent/10">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="font-bold">Cancelar</Button>
            <Button 
              onClick={handleSave} 
              disabled={upsertMutation.isPending}
              className="bg-primary text-primary-foreground font-bold px-8"
            >
              {upsertMutation.isPending ? "Salvando..." : "Salvar Cargo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContactGroups, updateContactGroups, createContactGroup } from "@/lib/whatsapp/sidebar.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarGroupsProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  tenantId: string;
}

export function SidebarGroups({ isOpen, onClose, contactId, tenantId }: SidebarGroupsProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const { data: groups, isLoading } = useQuery({
    queryKey: ['contact-groups', tenantId, contactId],
    queryFn: () => getContactGroups({ data: { tenantId, contactId } }),
    enabled: isOpen
  });

  const updateMutation = useMutation({
    mutationFn: (groupIds: string[]) => updateContactGroups({ data: { contactId, groupIds } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-groups', tenantId, contactId] });
      toast.success("Grupos atualizados com sucesso");
      onClose();
    },
    onError: (err: any) => {
      toast.error("Erro ao atualizar grupos: " + err.message);
    }
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createContactGroup({ data: { tenantId, name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-groups', tenantId, contactId] });
      setNewGroupName("");
      setIsCreating(false);
      toast.success("Grupo criado com sucesso");
    }
  });

  const filteredGroups = groups?.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleToggleGroup = (groupId: string, isChecked: boolean) => {
    if (!groups) return;
    const currentSelected = groups.filter(g => g.isMember).map(g => g.id);
    let nextSelected: string[];
    if (isChecked) {
      nextSelected = [...currentSelected, groupId];
    } else {
      nextSelected = currentSelected.filter(id => id !== groupId);
    }
    updateMutation.mutate(nextSelected);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Grupos do cliente</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Edite os grupos aos quais este cliente pertence.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome do grupo..." 
              className="bg-accent border-none pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[300px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum grupo encontrado.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredGroups.map(group => (
                  <div 
                    key={group.id} 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors border border-transparent hover:border-border"
                  >
                    <Checkbox 
                      id={group.id} 
                      checked={group.isMember}
                      onCheckedChange={(checked) => handleToggleGroup(group.id, !!checked)}
                      disabled={updateMutation.isPending}
                    />
                    <label 
                      htmlFor={group.id} 
                      className="flex-1 text-sm font-medium cursor-pointer flex items-center justify-between"
                    >
                      <span>{group.name}</span>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color || '#E35B62' }} />
                    </label>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {isCreating ? (
            <div className="space-y-3 pt-4 border-t border-border">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Novo Grupo</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Nome do grupo" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="bg-accent border-none h-9 text-sm"
                />
                <Button 
                  size="sm" 
                  onClick={() => createMutation.mutate(newGroupName)}
                  disabled={!newGroupName.trim() || createMutation.isPending}
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full border-dashed border-border hover:border-primary/50 text-xs text-muted-foreground hover:text-primary transition-all gap-2"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="w-3.5 h-3.5" /> Criar novo grupo
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={updateMutation.isPending}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

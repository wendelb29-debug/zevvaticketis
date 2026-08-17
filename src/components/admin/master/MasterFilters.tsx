import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter } from "lucide-react";

interface MasterFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: any;
  onApply: (filters: any) => void;
  onClear: () => void;
}

export function MasterFilters({ open, onOpenChange, filters, onApply, onClear }: MasterFiltersProps) {
  const isMobile = useIsMobile();
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApply(localFilters);
    onOpenChange(false);
  };

  const Content = () => (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-8 py-6">
          {/* Status e Plano */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Status do Projeto</Label>
              <Select 
                value={localFilters.status || "all"} 
                onValueChange={(v) => setLocalFilters({ ...localFilters, status: v === "all" ? undefined : v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="aprovado">Ativo</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Plano</Label>
              <Select 
                value={localFilters.plan || "all"} 
                onValueChange={(v) => setLocalFilters({ ...localFilters, plan: v === "all" ? undefined : v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Todos os Planos" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Localização e Moeda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">País</Label>
              <Input 
                placeholder="Código do país (ex: BR)" 
                value={localFilters.country || ""} 
                onChange={(e) => setLocalFilters({ ...localFilters, country: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Moeda</Label>
              <Input 
                placeholder="Ex: BRL, USD" 
                value={localFilters.currency || ""} 
                onChange={(e) => setLocalFilters({ ...localFilters, currency: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Filtros Numéricos: Usuários */}
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Membros da Equipe</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                type="number" 
                placeholder="Mínimo" 
                value={localFilters.minUsers || ""} 
                onChange={(e) => setLocalFilters({ ...localFilters, minUsers: e.target.value ? Number(e.target.value) : undefined })}
                className="rounded-xl"
              />
              <Input 
                type="number" 
                placeholder="Máximo" 
                value={localFilters.maxUsers || ""} 
                onChange={(e) => setLocalFilters({ ...localFilters, maxUsers: e.target.value ? Number(e.target.value) : undefined })}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Filtros Numéricos: GMV */}
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">GMV (Volume de Vendas)</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                type="number" 
                placeholder="Mínimo BRL" 
                value={localFilters.minGmv || ""} 
                onChange={(e) => setLocalFilters({ ...localFilters, minGmv: e.target.value ? Number(e.target.value) : undefined })}
                className="rounded-xl"
              />
              <Input 
                type="number" 
                placeholder="Máximo BRL" 
                value={localFilters.maxGmv || ""} 
                onChange={(e) => setLocalFilters({ ...localFilters, maxGmv: e.target.value ? Number(e.target.value) : undefined })}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Flags de Comportamento */}
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              className={localFilters.hasSales ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "rounded-xl"}
              onClick={() => setLocalFilters({ ...localFilters, hasSales: !localFilters.hasSales })}
            >
              Com Vendas Registradas
            </Button>
            <Button 
              variant="outline" 
              className={localFilters.hasEvents ? "bg-navy/5 border-navy/20 text-navy" : "rounded-xl"}
              onClick={() => setLocalFilters({ ...localFilters, hasEvents: !localFilters.hasEvents })}
            >
              Com Eventos Criados
            </Button>
          </div>
        </div>
      </ScrollArea>

      <div className="flex gap-2 pt-6 border-t border-border mt-auto">
        <Button variant="ghost" className="flex-1 rounded-xl font-bold" onClick={onClear}>
          Limpar
        </Button>
        <Button className="flex-1 bg-navy hover:bg-navy/90 text-primary-foreground rounded-xl font-black shadow-lg shadow-navy/20 uppercase tracking-widest text-[10px]" onClick={handleApply}>
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="p-6 max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-manrope font-black">Filtros Avançados</DrawerTitle>
            <DrawerDescription className="font-medium">Refine sua busca por projetos e performance.</DrawerDescription>
          </DrawerHeader>
          <Content />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] p-8 border-border/50">
        <SheetHeader className="pb-6 border-b border-border">
          <SheetTitle className="text-3xl font-manrope font-black flex items-center gap-3">
            <Filter className="w-6 h-6 text-navy" />
            Filtros
          </SheetTitle>
          <SheetDescription className="font-medium text-base">
            Configure parâmetros globais para a consulta no servidor.
          </SheetDescription>
        </SheetHeader>
        <Content />
      </SheetContent>
    </Sheet>
  );
}

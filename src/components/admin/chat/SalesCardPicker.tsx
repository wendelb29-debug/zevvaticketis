import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Ticket, CreditCard } from "lucide-react";

interface SalesCardPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ticket: any) => void;
}

export function SalesCardPicker({ isOpen, onClose, onSelect }: SalesCardPickerProps) {
  const [search, setSearch] = useState("");
  
  // Mock data for demo
  const tickets = [
    { id: "1", title: "Ingresso VIP Israel 2027", price: "R$ 4.500,00", type: "Caravana" },
    { id: "2", title: "Workhop Liderança", price: "R$ 250,00", type: "Curso" },
    { id: "3", title: "Combo Família Congresso", price: "R$ 890,00", type: "Evento" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-primary-foreground uppercase font-black tracking-tighter">Gerar Proposta de Venda</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar ingresso ou pacote..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted border-border"
            />
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelect(t)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-card hover:bg-primary/5 border border-border hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center text-primary border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground dark:text-foreground">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-primary">{t.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold uppercase text-[10px]">Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

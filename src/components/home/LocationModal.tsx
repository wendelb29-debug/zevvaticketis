import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Target, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: string | null) => void;
}

const regions = [
  {
    name: "BRASIL",
    cities: ["São Paulo", "Uberlândia", "Rio de Janeiro"]
  },
  {
    name: "ESTADOS UNIDOS",
    cities: ["Orlando", "Miami", "Nova York"]
  },
  {
    name: "EUROPA",
    cities: ["Lisboa", "Madri"]
  },
  {
    name: "ORIENTE MÉDIO",
    cities: ["Jerusalém"]
  }
];

export function LocationModal({ isOpen, onClose, onSelect }: LocationModalProps) {
  const [search, setSearch] = useState("");
  const [locating, setLocating] = useState(false);

  const handleGeoLocation = () => {
    setLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, we'd reverse geocode here. 
          // For now, we'll simulate finding no matching city to show the requested empty state logic if needed,
          // or just fallback to "Nenhum evento perto de você".
          setLocating(false);
          onSelect("nearby"); // Special value to handle the "None found" logic
        },
        () => {
          setLocating(false);
        }
      );
    } else {
      setLocating(false);
    }
  };

  const filteredRegions = regions.map(reg => ({
    ...reg,
    cities: reg.cities.filter(c => c.toLowerCase().includes(search.toLowerCase()))
  })).filter(reg => reg.cities.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 rounded-[16px] bg-card border-0 shadow-2xl overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-manrope font-extrabold text-foreground">Localização</DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Onde?" 
              className="h-12 pl-11 rounded-xl border-line bg-surface/50 focus:bg-card focus:ring-coral transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto pb-6">
          <button 
            onClick={handleGeoLocation}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-surface transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center text-coral group-hover:bg-coral group-hover:text-white transition-all">
              <Target className={cn("w-5 h-5", locating && "animate-spin")} />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Usar minha localização atual</p>
              <p className="text-xs text-muted-foreground font-medium">Encontre eventos perto de você</p>
            </div>
          </button>

          <div className="h-px bg-line mx-6 my-2" />

          <button 
            onClick={() => onSelect(null)}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-surface transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-muted-foreground group-hover:text-coral transition-all">
              <MapPin className="w-5 h-5" />
            </div>
            <p className="font-bold text-foreground text-sm">Qualquer lugar</p>
          </button>

          {filteredRegions.map((region) => (
            <div key={region.name} className="mt-4">
              <p className="px-6 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2">{region.name}</p>
              {region.cities.map((city) => (
                <button 
                  key={city}
                  onClick={() => onSelect(city)}
                  className="w-full flex items-center gap-4 px-6 py-3 hover:bg-surface transition-colors text-left group"
                >
                  <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-coral transition-all" />
                  <p className="font-bold text-foreground text-sm">{city}</p>
                </button>
              ))}
            </div>
          ))}

          {search && filteredRegions.length === 0 && (
            <div className="px-6 py-12 text-center space-y-2">
              <p className="text-foreground font-bold">Nenhuma cidade encontrada</p>
              <p className="text-sm text-muted-foreground">Tente buscar por outro termo</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
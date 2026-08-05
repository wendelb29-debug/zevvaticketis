import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  User as UserIcon, 
  ShieldCheck, 
  Briefcase,
  ChevronDown,
  Monitor,
  Palette,
  Type,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Sliders
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useLocation } from "@tanstack/react-router";
import { useUI, type Theme } from "@/hooks/use-ui";

interface UserMenuProps {
  user: any;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  agentStatus?: 'online' | 'busy' | 'offline';
  onStatusChange?: (status: 'online' | 'busy' | 'offline') => void;
  onOpenSettings?: () => void;
}

export function UserMenu({ user, onLogout, onNavigate, agentStatus, onStatusChange, onOpenSettings }: UserMenuProps) {
  const [role, setRole] = useState<{ label: string; color: string } | null>(null);
  const { theme, setTheme, fontSize, setFontSize } = useUI();
  const location = useLocation();
  const isChat = location.pathname === "/admin/chat";

  useEffect(() => {
    async function fetchRole() {
      if (!user) return;

      // Check Admin
      const { data: admin } = await supabase
        .from("platform_admins")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (admin) {
        setRole({ label: "Admin", color: "bg-destructive/10 text-destructive border-destructive/20" });
        return;
      }

      // Check Producer
      const { data: member } = await supabase
        .from("organization_members")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (member) {
        setRole({ label: "Produtor", color: "bg-primary/10 text-primary border-primary/20" });
        return;
      }

      // Default Participant
      setRole({ label: "Participante", color: "bg-good/10 text-good border-good/20" });
    }
    fetchRole();
  }, [user]);

  const initials = user?.user_metadata?.nome 
    ? user.user_metadata.nome.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 p-1 rounded-full hover:bg-primary/5 transition-all outline-none group border border-transparent hover:border-border">
          <Avatar className="h-8 w-8 border-2 border-white shadow-sm ring-1 ring-border">
            <AvatarFallback className="bg-foreground text-background text-[10px] font-extrabold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isChat && (
            <div className={cn(
              "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
              agentStatus === 'online' ? "bg-green-500" : agentStatus === 'busy' ? "bg-amber-500" : "bg-foreground/20"
            )} />
          )}
          <div className="flex items-center gap-1">
             <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 mt-2 rounded-xl p-0 border-border shadow-2xl font-inter overflow-hidden bg-popover/95 backdrop-blur-md">
        <DropdownMenuLabel className="px-4 py-5 bg-gradient-to-br from-foreground/5 to-transparent">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-extrabold text-foreground truncate">
              {user?.user_metadata?.nome || user?.email}
            </p>
            <p className="text-[11px] text-muted-foreground font-medium truncate mb-1">
              {user?.email}
            </p>
            {role && (
              <span className={cn(
                "w-fit px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border",
                role.color
              )}>
                {role.label}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border m-0" />
        
        <div className="p-1.5">
          {isChat && onStatusChange && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-foreground cursor-pointer hover:bg-primary/5">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  agentStatus === 'online' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : 
                  agentStatus === 'busy' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : 
                  "bg-foreground/20"
                )} />
                <span className="capitalize">{agentStatus || 'Offline'}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-40 rounded-xl p-1.5 border-border shadow-xl font-inter bg-popover/95 backdrop-blur-md">
                  <DropdownMenuItem onClick={() => onStatusChange('online')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-foreground cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> Online
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange('busy')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-foreground cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-amber-500" /> Ocupado
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange('offline')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-foreground cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-foreground/20" /> Offline
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}

          <DropdownMenuItem 
            onClick={() => onNavigate("/app/perfil")}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-foreground cursor-pointer hover:bg-primary/5"
          >
            <UserIcon className="w-4 h-4 text-muted-foreground" />
            Minha Conta
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-foreground cursor-pointer hover:bg-primary/5">
              <Palette className="w-4 h-4 text-muted-foreground" />
              Alterar tema
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-40 rounded-xl p-1.5 border-border shadow-xl font-inter bg-popover/95 backdrop-blur-md">
                <DropdownMenuItem onClick={() => setTheme('light')} className={cn("text-xs font-bold text-foreground cursor-pointer", theme === 'light' && "bg-card")}>Claro</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className={cn("text-xs font-bold text-foreground cursor-pointer", theme === 'dark' && "bg-card")}>Escuro</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className={cn("text-xs font-bold text-foreground cursor-pointer", theme === 'system' && "bg-card")}>Sistema</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-foreground cursor-pointer hover:bg-primary/5">
              <Type className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-1 justify-between items-center">
                <span>Tamanho do texto</span>
                <span className="text-[10px] text-muted-foreground">{fontSize}%</span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-56 rounded-xl p-4 border-border shadow-xl font-inter bg-popover/95 backdrop-blur-md">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ajustar zoom</p>
                    <span className="text-[10px] font-bold text-primary">{fontSize}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-primary/5"
                    >
                      -
                    </button>
                    <div className="flex-1 px-1">
                      <input 
                        type="range"
                        min="80"
                        max="150"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                    <button 
                      onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-primary/5"
                    >
                      +
                    </button>
                  </div>
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

        
        {role?.label === "Admin" && (
          <DropdownMenuItem 
            onClick={() => onNavigate("/admin")}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-foreground cursor-pointer hover:bg-primary/5"
          >
            <ShieldCheck className="w-4 h-4 text-destructive" />
            Painel Admin
          </DropdownMenuItem>
        )}

        {role?.label === "Produtor" && (
          <DropdownMenuItem 
            onClick={() => onNavigate("/produtor")}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-foreground cursor-pointer hover:bg-primary/5"
          >
            <Briefcase className="w-4 h-4 text-primary" />
            Painel Produtor
          </DropdownMenuItem>
        )}

          {isChat && onOpenSettings ? (
            <DropdownMenuItem 
              onClick={onOpenSettings}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold text-foreground cursor-pointer hover:bg-primary/5"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-muted-foreground" />
                Configurações
              </div>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => onNavigate("/admin/configuracoes")}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-foreground cursor-pointer hover:bg-primary/5"
            >
              <SettingsIcon className="w-4 h-4 text-muted-foreground" />
              Configurações
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-border mx-2" />
          <DropdownMenuItem 
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-destructive cursor-pointer hover:bg-destructive/5"
          >
            <LogOut className="w-4 h-4 text-destructive/60" />
            Sair
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

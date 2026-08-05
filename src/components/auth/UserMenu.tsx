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
        setRole({ label: "Produtor", color: "bg-coral/10 text-coral border-coral/20" });
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
        <button className="flex items-center gap-2 p-1 rounded-full hover:bg-surface transition-all outline-none group border border-transparent hover:border-line">
          <Avatar className="h-8 w-8 border-2 border-white shadow-sm ring-1 ring-line">
            <AvatarFallback className="bg-navy text-white text-[10px] font-extrabold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isChat && (
            <div className={cn(
              "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
              agentStatus === 'online' ? "bg-green-500" : agentStatus === 'busy' ? "bg-amber-500" : "bg-navy/20"
            )} />
          )}
          <div className="flex items-center gap-1">
             <ChevronDown className="w-4 h-4 text-muted group-hover:text-navy transition-colors" />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 mt-2 rounded-xl p-0 border-line shadow-2xl font-inter overflow-hidden bg-white/95 backdrop-blur-md">
        <DropdownMenuLabel className="px-4 py-5 bg-gradient-to-br from-navy/5 to-transparent">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-extrabold text-navy truncate">
              {user?.user_metadata?.nome || user?.email}
            </p>
            <p className="text-[11px] text-navy/40 font-medium truncate mb-1">
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
        <DropdownMenuSeparator className="bg-line m-0" />
        
        <div className="p-1.5">
          {isChat && onStatusChange && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-navy cursor-pointer hover:bg-surface">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  agentStatus === 'online' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : 
                  agentStatus === 'busy' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : 
                  "bg-navy/20"
                )} />
                <span className="capitalize">{agentStatus || 'Offline'}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-40 rounded-xl p-1.5 border-line shadow-xl font-inter bg-white/95 backdrop-blur-md">
                  <DropdownMenuItem onClick={() => onStatusChange('online')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-navy cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> Online
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange('busy')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-navy cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-amber-500" /> Ocupado
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange('offline')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-navy cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-navy/20" /> Offline
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}

          <DropdownMenuItem 
            onClick={() => onNavigate("/app/perfil")}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-navy cursor-pointer hover:bg-surface"
          >
            <UserIcon className="w-4 h-4 text-navy/40" />
            Minha Conta
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-navy cursor-pointer hover:bg-surface">
              <Palette className="w-4 h-4 text-navy/40" />
              Alterar tema
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-40 rounded-xl p-1.5 border-line shadow-xl font-inter bg-white/95 dark:bg-[#1A1D29]/95 backdrop-blur-md">
                <DropdownMenuItem onClick={() => setTheme('light')} className={cn("text-xs font-bold text-navy dark:text-white cursor-pointer", theme === 'light' && "bg-surface dark:bg-white/10")}>Claro</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className={cn("text-xs font-bold text-navy dark:text-white cursor-pointer", theme === 'dark' && "bg-surface dark:bg-white/10")}>Escuro</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className={cn("text-xs font-bold text-navy dark:text-white cursor-pointer", theme === 'system' && "bg-surface dark:bg-white/10")}>Sistema</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-navy cursor-pointer hover:bg-surface">
              <Type className="w-4 h-4 text-navy/40" />
              <div className="flex flex-1 justify-between items-center">
                <span>Tamanho do texto</span>
                <span className="text-[10px] text-navy/40">{fontSize}%</span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-56 rounded-xl p-4 border-line shadow-xl font-inter bg-white/95 dark:bg-[#1A1D29]/95 backdrop-blur-md">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-navy/40">Ajustar zoom</p>
                    <span className="text-[10px] font-bold text-coral">{fontSize}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-line text-navy dark:text-white hover:bg-surface dark:hover:bg-white/10"
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
                        className="w-full h-1 bg-line rounded-full appearance-none cursor-pointer accent-coral"
                      />
                    </div>
                    <button 
                      onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-line text-navy dark:text-white hover:bg-surface dark:hover:bg-white/10"
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
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-navy cursor-pointer hover:bg-surface"
          >
            <ShieldCheck className="w-4 h-4 text-destructive" />
            Painel Admin
          </DropdownMenuItem>
        )}

        {role?.label === "Produtor" && (
          <DropdownMenuItem 
            onClick={() => onNavigate("/produtor")}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-navy cursor-pointer hover:bg-surface"
          >
            <Briefcase className="w-4 h-4 text-coral" />
            Painel Produtor
          </DropdownMenuItem>
        )}

          {isChat && onOpenSettings ? (
            <DropdownMenuItem 
              onClick={onOpenSettings}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold text-navy cursor-pointer hover:bg-surface"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-navy/40" />
                Configurações
              </div>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => onNavigate("/admin/configuracoes")}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-navy cursor-pointer hover:bg-surface"
            >
              <SettingsIcon className="w-4 h-4 text-navy/40" />
              Configurações
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-line mx-2" />
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

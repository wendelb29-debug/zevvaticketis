import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  User as UserIcon, 
  ShieldCheck, 
  Briefcase,
  ChevronDown
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  user: any;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

export function UserMenu({ user, onLogout, onNavigate }: UserMenuProps) {
  const [role, setRole] = useState<{ label: string; color: string } | null>(null);

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
        setRole({ label: "Produtor", color: "bg-gold/10 text-gold border-gold/20" });
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
          <div className="flex items-center gap-1">
             <ChevronDown className="w-4 h-4 text-muted group-hover:text-navy transition-colors" />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl p-2 border-line shadow-xl font-inter">
        <DropdownMenuLabel className="px-3 py-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-extrabold text-navy truncate">
              {user?.user_metadata?.nome || user?.email}
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
        <DropdownMenuSeparator className="bg-line mx-2" />
        
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
            <Briefcase className="w-4 h-4 text-gold" />
            Painel Produtor
          </DropdownMenuItem>
        )}

        <DropdownMenuItem 
          onClick={() => onNavigate("/app")}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-navy cursor-pointer hover:bg-surface"
        >
          <UserIcon className="w-4 h-4 text-navy" />
          Minha Área
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-line mx-2" />
        <DropdownMenuItem 
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-destructive cursor-pointer hover:bg-destructive/5"
        >
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUI } from "@/hooks/use-ui";
import { getTranslations } from "@/lib/i18n-utils";
import { useAvatarUrl } from "@/lib/avatar";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AccountMenuProps {
  user: any;
  onLogout: () => Promise<void>;
  onNavigate: (path: string) => void;
  onOpenAuth: () => void;
}

export function AccountMenu({ user, onLogout, onNavigate, onOpenAuth }: AccountMenuProps) {
  const { language } = useUI();
  const t = getTranslations(language);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const avatarUrl = useAvatarUrl(profile?.avatar_url);

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        className="h-10 px-6 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-primary-hover transition-all rounded-sm shadow-lg shadow-primary/10"
      >
        {t.nav['login']}
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 p-1 rounded-sm hover:bg-background transition-all outline-none group border border-transparent hover:border-border">
          <div className="relative w-8 h-8 rounded-sm overflow-hidden bg-accent/10 border border-border">
            <Avatar className="w-full h-full rounded-sm">
              <AvatarImage src={avatarUrl} alt={profile?.nome || ""} className="object-cover" />
              <AvatarFallback className="bg-accent/10 text-accent text-xs font-bold rounded-sm">
                {profile?.nome?.charAt(0) || user.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 mt-2 rounded-sm border-border bg-popover shadow-2xl p-2 z-[60]"
      >
        <div className="px-3 py-4 border-b border-border mb-2">
          <p className="text-xs font-bold text-foreground truncate">{profile?.nome || "Usuário"}</p>
          <p className="text-[10px] font-medium text-muted-foreground truncate">{user.email}</p>
        </div>

        <DropdownMenuItem
          onClick={() => onNavigate("/app")}
          className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer rounded-sm hover:bg-background text-muted-foreground hover:text-primary transition-colors focus:bg-background focus:text-primary"
        >
          <LayoutDashboard className="w-4 h-4" />
          {t.footer['producerPanel']}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onNavigate("/app/perfil")}
          className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer rounded-sm hover:bg-background text-muted-foreground hover:text-primary transition-colors focus:bg-background focus:text-primary"
        >
          <User className="w-4 h-4" />
          {t.nav['profile'] || "Meu Perfil"}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2 bg-border" />

        <DropdownMenuItem
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer rounded-sm hover:bg-danger/5 text-danger transition-colors focus:bg-danger/5 focus:text-danger"
        >
          <LogOut className="w-4 h-4" />
          {t.nav['logout'] || "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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

interface AccountMenuProps {
  user: any;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  onOpenAuth: () => void;
}

export function AccountMenu({ user, onLogout, onNavigate, onOpenAuth }: AccountMenuProps) {
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        className="h-10 px-6 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary-hover transition-all rounded-sm shadow-lg shadow-primary/10"
      >
        Entrar
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 p-1 rounded-sm hover:bg-background transition-all outline-none group border border-transparent hover:border-border">
          <div className="relative w-8 h-8 rounded-sm overflow-hidden bg-accent/10 border border-border">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.nome || ''} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-accent/10 text-accent text-xs font-bold">
                {profile?.nome?.charAt(0) || user.email?.charAt(0)}
              </div>
            )}
          </div>
          <ChevronDown className="w-3 h-3 text-foreground-muted group-hover:text-primary transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-2 rounded-sm border-border bg-surface-elevated shadow-2xl p-2 z-[60]">
        <div className="px-3 py-4 border-b border-border mb-2">
          <p className="text-xs font-bold text-foreground truncate">{profile?.nome || 'Usuário'}</p>
          <p className="text-[10px] font-medium text-foreground-muted truncate">{user.email}</p>
        </div>
        
        <DropdownMenuItem 
          onClick={() => onNavigate('/app')}
          className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer rounded-sm hover:bg-background text-foreground-muted hover:text-primary transition-colors focus:bg-background focus:text-primary"
        >
          <LayoutDashboard className="w-4 h-4" />
          Painel do Produtor
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => onNavigate('/app/perfil')}
          className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer rounded-sm hover:bg-background text-foreground-muted hover:text-primary transition-colors focus:bg-background focus:text-primary"
        >
          <User className="w-4 h-4" />
          Meu Perfil
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2 bg-border" />
        
        <DropdownMenuItem 
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer rounded-sm hover:bg-danger/5 text-danger transition-colors focus:bg-danger/5 focus:text-danger"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  User as UserIcon, 
  HelpCircle,
  Menu,
  Heart,
  Calendar,
  PlusCircle,
  Settings,
  LogOut,
  ChevronRight,
  UserCircle,
  Globe
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface AccountMenuProps {
  user: any;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  onOpenAuth: (view?: 'login' | 'register') => void;
}

export function AccountMenu({ user, onLogout, onNavigate, onOpenAuth }: AccountMenuProps) {
  const [profile, setProfile] = useState<any>(null);
  const [isProducer, setIsProducer] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      
      setProfile(profileData);

      if (profileData) {
        const fields = ["nome", "telefone", "documento", "pais_id", "idioma_preferido"] as const;
        const filledFields = fields.filter(f => profileData[f]);
        setCompletionPercentage(filledFields.length * 20);
      }

      const { data: member } = await supabase
        .from("organization_members")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      setIsProducer(!!member);
    }
    fetchData();
  }, [user]);

  const initials = profile?.nome 
    ? profile.nome.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase();

  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-line hover:border-coral/30 hover:shadow-sm transition-all outline-none bg-white">
            <Menu className="w-4 h-4 text-navy" />
            <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-line">
              <UserIcon className="w-4 h-4 text-navy/40" />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 mt-2 rounded-[20px] p-2 border-line shadow-2xl font-manrope bg-white">
          <DropdownMenuItem 
            onClick={() => onOpenAuth('login')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-extrabold text-navy cursor-pointer hover:bg-surface transition-colors"
          >
            <UserCircle className="w-4 h-4 text-coral" />
            Entrar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onOpenAuth('register')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-extrabold text-navy cursor-pointer hover:bg-surface transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-coral" />
            Cadastrar
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-line mx-2" />
          <DropdownMenuItem 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-extrabold text-navy cursor-pointer hover:bg-surface transition-colors"
          >
            <Globe className="w-4 h-4 text-muted" />
            Português (BR)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-line hover:border-coral/30 hover:shadow-sm transition-all outline-none bg-white">
          <Menu className="w-4 h-4 text-navy" />
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral/20 to-coral/40 flex items-center justify-center border border-coral/30">
            <span className="text-[10px] font-extrabold text-navy">{initials}</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[280px] mt-2 rounded-[16px] p-0 border-line shadow-xl overflow-hidden font-manrope bg-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 flex items-center gap-3 bg-surface/30">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coral/20 to-coral/40 flex items-center justify-center border border-coral/30 shadow-sm">
            <span className="text-sm font-extrabold text-navy">{initials}</span>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-extrabold text-navy truncate max-w-[180px]">
              {profile?.nome || "Usuário"}
            </p>
            <p className="text-[10px] text-muted font-bold truncate max-w-[180px]">
              {user?.email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-line m-0" />

        {/* Profile Completion Card */}
        {completionPercentage < 100 && (
          <div className="p-3">
            <div className="bg-navy rounded-xl p-4 text-white space-y-3">
              <div className="flex gap-2">
                <HelpCircle className="w-4 h-4 text-coral shrink-0" />
                <p className="text-[11px] font-bold leading-relaxed">
                  Complete seus dados para <span className="font-extrabold text-coral">garantir</span> mais segurança no acesso à sua conta!
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-coral to-coral-dark transition-all duration-1000" 
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-[10px] font-extrabold text-coral">{completionPercentage}%</span>
              </div>

              <button 
                onClick={() => onNavigate("/app/perfil")}
                className="w-full bg-coral hover:bg-coral-dark text-white text-[11px] font-extrabold py-2 rounded-lg transition-colors"
              >
                Completar dados
              </button>
            </div>
          </div>
        )}

        {/* Menu Options */}
        <div className="p-2 space-y-1">
          <DropdownMenuItem 
            onClick={() => onNavigate("/app/perfil")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold text-navy cursor-pointer hover:bg-surface group"
          >
            <UserCircle className="w-4 h-4 text-navy/40 group-hover:text-coral transition-colors" />
            Minha conta
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => onNavigate("/app/favoritos")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold text-navy cursor-pointer hover:bg-surface group"
          >
            <Heart className="w-4 h-4 text-navy/40 group-hover:text-coral transition-colors" />
            Favoritos
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => onNavigate(isProducer ? "/criar-evento" : "/cadastro")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold text-navy cursor-pointer hover:bg-surface group"
          >
            <PlusCircle className="w-4 h-4 text-navy/40 group-hover:text-coral transition-colors" />
            Criar evento
          </DropdownMenuItem>

          {isProducer && (
            <DropdownMenuItem 
              onClick={() => onNavigate("/produtor")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold text-navy cursor-pointer hover:bg-surface group"
            >
              <Calendar className="w-4 h-4 text-navy/40 group-hover:text-coral transition-colors" />
              Meus eventos
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-line mx-2" />
          
          <DropdownMenuItem 
            onClick={() => onNavigate("/ajuda")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold text-navy cursor-pointer hover:bg-surface group"
          >
            <HelpCircle className="w-4 h-4 text-navy/40 group-hover:text-coral transition-colors" />
            Central de Ajuda
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold text-error cursor-pointer hover:bg-error/5 group"
          >
            <LogOut className="w-4 h-4 text-error/40 group-hover:text-error transition-colors" />
            Sair
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

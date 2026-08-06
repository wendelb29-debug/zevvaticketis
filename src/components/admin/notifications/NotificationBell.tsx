import { useState, useEffect } from "react";
import { 
  Bell, 
  ShoppingBag, 
  MessageSquare, 
  Megaphone, 
  Settings, 
  Check, 
  Trash2,
  Clock,
  ExternalLink
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export type NotificationCategory = 'sistema' | 'vendas' | 'atendimento' | 'marketing';

export interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}

const CATEGORY_ICONS = {
  vendas: { icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-50" },
  atendimento: { icon: MessageSquare, color: "text-green-500", bg: "bg-green-50" },
  marketing: { icon: Megaphone, color: "text-blue-500", bg: "bg-blue-50" },
  sistema: { icon: Settings, color: "text-navy", bg: "bg-surface" },
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data } = await (supabase as any)
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    }
  };

  const markAsRead = async (id: string) => {
    const { error } = await (supabase as any)
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const clearAll = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);
    
    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-surface rounded-full transition-all">
          <Bell className="w-5 h-5 text-navy" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center bg-primary text-white border-2 border-white text-[10px] font-black animate-in zoom-in"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0 rounded-3xl border-line shadow-2xl bg-white overflow-hidden animate-in slide-in-from-top-2 duration-300">
        <div className="p-6 bg-surface/30 border-b border-line flex items-center justify-between">
          <DropdownMenuLabel className="p-0 font-manrope font-black text-navy uppercase tracking-tighter flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Notificações
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAll}
              className="text-[10px] font-black uppercase tracking-widest text-muted-fg hover:text-primary transition-colors"
            >
              Limpar tudo
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[450px]">
          {notifications.length > 0 ? (
            <div className="divide-y divide-line">
              {notifications.map((n) => {
                const config = CATEGORY_ICONS[n.category] || CATEGORY_ICONS.sistema;
                const Icon = config.icon;
                
                return (
                  <div 
                    key={n.id} 
                    className={cn(
                      "p-5 transition-all hover:bg-surface/50 group relative",
                      !n.read && "bg-primary/[0.02]"
                    )}
                  >
                    {!n.read && (
                      <div className="absolute top-6 left-2 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                    
                    <div className="flex gap-4">
                      <div className={cn("w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-110", config.bg)}>
                        <Icon className={cn("w-5 h-5", config.color)} />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-extrabold text-navy truncate tracking-tight">{n.title}</p>
                          <span className="text-[10px] font-bold text-muted-fg shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-fg font-medium leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        
                        <div className="flex items-center gap-2 pt-1">
                          {!n.read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markAsRead(n.id)}
                              className="h-7 px-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                            >
                              <Check className="w-3 h-3 mr-1" /> Marcar como lida
                            </Button>
                          )}
                          {n.link && (
                            <a 
                              href={n.link} 
                              className="text-[10px] font-black uppercase tracking-widest text-navy hover:text-primary flex items-center gap-1 px-2"
                            >
                              <ExternalLink className="w-3 h-3" /> Ver detalhes
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
                <Bell className="w-8 h-8 text-muted-fg/40" />
              </div>
              <div>
                <p className="font-extrabold text-navy uppercase tracking-tight">Tudo em dia!</p>
                <p className="text-xs text-muted-fg font-medium mt-1">Você não tem novas notificações no momento.</p>
              </div>
            </div>
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator className="bg-line m-0" />
        <div className="p-4 bg-surface/10 text-center">
          <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-muted-fg hover:text-primary">
            Ver todas as notificações
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

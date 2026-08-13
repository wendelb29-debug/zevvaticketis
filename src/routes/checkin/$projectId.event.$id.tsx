import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { LayoutDashboard, QrCode, ShieldCheck, Users, BarChart3, ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/checkin/$projectId/event/$id")({
  component: EventCheckinLayout,
});

function EventCheckinLayout() {
  const { projectId, id } = useParams({ from: "/checkin/$projectId/event/$id" });
  const [event, setEvent] = useState<any>(null);
  const [role, setRole] = useState<string>('scanner_only');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEventData() {
      const { data: eventData } = await supabase.from("events").select("*").eq("id", id).single();
      if (!eventData) return;
      setEvent(eventData);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: staffData } = await (supabase
        .from("event_staff" as any)
        .select("role")
        .eq("event_id", id)
        .eq("user_id", user.id)
        .maybeSingle() as any);

      if (staffData) {
        setRole(staffData.role);
      } else {
        // Check if admin/owner
        const { data: member } = await supabase
          .from("tenant_members")
          .select("role")
          .eq("tenant_id", eventData.tenant_id || "")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (member) setRole('supervisor');
      }
    }
    loadEventData();
  }, [id]);

  const menuItems = [
    { label: "Painel", icon: LayoutDashboard, href: `/checkin/${projectId}/event/${id}` },
    { label: "Scanner", icon: QrCode, href: `/checkin/${projectId}/event/${id}/scanner` },
    { label: "Relatórios", icon: BarChart3, href: `/checkin/${projectId}/event/${id}/relatorios` },
  ];

  if (role === 'supervisor') {
    menuItems.push({ label: "Supervisor", icon: ShieldCheck, href: `/checkin/${projectId}/event/${id}/supervisor` });
  }

  return (
    <div className="min-h-screen bg-muted flex font-inter">
      <aside className="w-64 h-screen bg-navy text-primary-foreground sticky top-0 hidden lg:flex flex-col py-8">
        <div className="px-6 mb-8 flex flex-col gap-2">
          <Link to={"/checkin/$projectId"} params={{ projectId }} className="flex items-center gap-2 text-primary-foreground/60 hover:text-primary-foreground transition-colors text-xs font-bold uppercase">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </Link>
          <span className="text-xl font-manrope font-black text-primary-foreground tracking-tighter">
            ZEVVA <span className="text-primary">STAFF</span>
          </span>
          {event && (
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest truncate">{event.title}</p>
          )}
        </div>
        
        <nav className="flex-1 space-y-1 px-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.href as any}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-primary-foreground/60 hover:text-primary-foreground hover:bg-card/5 transition-all"
              activeProps={{ className: "bg-card/10 text-primary border border-white/5" }}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <main className="p-4 sm:p-8 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

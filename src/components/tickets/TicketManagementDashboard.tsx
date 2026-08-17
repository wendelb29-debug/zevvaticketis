import { IssuedTicketsList } from "@/components/admin/eventos/IssuedTicketsList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ticket, Users, CheckCircle2, XCircle, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  scope: "producer" | "platform-admin";
  tenantId?: string | undefined;
}


export function TicketManagementDashboard({ scope, tenantId }: Props) {
  const isGlobal = scope === "platform-admin";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-manrope font-black text-foreground tracking-tighter uppercase">
          {isGlobal ? "🎟️ Gestão Global de Ingressos" : "🎟️ Gestão de Ingressos"}
        </h1>
        <p className="text-muted-foreground font-medium text-lg">
          {isGlobal ? "Visão administrativa de todos os ingressos emitidos na plataforma Zevva." : "Gerencie os ingressos emitidos pela sua organização."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Emitidos", value: "0", icon: Ticket, color: "text-blue-500" },
          { label: "Válidos", value: "0", icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Utilizados", value: "0", icon: Users, color: "text-indigo-500" },
          { label: "Taxa de Check-in", value: "0%", icon: BarChart3, color: "text-purple-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-border shadow-sm bg-card rounded-[32px]">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl bg-accent", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-[40px] border-border shadow-sm bg-card overflow-hidden">
        <CardHeader className="bg-accent/5 px-8 py-8 border-b border-border">
          <CardTitle className="text-xl font-manrope font-black">Base de Dados de Ingressos</CardTitle>
          <CardDescription>Filtre e gerencie ingressos do {isGlobal ? "sistema" : "seu tenant"}.</CardDescription>
        </CardHeader>
        <CardContent className="px-8 py-8">
          <IssuedTicketsList eventId="" />
        </CardContent>
      </Card>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  Megaphone, 
  Plus, 
  Mail, 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Users,
  Eye,
  Copy,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NewCampaignWizard } from "@/components/admin/campaigns/NewCampaignWizard";
import { cn } from "@/lib/utils";
import { z } from "zod";

const searchSchema = z.object({
  wizard: z.boolean().optional(),
});

type EnviosMassivosSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/admin/envios-massivos")({
  validateSearch: (search) => searchSchema.parse(search),
  component: EnviosMassivosPage,
});

function EnviosMassivosPage() {
  const search = Route.useSearch();
  const [isWizardOpen, setIsWizardOpen] = useState(!!search.wizard);
  const navigate = useNavigate();

  // Sync state if URL changes
  useEffect(() => {
    if (search.wizard !== isWizardOpen) {
      setIsWizardOpen(!!search.wizard);
    }
  }, [search.wizard]);

  const handleOpenWizard = (open: boolean) => {
    setIsWizardOpen(open);
    if (!open) {
      navigate({ search: { wizard: undefined } });
    } else {
      navigate({ search: { wizard: true } });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-manrope font-extrabold text-navy tracking-tighter uppercase">📢 Envios Massivos</h1>
          <p className="text-sm text-muted-fg mt-2 font-medium">Ferramenta completa de campanhas multicanal Zevva.</p>
        </div>
        <Button 
          onClick={() => handleOpenWizard(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-extrabold px-8 h-12 shadow-lg shadow-primary/20 rounded-xl"
        >
          <Plus className="w-5 h-5" /> NOVA CAMPANHA
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total enviadas", value: "0", icon: Megaphone, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Entregues", value: "0", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Falharam", value: "0", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Aguardando", value: "0", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Taxa Abertura", value: "0%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Taxa Resposta", value: "0%", icon: Users, color: "text-cyan-600", bg: "bg-cyan-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-border shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300", stat.bg, stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-muted-fg uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-extrabold text-navy mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-line shadow-sm overflow-hidden">
        <div className="p-8 border-b border-line flex justify-between items-center bg-surface/30">
          <h2 className="text-lg font-extrabold text-navy uppercase tracking-tight">Campanhas e Histórico</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface text-muted text-[10px] font-extrabold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Nome da Campanha</th>
                <th className="px-8 py-5">Tipo</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-center">Enviadas</th>
                <th className="px-8 py-5">Data</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr className="hover:bg-surface/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-navy group-hover:text-primary transition-colors">Show Ana Carolina - Lembrete</span>
                    <span className="text-[10px] text-muted-fg uppercase font-bold mt-1 tracking-wider">ID: #CAM-0823</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-muted-fg">WhatsApp</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    🟢 Enviando
                  </span>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-navy">450/1.200</span>
                    <div className="w-24 h-1.5 bg-line rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-primary w-[37%]" />
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-navy">05/08/2026</span>
                    <span className="text-[10px] text-muted-fg mt-0.5">14:30</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" title="Visualizar" className="hover:text-primary">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Duplicar" className="hover:text-primary">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Cancelar" className="hover:text-red-600">
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <NewCampaignWizard open={isWizardOpen} onOpenChange={handleOpenWizard} />
    </div>
  );
}
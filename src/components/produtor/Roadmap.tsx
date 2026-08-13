import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const waves = [
  {
    id: 1,
    title: "Wave 1 — Autenticação e cadastro",
    status: "Concluído",
    items: [
      "Layout split-screen premium",
      "Login social (Google/Apple)",
      "Cadastro dual (Participante/Produtor)",
      "Trigger de profiles automático",
      "Esquema de organizações e membros",
      "Proteção de rota para pendentes"
    ]
  },
  {
    id: 2,
    title: "Wave 2 — Cadastro de eventos",
    status: "Em Progresso",
    items: [
      "Tabela events com tenant_id",
      "Wizard multi-step de criação",
      "Upload de imagens (Supabase Storage)",
      "Página Meus Eventos",
      "Catálogo público com filtros"
    ]
  },
  {
    id: 3,
    title: "Wave 3 — Ingressos e Checkout",
    status: "Pendente",
    items: [
      "Pacotes de viagem internacional",
      "Roteiro, Hospedagem e Custos",
      "Stripe Connect (multi-vendedor)",
      "Checkout multimoeda",
      "Pix com cotação do dia"
    ]
  },
  {
    id: 4,
    title: "Wave 4 — Operação e Check-in",
    status: "Pendente",
    items: [
      "Geração de QR Code único",
      "App de check-in para equipe",
      "Falta automática (minutos configuráveis)",
      "Status de presença em tempo real"
    ]
  },
  {
    id: 5,
    title: "Wave 5 — Financeiro",
    status: "Pendente",
    items: [
      "Extrato de vendas (Ledger)",
      "Cálculo de taxas da plataforma",
      "Previsão de repasses",
      "Gestão de reembolsos"
    ]
  },
  {
    id: 6,
    title: "Wave 6 — Relatórios",
    status: "Pendente",
    items: [
      "Dashboard de conversão",
      "Lista de participantes (CSV/XLSX)",
      "Insights por categoria",
      "Geolocalização dos compradores"
    ]
  },
  {
    id: 7,
    title: "Wave 7 — Admin da Plataforma",
    status: "Pendente",
    items: [
      "Aprovação de novos produtores",
      "Configurações globais de taxas",
      "Gestão de países e moedas",
      "Logs de auditoria"
    ]
  },
  {
    id: 8,
    title: "Wave 8 — Integrações Google",
    status: "Pendente",
    items: [
      "Notificações via Gmail",
      "Sync com Google Agenda",
      "Exportação para Planilhas Google",
      "Maps para eventos e hotéis",
      "Backup no Google Drive"
    ]
  }
];

export function Roadmap() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-manrope font-bold text-foreground">Plano de Desenvolvimento</h2>
        <p className="text-muted-foreground max-w-2xl">
          Acompanhe o progresso da plataforma Zevva Tickets através das ondas de desenvolvimento.
          Cada etapa é projetada para entregar valor incremental e segurança.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {waves.map((wave) => (
          <Card key={wave.id} className={`border-none shadow-soft hover-lift ${wave.status === 'Concluído' ? 'bg-emerald-50/50' : 'bg-card'}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <Badge 
                  variant={wave.status === 'Concluído' ? 'outline' : wave.status === 'Em Progresso' ? 'default' : 'secondary'}
                  className={cn(
                    "rounded-full",
                    wave.status === 'Concluído' && "border-emerald-500 text-emerald-600 bg-emerald-50"
                  )}
                >
                  {wave.status}
                </Badge>
                {wave.status === 'Concluído' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : wave.status === 'Em Progresso' ? (
                  <Clock className="w-5 h-5 text-primary animate-pulse" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <CardTitle className="text-lg font-manrope font-bold text-foreground">{wave.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {wave.items.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${wave.status === 'Concluído' ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  Smartphone, 
  Plus, 
  Users, 
  History, 
  Settings, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Image as ImageIcon,
  Link as LinkIcon,
  Filter,
  Calendar,
  Zap,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/marketing/push")({
  component: PushNotificationsPage,
});

function PushNotificationsPage() {
  const [activeTab, setActiveTab] = useState("historico");
  const [pushContent, setPushContent] = useState({
    title: "",
    body: "",
    link: "",
    buttonText: "",
    imageUrl: "",
    scheduleDate: "",
    scheduleTime: ""
  });
  const [isScheduling, setIsScheduling] = useState(false);


  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 font-inter">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-manrope font-black text-navy tracking-tighter uppercase">📱 Push Notifications</h1>
          <p className="text-sm text-muted-fg mt-2 font-medium">Envie avisos rápidos e segmentados para os usuários do Zevva.</p>
        </div>
        <Button 
          onClick={() => setActiveTab("novo")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-black px-8 h-12 shadow-lg shadow-primary/20 rounded-xl uppercase tracking-widest text-xs"
        >
          <Plus className="w-5 h-5" /> Nova Push
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border border-line p-1 rounded-2xl h-14 shadow-sm mb-8 w-full justify-start overflow-x-auto">
          <TabsTrigger value="historico" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] gap-2 transition-all">
            <History className="w-4 h-4" /> Histórico
          </TabsTrigger>
          <TabsTrigger value="novo" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] gap-2 transition-all">
            <Plus className="w-4 h-4" /> Criar Campanha
          </TabsTrigger>
          <TabsTrigger value="automacoes" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] gap-2 transition-all">
            <Zap className="w-4 h-4" /> Automações
          </TabsTrigger>
          <TabsTrigger value="metricas" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] gap-2 transition-all">
            <TrendingUp className="w-4 h-4" /> Métricas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="historico" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Total Enviados", value: "12.450", icon: Smartphone, color: "text-primary", bg: "bg-primary/5" },
              { label: "Entregues", value: "98.2%", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
              { label: "Cliques", value: "1.240", icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
              { label: "Taxa média", value: "10%", icon: Zap, color: "text-navy", bg: "bg-surface" },
            ].map((stat, i) => (
              <Card key={i} className="border-border shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-fg uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black text-navy mt-1">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-line shadow-sm overflow-hidden">
            <div className="p-8 border-b border-line flex justify-between items-center bg-surface/30">
              <h2 className="text-lg font-black text-navy uppercase tracking-tight">Campanhas Recentes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface text-muted text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Campanha</th>
                    <th className="px-8 py-5">Público</th>
                    <th className="px-8 py-5 text-center">Enviados</th>
                    <th className="px-8 py-5 text-center">Cliques</th>
                    <th className="px-8 py-5">Data</th>
                    <th className="px-8 py-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[
                    { name: "Confirmar Ingresso 🎉", public: "Todos compradores", sent: "1.200", clicks: "450", date: "05/08/2026", status: "Concluída" },
                    { name: "Nova Caravana Aberta", public: "Interessados Israel", sent: "850", clicks: "120", date: "04/08/2026", status: "Concluída" },
                    { name: "Lembrete Evento Amanhã", public: "Inscritos Evento X", sent: "3.400", clicks: "2.100", date: "03/08/2026", status: "Agendada" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-surface/50 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="font-extrabold text-navy group-hover:text-primary transition-colors">{row.name}</span>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant="outline" className="text-[10px] font-bold text-muted-fg uppercase tracking-widest bg-white">
                          {row.public}
                        </Badge>
                      </td>
                      <td className="px-8 py-6 text-center font-bold text-navy">{row.sent}</td>
                      <td className="px-8 py-6 text-center font-bold text-orange-500">{row.clicks}</td>
                      <td className="px-8 py-6 text-xs font-bold text-muted-fg">{row.date}</td>
                      <td className="px-8 py-6">
                        <Badge className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          row.status === "Concluída" ? "bg-green-500" : "bg-blue-500"
                        )}>
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="novo" className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-line shadow-sm rounded-3xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-navy uppercase tracking-tight flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-primary" /> Conteúdo da Mensagem
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-fg">Título do Push</Label>
                        <Input 
                          placeholder="Ex: Seu ingresso foi confirmado 🎉" 
                          className="h-12 border-line focus:ring-primary rounded-xl font-bold"
                          value={pushContent.title}
                          onChange={(e) => setPushContent(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-fg">Link de Ação</Label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-muted-fg" />
                          <Input 
                            placeholder="https://zevva.app/ingresso" 
                            className="pl-11 h-12 border-line focus:ring-primary rounded-xl font-bold"
                            value={pushContent.link}
                            onChange={(e) => setPushContent(prev => ({ ...prev, link: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-fg">Corpo da Mensagem</Label>
                      <Textarea 
                        placeholder="Olá João, sua entrada para o evento está disponível." 
                        className="min-h-[120px] border-line focus:ring-primary rounded-xl font-medium p-4"
                        value={pushContent.body}
                        onChange={(e) => setPushContent(prev => ({ ...prev, body: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-fg">Imagem (Opcional)</Label>
                        <div className="border-2 border-dashed border-line rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-surface/20 hover:bg-surface/40 hover:border-primary/30 transition-all cursor-pointer">
                          <ImageIcon className="w-8 h-8 text-muted-fg" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-fg">Arraste ou clique para upload</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-fg">Texto do Botão</Label>
                        <Input 
                          placeholder="Ex: Ver ingresso" 
                          className="h-12 border-line focus:ring-primary rounded-xl font-bold"
                          value={pushContent.buttonText}
                          onChange={(e) => setPushContent(prev => ({ ...prev, buttonText: e.target.value }))}
                        />
                      </div>
                    </div>

                  </div>

                  <div className="pt-8 border-t border-line space-y-6">
                    <h3 className="text-xl font-black text-navy uppercase tracking-tight flex items-center gap-2">
                      <Filter className="w-5 h-5 text-primary" /> Segmentação do Público
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-fg">Público</Label>
                        <select className="w-full h-12 border border-line rounded-xl px-4 font-bold outline-none focus:ring-1 focus:ring-primary text-sm">
                          <option>Todos os Usuários</option>
                          <option>Compradores</option>
                          <option>Alunos</option>
                          <option>Apenas Produtores</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-fg">Evento Específico</Label>
                        <select className="w-full h-12 border border-line rounded-xl px-4 font-bold outline-none focus:ring-1 focus:ring-primary text-sm">
                          <option>Nenhum</option>
                          <option>Evento Ana Carolina</option>
                          <option>Caravana Israel Set/24</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-fg">Status de Pagamento</Label>
                        <select className="w-full h-12 border border-line rounded-xl px-4 font-bold outline-none focus:ring-1 focus:ring-primary text-sm">
                          <option>Qualquer um</option>
                          <option>Aprovado</option>
                          <option>Pendente</option>
                          <option>Cancelado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button 
                  onClick={() => {
                    toast.success("Push agendado com sucesso!");
                    setActiveTab("historico");
                  }}
                  className="flex-1 bg-primary text-white font-black uppercase tracking-widest text-xs h-14 rounded-2xl shadow-xl shadow-primary/30"
                >
                  <Zap className="w-5 h-5 mr-2" /> Enviar Agora
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 border-line bg-white text-navy font-black uppercase tracking-widest text-xs h-14 rounded-2xl hover:bg-surface transition-all"
                >
                  <Calendar className="w-5 h-5 mr-2" /> Agendar Envio
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="sticky top-28 space-y-6">
                <h3 className="text-xs font-black text-muted-fg uppercase tracking-[0.2em]">Pré-visualização</h3>
                <div className="w-full max-w-[320px] mx-auto bg-navy rounded-[40px] p-4 border-[8px] border-[#1a1a1a] shadow-2xl relative">
                  <div className="w-32 h-6 bg-[#1a1a1a] absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-10" />
                  
                  <div className="mt-12 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black text-white/60 uppercase tracking-widest">Zevva App • Agora</p>
                        <p className="text-sm font-black text-white mt-1 truncate">{pushContent.title || "Seu ingresso foi confirmado 🎉"}</p>
                        <p className="text-[11px] font-medium text-white/80 mt-1 line-clamp-2">{pushContent.body || "Olá João, sua entrada para o evento está disponível."}</p>
                      </div>
                    </div>
                    {pushContent.buttonText && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-center transition-colors">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{pushContent.buttonText}</span>
                        </div>
                      </div>
                    )}

                  </div>
                  
                  <div className="mt-60 space-y-3">
                    <div className="h-0.5 w-1/3 mx-auto bg-white/20 rounded-full" />
                    <p className="text-center text-[10px] font-medium text-white/40">Zevva Mobile Interface Mockup</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="automacoes" className="animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Compra Aprovada", desc: "Envia confirmação imediata após pagamento.", icon: CheckCircle2, status: "Ativa" },
              { title: "Lembrete 24h", desc: "Aviso automático um dia antes do evento.", icon: Clock, status: "Ativa" },
              { title: "Carrinho Abandonado", desc: "Recupere vendas não finalizadas após 2h.", icon: LayoutDashboard, status: "Pausada" },
              { title: "Feedback Pós-Evento", desc: "Peça avaliação aos participantes.", icon: Clock, status: "Desativada" },
              { title: "Novo Curso", desc: "Notifica alunos sobre novas aulas.", icon: Zap, status: "Ativa" },
            ].map((item, i) => (
              <Card key={i} className="border-border shadow-sm group hover:border-primary/30 transition-all cursor-pointer">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                      <item.icon className="w-6 h-6 text-navy group-hover:text-primary transition-colors" />
                    </div>
                    <Badge className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      item.status === "Ativa" ? "bg-green-500" : "bg-muted-fg"
                    )}>
                      {item.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-black text-navy uppercase tracking-tight">{item.title}</h3>
                    <p className="text-xs text-muted-fg font-medium mt-1">{item.desc}</p>
                  </div>
                  <div className="pt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-9 rounded-lg border-line text-[10px] font-black uppercase tracking-widest">Configurar</Button>
                    <Button variant="ghost" size="sm" className="h-9 w-9 rounded-lg border border-line p-0"><Settings className="w-4 h-4 text-muted-fg" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

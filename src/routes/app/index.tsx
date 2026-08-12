import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTenants } from "@/hooks/use-tenants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Plus, Building2, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProject } from "@/lib/projects.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/app/")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const { tenants, loading, switchTenant } = useTenants();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const createProjectFn = useServerFn(createProject);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserName(data.user?.user_metadata?.["nome"] || data.user?.email?.split('@')[0] || "Usuário");
    });
  }, []);

  const handleSelect = (tenantId: string) => {
    switchTenant(tenantId);
    navigate({ to: "/produtor" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      await createProjectFn({ data: { nome: newProjectName } });
      toast.success("Projeto criado com sucesso!");
      setIsDialogOpen(false);
      setNewProjectName("");
      // Force a refresh of tenants
      window.location.reload();
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      toast.error("Erro ao criar projeto. Tente novamente.");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-coral border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-inter">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-coral/10 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-coral" />
            </div>
            <div>
              <h1 className="text-2xl font-manrope font-black text-navy tracking-tight">Meus Projetos</h1>
              <p className="text-slate-500 font-medium">Olá, {userName}. Escolha o ambiente que deseja gerenciar.</p>
            </div>
          </div>

          <Button variant="ghost" onClick={handleLogout} className="text-navy hover:text-coral font-bold gap-2">
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <Card 
              key={tenant.id} 
              className="group cursor-pointer hover:shadow-xl hover:border-coral/30 transition-all duration-300 border-slate-200 overflow-hidden rounded-[24px]"
              onClick={() => handleSelect(tenant.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <Avatar className="w-14 h-14 rounded-2xl border-2 border-slate-100">
                    <AvatarImage src={tenant.logo || undefined} />
                    <AvatarFallback className="bg-navy text-white font-black text-xl">
                      {tenant.nome.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] font-black uppercase tracking-widest text-coral bg-coral/10 px-3 py-1 rounded-full border border-coral/20">
                    {tenant.plan}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <CardTitle className="text-lg font-manrope font-black text-navy group-hover:text-coral transition-colors">
                    {tenant.nome}
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium truncate">
                    /{tenant.slug}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-black uppercase text-slate-400">Ambiente de Produção</span>
                </div>

                <Button className="w-full bg-navy hover:bg-coral text-white font-black uppercase tracking-widest text-[10px] py-6 rounded-xl group-hover:shadow-lg group-hover:shadow-coral/30 transition-all duration-300">
                  Entrar no ambiente
                </Button>
              </CardContent>
            </Card>
          ))}

          <Card 
            className="flex flex-col items-center justify-center p-8 border-dashed border-2 border-slate-300 hover:border-coral transition-all cursor-pointer group rounded-[24px] min-h-[280px] hover:bg-white bg-slate-50/50"
            onClick={() => setIsDialogOpen(true)}
          >
            <div className="w-16 h-16 bg-white group-hover:bg-coral/10 rounded-full flex items-center justify-center mb-4 transition-colors shadow-sm border border-slate-100 group-hover:border-coral/20">
              <Plus className="w-8 h-8 text-slate-400 group-hover:text-coral transition-colors" />
            </div>
            <CardTitle className="text-lg font-manrope font-black text-navy group-hover:text-coral transition-colors">Novo Projeto</CardTitle>
            <CardDescription className="text-center font-medium px-4 mt-2">
              Crie um novo ambiente para gerenciar seus eventos.
            </CardDescription>
          </Card>

        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-navy p-8 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Building2 size={120} />
            </div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-manrope font-black tracking-tight text-white">Novo Projeto</DialogTitle>
              <DialogDescription className="text-white/60 font-medium">
                Dê um nome ao seu novo ambiente de trabalho.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <form onSubmit={handleCreateProject} className="p-8 space-y-6 bg-white">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-navy font-black uppercase text-[10px] tracking-widest ml-1">
                Nome do Projeto
              </Label>
              <Input
                id="name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Ex: Minha Agência de Eventos"
                className="rounded-xl border-slate-200 focus:ring-coral focus:border-coral py-6 text-base"
                required
                autoFocus
              />
            </div>
            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl font-bold border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isCreating || !newProjectName.trim()}
                className="bg-coral hover:bg-navy text-white font-black uppercase tracking-widest text-xs px-8 rounded-xl py-6 h-auto shadow-lg shadow-coral/20 flex gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Projeto"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

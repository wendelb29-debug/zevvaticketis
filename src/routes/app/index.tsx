import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useTenants } from "@/hooks/use-tenants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Plus, Building2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/app/")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const { tenants, loading, switchTenant } = useTenants();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

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

          <Card className="flex flex-col items-center justify-center p-8 border-dashed border-2 hover:border-coral transition-colors cursor-pointer group rounded-[24px] min-h-[280px]">
            <div className="w-16 h-16 bg-slate-100 group-hover:bg-coral/10 rounded-full flex items-center justify-center mb-4 transition-colors">
              <Plus className="w-8 h-8 text-slate-400 group-hover:text-coral transition-colors" />
            </div>
            <CardTitle className="text-lg font-manrope font-black text-navy">Novo Projeto</CardTitle>
            <CardDescription className="text-center font-medium px-4 mt-2">
              Crie um novo ambiente para gerenciar seus eventos.
            </CardDescription>
          </Card>

        </div>
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTenants } from "@/hooks/use-tenants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, ShieldCheck, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkin/")({
  component: CheckinSelectionPage,
});

function CheckinSelectionPage() {
  const { tenants, loading } = useTenants();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-coral border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-inter">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center shadow-lg shadow-navy/20">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-coral bg-coral/10 px-3 py-1 rounded-full">Operacional</span>
              </div>
              <h1 className="text-3xl font-manrope font-black text-navy tracking-tight">Zevva Staff</h1>
              <p className="text-slate-500 font-medium">Selecione um projeto para iniciar a operação de check-in.</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => navigate({ to: "/" })}
            className="rounded-2xl font-bold border-slate-200 text-navy hover:bg-slate-50 flex gap-2 h-12 px-6"
          >
            <Home className="w-4 h-4" /> Voltar para Home
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <Card 
              key={tenant.id} 
              className="group cursor-pointer hover:shadow-2xl hover:border-coral/30 transition-all duration-500 border-slate-200 overflow-hidden rounded-[32px] flex flex-col bg-white border-2"
              onClick={() => navigate({ to: `/checkin/${tenant.id}` })}
            >
              <CardHeader className="p-8 pb-4">
                <div className="flex justify-between items-start">
                  <Avatar className="w-20 h-20 rounded-3xl border-4 border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <AvatarImage src={tenant.logo || undefined} className="object-cover" />
                    <AvatarFallback className="bg-navy text-white font-black text-2xl">
                      {tenant.nome.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-slate-50 p-3 rounded-2xl group-hover:bg-coral/10 transition-colors">
                    <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-coral group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6 flex-grow flex flex-col justify-between">
                <div>
                  <CardTitle className="text-xl font-manrope font-black text-navy group-hover:text-coral transition-colors line-clamp-2 leading-tight mb-2">
                    {tenant.nome}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    <Building2 className="w-3.5 h-3.5" />
                    {tenant.slug}
                  </div>
                </div>
                
                <Button className="w-full bg-slate-50 hover:bg-coral text-navy hover:text-white font-black uppercase tracking-widest text-[11px] py-7 rounded-2xl shadow-none hover:shadow-xl hover:shadow-coral/30 transition-all duration-300 border border-slate-100 hover:border-coral">
                  Acessar Operação
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {tenants.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-manrope font-black text-navy mb-2">Nenhum projeto encontrado</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Você ainda não possui projetos vinculados à sua conta para realizar check-in.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

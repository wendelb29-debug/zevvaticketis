import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/produtor")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: ProdutorLayout,
});

function ProdutorLayout() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkOrgStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberData } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (memberData) {
        const { data: orgData } = await supabase
          .from("organizations")
          .select("status")
          .eq("id", memberData.organization_id)
          .single();
        
        setStatus(orgData?.status || null);
      }
      setLoading(false);
    }
    checkOrgStatus();
  }, []);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Carregando...</div>;

  if (status === "pendente") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="text-6xl">⏳</div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Cadastro em Análise</h1>
          <p className="text-secondary">
            Sua organização foi cadastrada com sucesso e está sendo revisada por nossa equipe. 
            Você receberá um e-mail assim que for aprovado.
          </p>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-primary hover:underline"
          >
            Sair da conta
          </button>
        </div>
      </div>
    );
  }

  if (status === "bloqueado") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center text-error">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Acesso Bloqueado</h1>
          <p>Sua organização foi bloqueada. Entre em contato com o suporte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/5 bg-card/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-heading font-bold text-primary tracking-tighter">
            ZEVVA <span className="text-foreground">PRODUTOR</span>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="text-sm text-muted-foreground">Sair</button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
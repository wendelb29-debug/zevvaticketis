import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/produtor-pendente")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/" });
    }
  },
  component: PendenteLayout,
});

function PendenteLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-center font-inter">
      <div className="max-w-md space-y-8 bg-white p-12 rounded-[24px] shadow-xl border border-line">
        <div className="text-6xl animate-bounce">⏳</div>
        <div className="space-y-4">
          <h1 className="text-3xl font-manrope font-extrabold text-navy">Seu cadastro está em análise</h1>
          <p className="text-muted font-medium leading-relaxed">
            Sua organização foi cadastrada com sucesso e está sendo revisada por nossa equipe. 
            Você receberá um e-mail assim que for aprovado para começar a vender.
          </p>
        </div>
        <Button 
          variant="ghost"
          onClick={handleLogout}
          className="text-gold font-bold hover:text-gold-deep"
        >
          Sair da conta
        </Button>
      </div>
    </div>
  );
}

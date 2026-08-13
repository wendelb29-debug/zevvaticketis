import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/usuarios")({
  component: UsuariosPage,
});

function UsuariosPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*");
      return data;
    }
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6 text-foreground">
      <h1 className="text-2xl font-manrope font-extrabold text-foreground">Usuários e Permissões</h1>
      
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-accent text-muted-foreground text-xs font-extrabold uppercase">
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">E-mail</th>
              <th className="px-6 py-4">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map((user: any) => (
              <tr key={user.id} className="hover:bg-accent/50 transition-colors">
                <td className="px-6 py-4 font-bold text-foreground">{user.nome}</td>
                <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                <td className="px-6 py-4">
                  <Button size="sm" variant="outline" className="border-border hover:bg-primary hover:text-primary-foreground transition-all">Ver Permissões</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
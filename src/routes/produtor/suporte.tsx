import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/produtor/suporte")({
  component: SuportePage,
});

function SuportePage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!search) return;
    setLoading(true);
    
    // Search by email or name in profiles, join with orders and tickets
    const { data: profiles } = await supabase
      .from("profiles")
      .select(`
        id, nome, email,
        orders (
          id, status, valor_bruto, created_at,
          tickets ( id, status )
        )
      `)
      .or(`email.ilike.%${search}%,nome.ilike.%${search}%`);

    setResults(profiles || []);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-manrope font-extrabold text-navy">Suporte ao Participante</h1>
      
      <div className="flex gap-2 max-w-md">
        <Input 
          placeholder="Buscar por e-mail ou nome..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="w-4 h-4 mr-2" /> {loading ? "Buscando..." : "Buscar"}
        </Button>
      </div>

      <div className="space-y-4">
        {results.map((profile: any) => (
          <div key={profile.id} className="bg-white p-6 rounded-xl border space-y-4">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-10 h-10 bg-coral/10 rounded-full flex items-center justify-center text-coral">
                <User />
              </div>
              <div>
                <h3 className="font-bold text-navy">{profile.nome}</h3>
                <p className="text-sm text-muted">{profile.email}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-extrabold uppercase text-muted tracking-wider">Pedidos</h4>
              {profile.orders?.length > 0 ? (
                profile.orders.map((order: any) => (
                  <div key={order.id} className="p-3 bg-surface rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold">Pedido #{order.id.slice(0,8)}</p>
                      <p className="text-xs text-muted">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-coral/10 text-coral">
                        {order.status}
                      </span>
                      <p className="text-sm font-extrabold mt-1">
                        {order.tickets?.length || 0} ingresso(s)
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted italic">Nenhum pedido encontrado.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

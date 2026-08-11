import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/produtor/marketing")({
  component: MarketingPage,
});

function MarketingPage() {

  
  const { data: events, isLoading } = useQuery({
    queryKey: ["marketing-events"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: member } = await supabase
        .from("tenant_members")
        .select("tenant_id")
        .eq("user_id", session!.user.id)
        .single();

      const { data } = await supabase
        .from("events")
        .select(`
          id, title,
          event_favorites(count)
        `)
        .eq("tenant_id", member!.tenant_id);
      return data;
    }
  });

  const copyLink = (title: string) => {
    const url = `${window.location.origin}/evento/${title.toLowerCase().replace(/\s+/g, '-')}`;
    navigator.clipboard.writeText(url);
    toast("Link copiado!", { description: "A URL foi copiada para a área de transferência." });
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-manrope font-extrabold text-navy">Marketing</h1>
      <div className="grid gap-4">
        {events?.map((event: any) => (
          <div key={event.id} className="bg-white p-4 rounded-xl border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-navy">{event.title}</h3>
              <p className="text-sm text-muted">Favoritos: {event.event_favorites[0]?.count || 0}</p>
            </div>
            <Button variant="outline" onClick={() => copyLink(event.title)}>
              <Copy className="w-4 h-4 mr-2" /> Copiar link
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

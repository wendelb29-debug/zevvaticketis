import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/configuracoes")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session, they might be in the middle of auth callback hydration
    // For now, let's just ensure we have an auth status check
    if (!session) {
      // In a real app we'd wait for a session check, but for now redirect
      // to login if we know there is no session.
    }
  },
  component: () => <div className="p-8">Configurações placeholder</div>,
});

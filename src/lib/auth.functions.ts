import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getRedirectPath = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return "/";

    // 1a. Check for platform admin
    const { data: isAdmin } = await supabase
      .from("platform_admins")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (isAdmin) return "/admin";

    // 1b & 1c. Check for organization membership
    const { data: member } = await supabase
      .from("organization_members")
      .select("organization_id, role, permissions")
      .eq("user_id", user.id)
      .maybeSingle();

    if (member) {
      // Rule: Team member with ONLY checkin permission goes straight to /checkin
      const permissions = member.permissions as string[] || [];
      if (member.role === 'equipe' && permissions.length === 1 && permissions[0] === 'checkin') {
        return "/checkin";
      }

      const { data: org } = await supabase
        .from("organizations")
        .select("status")
        .eq("id", member.organization_id)
        .maybeSingle();

      if (org?.status === "aprovado") return "/produtor";
      if (org?.status === "pendente") return "/produtor-pendente";
    }

    // 1d. Participant area
    return "/app";
  });

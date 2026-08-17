import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface AuditLogParams {
  action: string;
  entity_type: string;
  entity_id: string;
  tenant_id?: string | null;
  actor_id: string;
  details: any;
  severity: "low" | "medium" | "high" | "critical";
}

/**
 * Persists an audit log entry to the database using the admin client.
 */
export async function auditLog({
  action,
  entity_type,
  entity_id,
  tenant_id,
  actor_id,
  details,
  severity,
}: AuditLogParams) {
  const { error } = await supabaseAdmin.from("audit_logs").insert({
    acao: action,
    alvo_tipo: entity_type,
    alvo_id: entity_id,
    tenant_id: tenant_id,
    usuario_id: actor_id,
    detalhes: details,
    categoria: severity,
    metadata: {
      ip: "internal",
      user_agent: "zevva-server",
    },
  });

  if (error) {
    console.error("Failed to write audit log:", error);
    // We don't throw here to avoid failing the main operation if audit fails
  }
}

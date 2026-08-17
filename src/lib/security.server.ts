import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

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
  // Use existing table schema: acao, alvo_tipo, alvo_id, admin_id, payload, categoria
  const { error } = await supabaseAdmin.from("audit_logs").insert({
    acao: action,
    alvo_tipo: entity_type,
    alvo_id: entity_id,
    admin_id: actor_id,
    payload: details,
    categoria: severity,
    // Note: tenant_id is not in the audit_logs schema but we can include it in payload if needed
    // The current schema has admin_id which we'll use for the actor
  });

  if (error) {
    console.error("Failed to write audit log:", error);
  }
}

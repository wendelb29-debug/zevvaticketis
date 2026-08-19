import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getTenantDetails = createServerFn({ method: "GET" })
  .validator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data: { id } }) => {
    try {
      // Direct RPC call to bypass RLS for platform admins
      const { data, error } = await supabaseAdmin.rpc("get_master_tenant_details", {
        _tenant_id: id
      });

      if (error) {
        console.error("RPC Error:", error);
        return { 
          success: false, 
          found: false, 
          code: error.code === 'PGRST116' ? "TENANT_NOT_FOUND" : "QUERY_ERROR" 
        };
      }

      // The RPC returns a JSON object with success, code, found, and tenant
      return data as {
        success: boolean;
        found: boolean;
        code: string;
        tenant?: any;
      };
    } catch (err) {
      console.error("Execution Error:", err);
      return { success: false, found: false, code: "QUERY_ERROR" };
    }
  });

export const suspendTenant = createServerFn({ method: "POST" })
  .validator((data) => z.object({ 
    id: z.string(), 
    motivo: z.string(), 
    impacto: z.string(),
    observacao: z.string().optional() 
  }).parse(data))
  .handler(async ({ data: { id, motivo, impacto, observacao } }) => {
    // Audit the action and update status
    const { error } = await supabaseAdmin
      .from("tenants")
      .update({ status: 'suspenso' })
      .eq('id', id);
    
    if (error) throw error;
    
    // Register audit log
    await supabaseAdmin.from("audit_logs").insert({
      alvo_id: id,
      alvo_tipo: "tenant",
      acao: "suspend",
      categoria: "seguranca",
      payload: { motivo, impacto, observacao }
    });
    
    return { success: true };
  });

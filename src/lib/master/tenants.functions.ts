import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getTenantDetails = createServerFn({ method: "GET" })
  .validator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data: { id } }) => {
    const { data, error } = await supabaseAdmin.rpc("get_master_tenant_details", {
      _tenant_id: id
    });

    if (error) {
      console.error("Error calling get_master_tenant_details:", error);
      throw error;
    }

    return data as {
      found: boolean;
      code?: string;
      tenant?: any;
    };
  });

export const suspendTenant = createServerFn({ method: "POST" })
  .validator((data) => z.object({ 
    id: z.string(), 
    motivo: z.string(), 
    impacto: z.string(),
    observacao: z.string().optional() 
  }).parse(data))
  .handler(async ({ data: { id, motivo, impacto, observacao } }) => {
    // Lógica para registrar auditoria e alterar status
    const { error } = await supabaseAdmin
      .from("tenants")
      .update({ status: 'suspenso' })
      .eq('id', id);
    
    if (error) throw error;
    
    // Registrar na auditoria
    await supabaseAdmin.from("audit_logs").insert({
      alvo_id: id,
      alvo_tipo: "tenant",
      acao: "suspend",
      categoria: "seguranca"
    });
    
    return { success: true };
  });
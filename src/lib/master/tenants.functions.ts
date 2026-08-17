import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getTenantDetails = createServerFn({ method: "GET" })
  .validator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data: { id } }) => {
    // Apenas admins globais podem acessar detalhes de qualquer tenant
    // Validação de permissão será feita na chamada do RPC
    const { data, error } = await supabaseAdmin
      .from("tenants")
      .select(`
        *,
        owner:profiles!tenants_owner_id_fkey(nome, email),
        member_count:tenant_members(count),
        event_count:events(count)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
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

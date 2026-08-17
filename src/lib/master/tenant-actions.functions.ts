import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const updateTenantIdentity = createServerFn({ method: "POST" })
  .validator((data) => z.object({
    id: z.string(),
    updates: z.object({
      nome: z.string().optional(),
      slug: z.string().optional(),
      documento: z.string().nullish(),
      telefone: z.string().nullish(),
      logo: z.string().nullish(),
    })
  }).parse(data))
  .handler(async ({ data: { id, updates } }) => {
    // Audit before update
    const { data: before } = await supabaseAdmin.from("tenants").select("*").eq("id", id).single();
    
    const { error } = await supabaseAdmin
      .from("tenants")
      .update(updates as any)
      .eq("id", id);
      
    if (error) throw error;
    
    await supabaseAdmin.from("audit_logs").insert({
      alvo_id: id,
      alvo_tipo: "tenant",
      acao: "update_identity",
      payload: { updates, before: before },
      categoria: "configuracao"
    });
    
    return { success: true };
  });

export const updateTenantPlan = createServerFn({ method: "POST" })
  .validator((data) => z.object({
    id: z.string(),
    plan: z.string(),
    justificativa: z.string()
  }).parse(data))
  .handler(async ({ data: { id, plan, justificativa } }) => {
    const { data: before } = await supabaseAdmin.from("tenants").select("plan").eq("id", id).single();
    
    const { error } = await supabaseAdmin
      .from("tenants")
      .update({ plan })
      .eq("id", id);
      
    if (error) throw error;
    
    await supabaseAdmin.from("audit_logs").insert({
      alvo_id: id,
      alvo_tipo: "tenant",
      acao: "change_plan",
      payload: { new_plan: plan, old_plan: before?.plan, justificativa },
      categoria: "financeiro"
    });
    
    return { success: true };
  });

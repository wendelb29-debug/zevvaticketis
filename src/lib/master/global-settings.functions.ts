import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { auditLog } from "@/lib/security.server";

const globalSettingsUpdateSchema = z.object({
  section: z.string(),
  changes: z.record(z.any()),
  reason: z.string().min(5, "Justificativa muito curta"),
});

export const updateGlobalPlatformSettings = createServerFn({ method: "POST" })
  .inputValidator((data) => globalSettingsUpdateSchema.parse(data))
  .handler(async ({ data, context }) => {
    // 1. Verify Authentication & Platform Admin Status
    const { data: { user } } = await context.supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: isAdmin } = await context.supabase.rpc('check_is_platform_admin', {
      _user_id: user.id
    });

    if (!isAdmin) throw new Error("Forbidden: Requiere privilegios de administrador global");

    // 2. Section Allowlist & Validation Logic
    const allowedSections = [
      "plataforma", "financeiro", "planos", "eventos", 
      "ingressos", "checkin", "comunicacao", "seguranca", 
      "lgpd", "manutencao", "integracoes"
    ];

    if (!allowedSections.includes(data.section)) {
      throw new Error(`Seção inválida: ${data.section}`);
    }

    // 3. Fetch Previous State for Audit
    // Note: We use a dedicated table for global config or meta-data
    const { data: prevData } = await context.supabase
      .from('platform_settings')
      .select('*')
      .eq('section', data.section)
      .single();

    // 4. Atomic Update
    const { error: updateError } = await context.supabase
      .from('platform_settings')
      .upsert({
        section: data.section,
        settings: { ...(prevData?.settings || {}), ...data.changes },
        updated_at: new Date().toISOString(),
        updated_by: user.id
      });

    if (updateError) throw updateError;

    // 5. Create Audit Trail
    await auditLog({
      action: "PLATFORM_SETTINGS_UPDATE",
      entity_type: "platform",
      entity_id: "global",
      tenant_id: null, // Global action
      actor_id: user.id,
      details: {
        section: data.section,
        reason: data.reason,
        previous_values: prevData?.settings || {},
        new_values: data.changes
      },
      severity: "critical"
    });

    return { success: true, message: `Configurações de ${data.section} atualizadas.` };
  });

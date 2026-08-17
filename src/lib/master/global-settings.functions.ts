import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const globalSettingsUpdateSchema = z.object({
  section: z.string(),
  changes: z.record(z.string(), z.any()),
  reason: z.string().min(5),
});

export const updateGlobalPlatformSettings = createServerFn({ method: "POST" })
  .validator((data: unknown) => globalSettingsUpdateSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { auditLog } = await import("@/lib/security.server");
    const supabase = (context as any).supabase;
    if (!supabase) throw new Error("Supabase context is missing");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: isAdmin } = await supabase.rpc('check_is_platform_admin', {
      _user_id: user.id
    });

    if (!isAdmin) throw new Error("Forbidden: Requiere privilegios de administrador global");

    const allowedSections = [
      "plataforma", "financeiro", "planos", "eventos", 
      "ingressos", "checkin", "comunicacao", "seguranca", 
      "lgpd", "manutencao", "integracoes"
    ];

    if (!allowedSections.includes(data.section)) {
      throw new Error(`Seção inválida: ${data.section}`);
    }

    const { data: prevData } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('section', data.section)
      .single();

    const { error: updateError } = await supabase
      .from('platform_settings')
      .upsert({
        section: data.section,
        settings: { ...(prevData?.settings || {}), ...data.changes },
        updated_at: new Date().toISOString(),
        updated_by: user.id
      });

    if (updateError) throw updateError;

    // Fixed: Audit log now matches the signature in security.server.ts (single object argument)
    await auditLog({
      action: "PLATFORM_SETTINGS_UPDATE",
      entity_type: "platform",
      entity_id: "global",
      tenant_id: null,
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

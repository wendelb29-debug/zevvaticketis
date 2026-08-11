import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const resendTicketEmail = createServerFn({ method: "POST" })
  .validator((data: { logId: string; newEmail?: string }) => 
    z.object({
      logId: z.string(),
      newEmail: z.string().email().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    // 1. Get original log
    const { data: log, error: logError } = await supabase
      .from("email_logs")
      .select("*")
      .eq("id", data.logId)
      .single();

    if (logError || !log) throw new Error("Log não encontrado");

    // 2. Simulate resend
    const { data: newLog, error: newLogError } = await supabase
      .from("email_logs")
      .insert({
        event_id: log.event_id,
        ticket_id: log.ticket_id,
        user_id: log.user_id,
        template_id: log.template_id,
        email: data.newEmail || log.email,
        subject: log.subject,
        status: "sent",
        metadata: { ...((log.metadata as any) || {}), resend: true, original_log_id: log.id }
      })
      .select()
      .single();

    if (newLogError) throw new Error("Erro ao registrar reenvio");

    return newLog;
  });

export const sendEmailTest = createServerFn({ method: "POST" })
  .validator((data: { templateId: string; testEmail: string }) => 
    z.object({
      templateId: z.string(),
      testEmail: z.string().email(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    // In a real app, this would use an email provider like Resend
    // For now, we simulate success
    return { success: true };
  });

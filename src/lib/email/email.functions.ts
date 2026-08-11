import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const resendTicketEmail = createServerFn({ method: "POST" })
  .input(z.object({
    logId: z.string(),
    newEmail: z.string().email().optional(),
  }))
  .handler(async ({ data }) => {
    // 1. Get original log
    const { data: log, error: logError } = await supabase
      .from("email_logs")
      .select("*")
      .eq("id", data.logId)
      .single();

    if (logError || !log) throw new Error("Log não encontrado");

    // 2. Here we would call the actual email provider (Gmail API, Resend, etc.)
    // For now, we simulate success and register a new log
    console.log(`Simulating resend to ${data.newEmail || log.email}`);

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
  .input(z.object({
    templateId: z.string(),
    testEmail: z.string().email(),
  }))
  .handler(async ({ data }) => {
    const { data: template, error: tError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("id", data.templateId)
      .single();

    if (tError || !template) throw new Error("Template não encontrado");

    console.log(`Sending test email to ${data.testEmail} for template ${template.name}`);
    
    return { success: true };
  });

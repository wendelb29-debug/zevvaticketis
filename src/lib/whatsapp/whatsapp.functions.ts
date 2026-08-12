import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const sendWhatsAppMessage = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    contactId: z.string().uuid(),
    phone: z.string(),
    text: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const UAZAPI_BASE_URL = process.env['UAZAPI_BASE_URL'];
    
    // Fetch an active instance
    const { data: instance, error: instanceError } = await supabase
      .from('whatsapp_instances')
      .select('uazapi_token')
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    if (instanceError || !instance) {
      throw new Error("No active WhatsApp instance found");
    }

    if (!UAZAPI_BASE_URL) {
      throw new Error("UAZAPI_BASE_URL not configured");
    }

    // Normalizar telefone (apenas números)
    const normalizedPhone = data.phone.replace(/\D/g, '');

    const response = await fetch(`${UAZAPI_BASE_URL}/send/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': instance.uazapi_token
      },
      body: JSON.stringify({
        number: normalizedPhone,
        text: data.text,
        readchat: true,
        track_source: "zevva"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`UAZAPI Error: ${errorText}`);
    }

    const result = await response.json();

    // Record outbound message
    const { error: msgError } = await supabase
      .from('whatsapp_messages')
      .insert({
        contact_id: data.contactId,
        direction: 'outbound',
        content: data.text,
        status: 'sent',
        wa_message_id: result.messageId || result.id
      });

    if (msgError) console.error("Error logging message:", msgError);

    return { success: true, result };
  });

export const getWhatsAppContacts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from('whatsapp_contacts')
      .select('*, whatsapp_messages(content, created_at, direction, status)')
      .order('last_interaction_at', { ascending: false });

    if (error) throw error;
    return data;
  });

export const getWhatsAppMessages = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({
    contactId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('contact_id', data.contactId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return messages;
  });

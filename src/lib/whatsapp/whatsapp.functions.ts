import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const sendWhatsAppMessage = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    contactId: z.string().uuid(),
    phone: z.string(),
    text: z.string(),
    tenantId: z.string().uuid().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    const UAZAPI_BASE_URL = process.env['UAZAPI_BASE_URL'];
    
    // Fetch an active instance linked to the tenant if provided, or fallback to any active
    let query = supabase
      .from('whatsapp_instances')
      .select('uazapi_token')
      .eq('status', 'active');
    
    // Note: whatsapp_instances currently doesn't have tenant_id in schema, 
    // but whatsapp_integrations has project_id (which is tenant_id).
    // In a future migration we should link instances to tenants.
    
    const { data: instance, error: instanceError } = await query
      .limit(1)
      .maybeSingle();

    if (instanceError || !instance) {
      throw new Error("Nenhuma instância de WhatsApp ativa encontrada.");
    }

    if (!UAZAPI_BASE_URL) {
      throw new Error("Configuração UAZAPI_BASE_URL ausente no servidor.");
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
      throw new Error(`Erro na API WhatsApp: ${errorText}`);
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
  .inputValidator((data) => z.object({
    tenantId: z.string().uuid().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    let query = supabase
      .from('whatsapp_contacts')
      .select('*, whatsapp_messages(content, created_at, direction, status)')
      .order('last_interaction_at', { ascending: false });

    if (data.tenantId) {
      query = query.eq('tenant_id', data.tenantId);
    }

    const { data: contacts, error } = await query;

    if (error) throw error;
    return contacts;
  });

export const getWhatsAppIntegrationStatus = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({
    tenantId: z.string().uuid().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    if (!data.tenantId) return { status: 'offline', details: 'No tenant selected' };

    // Check whatsapp_integrations (Meta API)
    const { data: integration, error: integrationError } = await supabase
      .from('whatsapp_integrations')
      .select('status, updated_at')
      .eq('project_id', data.tenantId)
      .maybeSingle();

    if (integrationError) throw integrationError;

    // Check UAZAPI instances if no Meta API or if status is not active
    // This is a simplified check for connection "health"
    if (integration?.status === 'active') {
      return { 
        status: 'online', 
        type: 'meta',
        last_sync: integration.updated_at 
      };
    }

    // Fallback or check UAZAPI (mocked logic for now as instances aren't linked to tenants yet in schema)
    const { data: instance, error: instanceError } = await supabase
      .from('whatsapp_instances')
      .select('status')
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    if (instanceError) throw instanceError;

    if (instance) {
      return { status: 'online', type: 'uazapi' };
    }

    return { status: 'offline' };
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

export const markMessagesAsRead = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    contactId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from('whatsapp_messages')
      .update({ status: 'read' })
      .eq('contact_id', data.contactId)
      .eq('direction', 'inbound')
      .is('status', null); // Or different from 'read'

    if (error) throw error;
    return { success: true };
  });

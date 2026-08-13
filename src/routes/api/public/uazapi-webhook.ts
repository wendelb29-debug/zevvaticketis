import { createFileRoute } from '@tanstack/react-router';
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/api/public/uazapi-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: any;
        const url = new URL(request.url);
        const urlTenantId = url.searchParams.get('tenant_id');
        const instanceToken = request.headers.get('token') || url.searchParams.get('token');

        try {
          payload = await request.json();
          
          const eventType = payload.event || payload.type;
          
          // Solo procesamos mensajes entrantes que no sean de grupo
          if ((eventType === 'messages' || eventType === 'messages_upsert') && payload.data) {
            const msgData = payload.data;
            const rawPhone = msgData.key?.remoteJid?.split('@')[0];
            const isGroup = msgData.key?.remoteJid?.endsWith('@g.us');
            const fromMe = msgData.key?.fromMe;

            if (rawPhone && !isGroup && !fromMe) {
              const content = msgData.message?.conversation || 
                             msgData.message?.extendedTextMessage?.text || 
                             '';
              
              if (content) {
                // 1. Identify Tenant
                let tenantId = urlTenantId;
                
                if (!tenantId && instanceToken) {
                  const { data: inst } = await supabase
                    .from('whatsapp_instances')
                    .select('tenant_id')
                    .eq('uazapi_token', instanceToken)
                    .maybeSingle();
                  if (inst?.tenant_id) tenantId = inst.tenant_id;
                }

                // If still no tenantId, we might have to fallback to the first active tenant 
                // or log an error. For multi-tenancy, tenantId is REQUIRED.
                if (!tenantId) {
                  console.warn("Webhook received without tenant_id or valid instance token");
                  // Optional: fallback for single-tenant legacy support
                  // const { data: firstTenant } = await supabase.from('tenants').select('id').limit(1).single();
                  // tenantId = firstTenant?.id;
                }

                if (tenantId) {
                  const { data: normalizedPhone } = await supabase.rpc('normalize_phone', { p_phone: rawPhone }) as { data: string };
                  
                  if (!normalizedPhone) throw new Error("Falha na normalização do telefone");

                  // manual resolve/upsert to avoid type issues with composite onConflict for now
                  let { data: contact, error: contactErr } = await supabase
                    .from('whatsapp_contacts')
                    .select('id')
                    .eq('tenant_id', tenantId)
                    .eq('normalized_phone', normalizedPhone)
                    .maybeSingle();

                  if (!contact && !contactErr) {
                    const { data: newContact, error: createErr } = await supabase
                      .from('whatsapp_contacts')
                      .insert({ 
                        tenant_id: tenantId,
                        phone: rawPhone,
                        normalized_phone: normalizedPhone,
                        name: msgData.pushName || rawPhone,
                        last_interaction_at: new Date().toISOString(), // Usando o campo existente compatível
                        status: 'active',
                        channel: 'whatsapp'
                      })
                      .select('id')
                      .single();
                    
                    if (createErr) throw createErr;
                    contact = newContact;
                  } else if (contact) {
                    await supabase
                      .from('whatsapp_contacts')
                      .update({ 
                        last_interaction_at: new Date().toISOString(),
                        name: msgData.pushName || undefined
                      } as any)
                      .eq('id', contact.id);
                  }

                  if (contact) {
                    // 3. Resolve Attendance (Open or create new)
                    let { data: attendance } = await supabase
                      .from('whatsapp_attendances')
                      .select('id')
                      .eq('contact_id', contact.id)
                      .eq('tenant_id', tenantId)
                      .eq('status', 'active') 
                      .maybeSingle();

                    if (!attendance) {
                      const protocol = `${new Date().getFullYear()}${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
                      const { data: newAttendance, error: attendErr } = await supabase
                        .from('whatsapp_attendances')
                        .insert({
                          tenant_id: tenantId,
                          contact_id: contact.id,
                          status: 'waiting',
                          protocol,
                          channel: 'whatsapp',
                          started_at: new Date().toISOString()
                        } as any)
                        .select('id')
                        .single();
                      
                      if (attendErr) throw attendErr;
                      attendance = newAttendance;
                    }

                    // 4. Record inbound message
                    await supabase
                      .from('whatsapp_messages')
                      .insert({
                        contact_id: contact.id,
                        direction: 'inbound',
                        content,
                        wa_message_id: msgData.key.id,
                        status: 'received'
                      });
                  }
                }
              }
            }
          }

          return new Response('ok', { status: 200 });
        } catch (error: any) {
          console.error("Webhook processing error:", error);
          
          try {
             await supabase.from('whatsapp_webhook_errors').insert({
                event_type: String(payload?.event || 'unknown'),
                error_message: String(error.message || 'unknown error'),
                payload: payload
             } as any);
          } catch (logErr) {
             console.error("Failed to log webhook error:", logErr);
          }
          
          return new Response('error logged', { status: 200 });
        }
      }
    }
  }
});

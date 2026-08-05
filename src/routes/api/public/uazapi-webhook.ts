import { createFileRoute } from '@tanstack/react-router';
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/api/public/uazapi-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: any;
        try {
          payload = await request.json();
          
          const eventType = payload.event || payload.type;
          
          // Solo procesamos mensajes entrantes que no sean de grupo
          if ((eventType === 'messages' || eventType === 'messages_upsert') && payload.data) {
            const msgData = payload.data;
            const phone = msgData.key?.remoteJid?.split('@')[0];
            const isGroup = msgData.key?.remoteJid?.endsWith('@g.us');
            const fromMe = msgData.key?.fromMe;

            if (phone && !isGroup && !fromMe) {
              const content = msgData.message?.conversation || 
                             msgData.message?.extendedTextMessage?.text || 
                             '';
              
              if (content) {
                // 1. Resolve or create contact
                let { data: contact, error: contactErr } = await supabase
                  .from('whatsapp_contacts')
                  .select('id')
                  .eq('phone', phone)
                  .maybeSingle();

                if (!contact && !contactErr) {
                  const { data: newContact, error: createErr } = await supabase
                    .from('whatsapp_contacts')
                    .insert({ 
                      phone, 
                      name: msgData.pushName || phone,
                      last_interaction_at: new Date().toISOString()
                    })
                    .select('id')
                    .single();
                  
                  if (createErr) throw createErr;
                  contact = newContact;
                } else {
                   // Update last interaction
                   await supabase
                     .from('whatsapp_contacts')
                     .update({ last_interaction_at: new Date().toISOString() })
                     .eq('id', contact!.id);
                }

                if (contact) {
                  // 2. Record inbound message
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

          return new Response('ok', { status: 200 });
        } catch (error: any) {
          console.error("Webhook processing error:", error);
          
          // Log error but respond 200
          try {
             await supabase.from('whatsapp_webhook_errors').insert({
                event_type: payload?.event || 'unknown',
                error_message: error.message,
                payload: payload
             });
          } catch (logErr) {
             console.error("Failed to log webhook error:", logErr);
          }
          
          return new Response('error logged', { status: 200 });
        }
      }
    }
  }
});

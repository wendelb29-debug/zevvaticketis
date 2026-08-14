import { createFileRoute } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/api/public/stripe-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
          return new Response('Missing signature', { status: 400 });
        }

        try {
          // 1. Verify webhook signature (Stripe Library)
          // const event = stripe.webhooks.constructEvent(body, signature, process.env['STRIPE_WEBHOOK_SECRET']!);
          
          // Mocking event for now
          const event = JSON.parse(body);

          // 2. Check for idempotency using stripe_webhooks table
          const { data: existing, error: checkError } = await (await import('@/integrations/supabase/client.server')).supabaseAdmin
            .from('stripe_webhooks')
            .select('id, status')
            .eq('id', event.id)
            .single();

          if (existing && existing.status === 'processed') {
            return new Response('Event already processed', { status: 200 });
          }

          // 3. Log event as pending
          if (!existing) {
            await (await import('@/integrations/supabase/client.server')).supabaseAdmin.from('stripe_webhooks').insert({
              id: event.id,
              status: 'pending',
              event_type: event.type,
              payload: event
            });
          }

          // 4. Handle event types
          switch (event.type) {
            case 'payment_intent.succeeded':
              // Handle successful payment
              // Update order status, generate tickets, etc.
              break;
            case 'payment_intent.payment_failed':
              // Handle failed payment
              break;
          }

          // 5. Mark as processed
          await (await import('@/integrations/supabase/client.server')).supabaseAdmin.from('stripe_webhooks').update({
            status: 'processed',
            processed_at: new Date().toISOString()
          }).eq('id', event.id);

          return new Response('Webhook processed successfully', { status: 200 });
        } catch (err: any) {
          console.error('Webhook Error:', err.message);
          return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }
      }
    }
  }
});

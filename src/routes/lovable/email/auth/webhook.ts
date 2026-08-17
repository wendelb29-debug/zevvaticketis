import * as React from 'react'
import { createAuthEmailHandler } from '@lovable.dev/email-js'
import { createFileRoute } from '@tanstack/react-router'
import { SignupEmail } from '@/lib/email-templates/signup'
import { InviteEmail } from '@/lib/email-templates/invite'
import { MagicLinkEmail } from '@/lib/email-templates/magic-link'
import { RecoveryEmail } from '@/lib/email-templates/recovery'
import { EmailChangeEmail } from '@/lib/email-templates/email-change'
import { ReauthenticationEmail } from '@/lib/email-templates/reauthentication'
import { OrderTicketsEmail } from '@/lib/email-templates/order-tickets'

// Configuration
const SITE_NAME = "Zevva"
const SENDER_DOMAIN = "notify.zevvatickets.com"
const ROOT_DOMAIN = "zevvatickets.com"
const FROM_DOMAIN = "zevvatickets.com"
const SITE_URL = `https://${ROOT_DOMAIN}`

// The SDK handler owns verification, dispatch, and retry semantics; this file
// owns only the email decisions: subjects, templates, and per-type props.
const handler = createAuthEmailHandler({
  apiKey: process.env['LOVABLE_API_KEY']!,
  from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
  senderDomain: SENDER_DOMAIN,
  sendUrl: process.env['LOVABLE_SEND_URL'],
  emails: {
    signup: {
      subject: '🚨 IMPORTANTE: Confirme seu e-mail na Zevva',
      render: (data: any) =>
        React.createElement(SignupEmail, {
          confirmationUrl: data.url,
        }),
    },
    invite: {
      subject: '🚀 Convite Especial: Você foi convidado para a Zevva',
      render: (data: any) =>
        React.createElement(InviteEmail, {
          confirmationUrl: data.url,
          organizationName: data.data?.organization_name,
          invitedBy: data.data?.invited_by,
          role: data.data?.role,
        }),
    },
    magiclink: {
      subject: '🔐 Acesso Rápido: Entre na sua conta Zevva',
      render: (data: any) =>
        React.createElement(MagicLinkEmail, {
          confirmationUrl: data.url,
        }),
    },
    recovery: {
      subject: '🔑 Redefinição de Senha: Crie sua nova senha na Zevva',
      render: (data: any) =>
        React.createElement(RecoveryEmail, {
          confirmationUrl: data.url,
        }),
    },
    email_change: {
      subject: '📧 Atenção: Confirme seu novo e-mail na Zevva',
      render: (data: any) =>
        React.createElement(EmailChangeEmail, {
          newEmail: data.new_email ?? '',
          confirmationUrl: data.url,
        }),
    },
    reauthentication: {
      subject: '🛡️ Segurança: Seu código de verificação Zevva',
      render: (data: any) =>
        React.createElement(ReauthenticationEmail, { token: data.token ?? '' }),
    },
  },
})

// Custom handler for order tickets as it's not a standard Supabase Auth type
const orderTicketsHandler = async (request: Request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  
  try {
    const payload = await request.json();
    // In a real scenario, you'd verify a secret/signature here
    
    const html = await (await import('@react-email/render')).render(
      React.createElement(OrderTicketsEmail, {
        customerName: payload.customer_name,
        eventName: payload.event_name,
        orderId: payload.order_id,
        ticketCount: payload.ticket_count,
        viewTicketsUrl: payload.url,
      })
    );

    const response = await fetch(process.env['LOVABLE_SEND_URL'] || 'https://api.lovable.dev/v1/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env['LOVABLE_API_KEY']}`,
      },
      body: JSON.stringify({
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        to: payload.email,
        subject: `🎟️ Ingressos Disponíveis: ${payload.event_name || 'Seus ingressos'} chegaram!`,
        html,
        senderDomain: SENDER_DOMAIN,
        // Using "Important" marker in metadata/headers if supported by the provider
        headers: {
          'X-Priority': '1 (Highest)',
          'X-MSMail-Priority': 'High',
          'Importance': 'High',
        }
      }),
    });

    return new Response(await response.text(), { status: response.status });
  } catch (error) {
    return new Response(String(error), { status: 500 });
  }
}

export const Route = createFileRoute("/lovable/email/auth/webhook")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('type') === 'order_tickets') {
          return orderTicketsHandler(request);
        }
        return handler(request);
      },
    },
  },
})

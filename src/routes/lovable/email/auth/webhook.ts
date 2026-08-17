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
const SITE_NAME = "zevvaticketis"
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
      subject: 'Confirme seu e-mail para acessar a Zevva',
      render: (data) =>
        React.createElement(SignupEmail, {
          confirmationUrl: data.url,
        }),
    },
    invite: {
      subject: 'Você recebeu um convite para acessar a Zevva',
      render: (data) =>
        React.createElement(InviteEmail, {
          confirmationUrl: data.url,
          // metadata can be passed via data.data if the SDK version supports it
          organizationName: (data as any).data?.organization_name,
          invitedBy: (data as any).data?.invited_by,
          role: (data as any).data?.role,
        }),
    },
    magiclink: {
      subject: 'Seu acesso seguro à Zevva',
      render: (data) =>
        React.createElement(MagicLinkEmail, {
          confirmationUrl: data.url,
        }),
    },
    recovery: {
      subject: 'Redefina sua senha da Zevva',
      render: (data) =>
        React.createElement(RecoveryEmail, {
          confirmationUrl: data.url,
        }),
    },
    email_change: {
      subject: 'Confirme a alteração do seu e-mail na Zevva',
      render: (data) =>
        React.createElement(EmailChangeEmail, {
          newEmail: data.new_email ?? '',
          confirmationUrl: data.url,
        }),
    },
    reauthentication: {
      subject: 'Código de segurança da Zevva',
      render: (data) =>
        React.createElement(ReauthenticationEmail, { token: data.token ?? '' }),
    },
    order_tickets: {
      subject: 'Seus ingressos da Zevva chegaram!',
      render: (data) =>
        React.createElement(OrderTicketsEmail, {
          customerName: (data as any).data?.customer_name,
          eventName: (data as any).data?.event_name,
          orderId: (data as any).data?.order_id,
          ticketCount: (data as any).data?.ticket_count,
          viewTicketsUrl: data.url,
        }),
    },
  },
})

export const Route = createFileRoute("/lovable/email/auth/webhook")({
  server: {
    handlers: {
      POST: ({ request }) => handler(request),
    },
  },
})

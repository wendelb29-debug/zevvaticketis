import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/api/public/tickets/share/$token')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { token } = params
        
        const { data: ticket, error } = await supabase
          .from('tickets')
          .select('id')
          .eq('share_token', token)
          .single()

        if (error || !ticket) {
          return new Response('Link expirado ou inválido', { status: 404 })
        }

        return Response.redirect(`${process.env.VITE_SITE_URL || 'http://localhost:8080'}/tickets/${ticket.id}`, 302)
      }
    }
  }
})

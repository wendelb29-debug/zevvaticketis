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
          .eq('qr_code', token) // Temporary fallback until share_token migration runs
          .single()

        if (error || !ticket) {
          return new Response('Link expirado ou inválido', { status: 404 })
        }

        const siteUrl = process.env['VITE_SITE_URL'] || 'http://localhost:8080'
        return Response.redirect(`${siteUrl}/tickets/${ticket.id}`, 302)
      }
    }
  }
})

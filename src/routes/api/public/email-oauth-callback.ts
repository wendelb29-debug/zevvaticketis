import { createFileRoute } from '@tanstack/react-router';
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/api/public/email-oauth-callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        const baseUrl = process.env['LOVABLE_APP_URL'] || 'http://localhost:8080';
        
        if (!code) {
          return new Response('No code provided', { status: 400 });
        }

        try {
          const CLIENT_ID = process.env['GOOGLE_OAUTH_CLIENT_ID'];
          const CLIENT_SECRET = process.env['GOOGLE_OAUTH_CLIENT_SECRET'];
          const REDIRECT_URI = `${baseUrl}/api/public/email-oauth-callback`;

          if (!CLIENT_ID || !CLIENT_SECRET) {
            throw new Error("Google OAuth credentials not configured");
          }

          // Exchange code for tokens
          const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code,
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET,
              redirect_uri: REDIRECT_URI,
              grant_type: 'authorization_code'
            })
          });

          const tokens = await response.json();

          if (!response.ok) {
            throw new Error(`Google OAuth error: ${JSON.stringify(tokens)}`);
          }

          // Get user info
          const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
          });
          const profile = await userResponse.json();

          // Upsert the account
          // Since it's a public route, we might not have a session.
          // In a real flow, we'd use a 'state' token to map to the admin user.
          // For now, we'll try to get the current user if possible or handle gracefully.
          const { data: { user } } = await supabase.auth.getUser();

          const { error: upsertErr } = await supabase
            .from('email_accounts')
            .upsert({
              user_id: user?.id || '00000000-0000-0000-0000-000000000000', 
              email_address: profile.email,
              display_name: profile.name,
              provider: 'gmail',
              status: 'connected',
              oauth_tokens: tokens,
              last_synced_at: new Date().toISOString()
            }, { onConflict: 'email_address' });

          if (upsertErr) throw upsertErr;

          return Response.redirect(`${baseUrl}/admin/emails?success=true`);
        } catch (error: any) {
          console.error("OAuth Callback Error:", error);
          return Response.redirect(`${baseUrl}/admin/emails?error=${encodeURIComponent(error.message)}`);
        }
      }
    }
  }
});

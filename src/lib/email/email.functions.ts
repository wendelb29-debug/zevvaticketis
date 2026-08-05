import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// Individual integrations (one per user)
export const getEmailIntegrations = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from('email_integrations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  });

export const getIndividualEmailMessages = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({
    integrationId: z.string().uuid(),
    folder: z.string().optional(),
    search: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    let query = supabase
      .from('email_messages_individual')
      .select('*')
      .eq('integration_id', data.integrationId)
      .order('received_at', { ascending: false });
    
    if (data.folder) query = query.eq('folder', data.folder);
    if (data.search) query = query.ilike('subject', `%${data.search}%`);

    const { data: messages, error } = await query;
    if (error) throw error;
    return messages;
  });

export const startGmailOAuth = createServerFn({ method: "POST" })
  .handler(async () => {
    const CLIENT_ID = process.env['GOOGLE_OAUTH_CLIENT_ID'];
    const REDIRECT_URI = `${process.env['LOVABLE_APP_URL'] || 'http://localhost:8080'}/api/public/email-oauth-callback`;
    
    if (!CLIENT_ID) {
      // For development, we might not have the secret yet
      console.warn("GOOGLE_OAUTH_CLIENT_ID not configured");
    }

    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'openid',
      'email',
      'profile'
    ];

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
      `client_id=${CLIENT_ID || 'dummy_id'}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scopes.join(' '))}` +
      `&access_type=offline` +
      `&prompt=consent`;

    return { url: authUrl };
  });

export const disconnectGmail = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    integrationId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from('email_integrations')
      .delete()
      .eq('id', data.integrationId);
    if (error) throw error;
    return { success: true };
  });

export const sendIndividualEmail = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    integrationId: z.string().uuid(),
    to: z.string(),
    subject: z.string(),
    content: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: integration } = await supabase
      .from('email_integrations')
      .select('email_address')
      .eq('id', data.integrationId)
      .single();

    if (!integration) throw new Error("Integration not found");

    // Simulation: In production, this would use Gmail API with the stored access_token
    await supabase.from('email_messages_individual').insert({
      integration_id: data.integrationId,
      from_email: integration.email_address,
      to_emails: [data.to],
      subject: data.subject,
      body_text: data.content,
      folder: 'sent',
      received_at: new Date().toISOString()
    });

    return { success: true };
  });

// Legacy (shared) - keep for compatibility if needed elsewhere
export const getEmailAccounts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from('email_accounts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  });

export const getEmailMessages = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({
    accountId: z.string().uuid(),
    folder: z.string().optional(),
    search: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    let query = supabase
      .from('email_messages')
      .select('*')
      .eq('account_id', data.accountId)
      .order('received_at', { ascending: false });
    
    if (data.folder) query = query.eq('folder', data.folder);
    if (data.search) query = query.ilike('subject', `%${data.search}%`);

    const { data: messages, error } = await query;
    if (error) throw error;
    return messages;
  });

export const sendEmail = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    accountId: z.string().uuid(),
    to: z.string(),
    subject: z.string(),
    content: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: account } = await supabase
      .from('email_accounts')
      .select('email_address')
      .eq('id', data.accountId)
      .single();

    await supabase.from('email_messages').insert({
      account_id: data.accountId,
      from_email: account?.email_address || '',
      to_emails: [data.to],
      subject: data.subject,
      body_text: data.content,
      folder: 'sent',
      received_at: new Date().toISOString()
    });

    return { success: true };
  });

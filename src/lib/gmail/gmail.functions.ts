import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";
const CONNECTOR_ID = "google_mail";

const GMAIL_SCOPES = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];

/** [OAuth Start] Gera a URL de consentimento do Google para o usuário logado. */
export const startGmailConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const clientAPIKey = process.env['GOOGLE_MAIL_APP_USER_CONNECTOR_CLIENT_API_KEY'];
    if (!clientAPIKey) {
      throw new Error("Integração Gmail não configurada (client API key ausente).");
    }
    const request = getRequest();
    if (!request) throw new Error("OAuth precisa ser iniciado a partir do aplicativo.");
    const returnUrl = new URL("/oauth/google/return", request.url).toString();

    const { authorizeAppUserOAuth } = await import("@/integrations/lovable/appUserConnector");
    const { getConnectionKeyForUser } = await import("./appUserConnections.server");
    const existing = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);

    console.log("[OAuth Start] user:", context.userId, "reconnect:", !!existing);
    console.log("[OAuth Config] Redirect URI para Google Cloud Console: https://connector-gateway.lovable.dev/oauth/callback");

    const { authorizationUrl } = await authorizeAppUserOAuth({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectorId: CONNECTOR_ID,
      appUserId: context.userId,
      clientAPIKey,
      returnUrl,
      connectionAPIKey: existing ?? undefined,
      credentialsConfiguration: { scopes: GMAIL_SCOPES },
    });
    return { authorizationUrl };
  });

/** [OAuth Callback] Troca o code por credencial e salva criptografada. */
export const completeGmailConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ code: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const { exchangeAppUserOAuthCode, callAsAppUser } = await import(
      "@/integrations/lovable/appUserConnector"
    );
    const { saveConnectionKeyForUser } = await import("./appUserConnections.server");

    console.log("[Token Exchange] user:", context.userId);
    const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(
      GATEWAY_BASE_URL,
      data.code,
    );
    if (connectorId !== CONNECTOR_ID) throw new Error("Conector inesperado no retorno do OAuth.");

    let account: { email?: string | null; name?: string | null; photo?: string | null } = {};
    try {
      const res = await callAsAppUser({
        gatewayBaseUrl: GATEWAY_BASE_URL,
        connectionAPIKey,
        connectorId: CONNECTOR_ID,
        path: "/gmail/v1/users/me/profile",
      });
      if (res.ok) {
        const profile = (await res.json()) as { emailAddress?: string };
        account = { email: profile.emailAddress ?? null };
      }
    } catch (e) {
      console.warn("[OAuth Callback] falha ao ler perfil Gmail", e);
    }

    await saveConnectionKeyForUser(context.userId, CONNECTOR_ID, connectionAPIKey, account);
    console.log("[User Connected]", context.userId, account.email);
    return { ok: true };
  });

/** Status da conexão do usuário logado. */
export const getGmailStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getConnectionRowForUser } = await import("./appUserConnections.server");
    const row = await getConnectionRowForUser(context.userId, CONNECTOR_ID);
    if (!row) return { connected: false as const };
    return {
      connected: true as const,
      email: row.account_email,
      name: row.account_name,
      photo: row.account_photo,
      connectedAt: row.created_at,
    };
  });

function headerValue(headers: any[], name: string) {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

/** Lista mensagens da caixa do próprio usuário. */
export const listGmailMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        labelId: z.string().default("INBOX"),
        q: z.string().optional(),
        maxResults: z.number().min(1).max(50).default(20),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { callAsAppUser } = await import("@/integrations/lovable/appUserConnector");
    const { getConnectionKeyForUser } = await import("./appUserConnections.server");
    const connectionAPIKey = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    if (!connectionAPIKey) throw new Error("Gmail não conectado para este usuário.");

    const params = new URLSearchParams({
      maxResults: String(data.maxResults),
      labelIds: data.labelId,
    });
    if (data.q) params.set("q", data.q);

    const listRes = await callAsAppUser({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectionAPIKey,
      connectorId: CONNECTOR_ID,
      path: `/gmail/v1/users/me/messages?${params.toString()}`,
    });
    if (!listRes.ok) {
      const body = await listRes.text();
      console.error(`[Gmail] list falhou [${listRes.status}]: ${body}`);
      throw new Error(`Falha ao listar mensagens [${listRes.status}]: ${body}`);
    }
    const list = (await listRes.json()) as { messages?: { id: string }[] };
    const ids = (list.messages ?? []).slice(0, data.maxResults);

    const messages = await Promise.all(
      ids.map(async ({ id }) => {
        const res = await callAsAppUser({
          gatewayBaseUrl: GATEWAY_BASE_URL,
          connectionAPIKey,
          connectorId: CONNECTOR_ID,
          path: `/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
        });
        if (!res.ok) return null;
        const m = (await res.json()) as any;
        const h = m.payload?.headers ?? [];
        return {
          id: m.id as string,
          threadId: m.threadId as string,
          from: headerValue(h, "From"),
          to: headerValue(h, "To"),
          subject: headerValue(h, "Subject") || "(sem assunto)",
          date: headerValue(h, "Date"),
          snippet: (m.snippet as string) ?? "",
          unread: (m.labelIds ?? []).includes("UNREAD"),
        };
      }),
    );

    return messages.filter(Boolean) as Array<{
      id: string; threadId: string; from: string; to: string;
      subject: string; date: string; snippet: string; unread: boolean;
    }>;
  });

/** Envia e-mail pela conta do próprio usuário. */
export const sendGmailMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        to: z.string().min(3).max(500),
        subject: z.string().max(300),
        body: z.string().max(20000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { callAsAppUser } = await import("@/integrations/lovable/appUserConnector");
    const { getConnectionKeyForUser } = await import("./appUserConnections.server");
    const connectionAPIKey = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    if (!connectionAPIKey) throw new Error("Gmail não conectado para este usuário.");

    const mime = [
      `To: ${data.to}`,
      `Subject: ${data.subject}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "",
      data.body,
    ].join("\r\n");
    const raw = Buffer.from(mime, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await callAsAppUser({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectionAPIKey,
      connectorId: CONNECTOR_ID,
      path: "/gmail/v1/users/me/messages/send",
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw }),
      },
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[Gmail] envio falhou [${res.status}]: ${body}`);
      throw new Error(`Falha ao enviar e-mail [${res.status}]: ${body}`);
    }
    return { ok: true };
  });

/** Desconecta a conta Gmail do usuário logado. */
export const disconnectGmailAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { disconnectAppUser } = await import("@/integrations/lovable/appUserConnector");
    const { getConnectionKeyForUser, deleteConnectionForUser } = await import(
      "./appUserConnections.server"
    );
    const connectionAPIKey = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    if (connectionAPIKey) {
      try {
        await disconnectAppUser({
          gatewayBaseUrl: GATEWAY_BASE_URL,
          connectionAPIKey,
          connectorId: CONNECTOR_ID,
        });
      } catch (e) {
        console.warn("[Gmail] disconnect gateway falhou", e);
      }
    }
    await deleteConnectionForUser(context.userId, CONNECTOR_ID);
    return { ok: true };
  });

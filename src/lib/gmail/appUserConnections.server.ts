// Server-only storage for per-user connector connection keys.
import { encryptConnectionKey, decryptConnectionKey } from "./connectionKeyCrypto.server";

export type ConnectionAccount = {
  email?: string | null;
  name?: string | null;
  photo?: string | null;
};

export async function saveConnectionKeyForUser(
  userId: string,
  connectorId: string,
  connectionAPIKey: string,
  account: ConnectionAccount = {},
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await (supabaseAdmin as any).from("app_user_connections").upsert(
    {
      user_id: userId,
      connector_id: connectorId,
      connection_key_ciphertext: encryptConnectionKey(connectionAPIKey),
      account_email: account.email ?? null,
      account_name: account.name ?? null,
      account_photo: account.photo ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,connector_id" },
  );
  if (error) throw error;
}

export async function updateConnectionAccount(
  userId: string,
  connectorId: string,
  account: ConnectionAccount,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await (supabaseAdmin as any)
    .from("app_user_connections")
    .update({
      account_email: account.email ?? null,
      account_name: account.name ?? null,
      account_photo: account.photo ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("connector_id", connectorId);
}

export async function getConnectionRowForUser(userId: string, connectorId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await (supabaseAdmin as any)
    .from("app_user_connections")
    .select("connection_key_ciphertext, account_email, account_name, account_photo, created_at")
    .eq("user_id", userId)
    .eq("connector_id", connectorId)
    .maybeSingle();
  if (error) throw error;
  return data as
    | {
        connection_key_ciphertext: string;
        account_email: string | null;
        account_name: string | null;
        account_photo: string | null;
        created_at: string;
      }
    | null;
}

export async function getConnectionKeyForUser(userId: string, connectorId: string) {
  const row = await getConnectionRowForUser(userId, connectorId);
  return row ? decryptConnectionKey(row.connection_key_ciphertext) : null;
}

export async function deleteConnectionForUser(userId: string, connectorId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await (supabaseAdmin as any)
    .from("app_user_connections")
    .delete()
    .eq("user_id", userId)
    .eq("connector_id", connectorId);
}

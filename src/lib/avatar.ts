import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const AVATAR_BUCKET = "avatars";
const cache = new Map<string, string>();

/**
 * Aceita tanto o caminho salvo no storage ("user-id/avatar-123.png")
 * quanto URLs legadas (públicas/assinadas) e devolve sempre o caminho.
 */
export function toAvatarPath(value?: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("http")) return value;
  const marker = `/${AVATAR_BUCKET}/`;
  const idx = value.indexOf(marker);
  if (idx === -1) return null;
  return value.slice(idx + marker.length).split("?")[0] ?? null;
}

export async function getAvatarUrl(value?: string | null): Promise<string | null> {
  const path = toAvatarPath(value);
  if (!path) return null;
  const cached = cache.get(path);
  if (cached) return cached;

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  if (error || !data?.signedUrl) return null;
  cache.set(path, data.signedUrl);
  return data.signedUrl;
}

export function clearAvatarCache(value?: string | null) {
  const path = toAvatarPath(value);
  if (path) cache.delete(path);
  else cache.clear();
}

/** Hook para exibir o avatar em qualquer ponto do sistema. */
export function useAvatarUrl(value?: string | null): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let active = true;
    if (!value) {
      setUrl(undefined);
      return;
    }
    getAvatarUrl(value).then((signed) => {
      if (active) setUrl(signed ?? undefined);
    });
    return () => {
      active = false;
    };
  }, [value]);

  return url;
}

export { AVATAR_BUCKET };

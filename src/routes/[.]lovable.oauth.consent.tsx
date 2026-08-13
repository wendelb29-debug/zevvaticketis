import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthorizationDetails = {
  client?: { name?: string | null } | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s['authorization_id'] === "string" ? s['authorization_id'] : "",
  }),
  component: ConsentPage,
});

function ConsentPage() {
  const { authorization_id } = Route.useSearch();
  const [session, setSession] = useState<unknown>(null);
  const [checking, setChecking] = useState(true);
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email/password sign-in state (the app's own auth method)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session || !authorization_id) return;
    let active = true;
    oauthApi()
      .getAuthorizationDetails(authorization_id)
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) {
          setError(err.message);
          return;
        }
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      });
    return () => {
      active = false;
    };
  }, [session, authorization_id]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error: err } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("O servidor de autorização não retornou um redirecionamento.");
      return;
    }
    window.location.href = target;
  }

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) setError(err.message);
  }

  async function signInWithGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.href,
    });
    if (result.error) setError(result.error.message);
  }

  if (!authorization_id) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">Requisição de autorização inválida.</p>
      </Shell>
    );
  }

  if (checking) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </Shell>
    );
  }

  if (!session) {
    return (
      <Shell>
        <h1 className="text-2xl font-manrope font-extrabold text-foreground">Entre para continuar</h1>
        <p className="text-sm text-muted-foreground">
          Faça login na Zevva Tickets para autorizar o acesso do aplicativo.
        </p>
        {error && <p role="alert" className="text-sm text-coral">{error}</p>}
        <Button
          variant="outline"
          onClick={signInWithGoogle}
          className="w-full h-12 rounded-[14px] border-line font-extrabold text-foreground"
        >
          Continuar com Google
        </Button>
        <form onSubmit={signInWithPassword} className="space-y-3">
          <Input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-[14px] border-line"
            required
          />
          <Input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-[14px] border-line"
            required
          />
          <Button disabled={busy} className="w-full h-12 rounded-[14px] bg-coral hover:bg-coral-dark text-white font-extrabold">
            {busy ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </Shell>
    );
  }

  const clientName = details?.client?.name ?? "um aplicativo";

  return (
    <Shell>
      <h1 className="text-2xl font-manrope font-extrabold text-foreground">
        Conectar {clientName} à sua conta
      </h1>
      <p className="text-sm text-muted-foreground">
        Isso permite que {clientName} acesse a Zevva Tickets como você — seus eventos e ingressos.
      </p>
      {error && <p role="alert" className="text-sm text-coral">{error}</p>}
      <div className="flex gap-3">
        <Button
          disabled={busy}
          onClick={() => decide(true)}
          className="flex-1 h-12 rounded-[14px] bg-coral hover:bg-coral-dark text-white font-extrabold"
        >
          Autorizar
        </Button>
        <Button
          disabled={busy}
          variant="outline"
          onClick={() => decide(false)}
          className="flex-1 h-12 rounded-[14px] border-line font-extrabold text-foreground"
        >
          Recusar
        </Button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-card p-6">
      <div className="w-full max-w-md space-y-5 rounded-[24px] border border-line p-8 shadow-xl">
        {children}
      </div>
    </main>
  );
}

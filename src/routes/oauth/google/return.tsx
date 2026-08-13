import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { completeGmailConnect } from "@/lib/gmail/gmail.functions";

export const Route = createFileRoute("/oauth/google/return")({
  component: OAuthReturn,
  head: () => ({
    meta: [
      { title: "Conectando Gmail — Zevva" },
      { name: "description", content: "Finalizando a conexão da sua conta Google com o Zevva." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function OAuthReturn() {
  const [message, setMessage] = useState("Finalizando a conexão…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notify = (
      type: "appUserConnectorOAuthComplete" | "appUserConnectorOAuthFailed",
    ) => {
      window.opener?.postMessage(
        { type, connectorId: "google_mail" },
        window.location.origin,
      );
      window.close();
    };

    if (params.get("success") !== "true") {
      setMessage(params.get("error") ?? "A autorização não foi concluída.");
      notify("appUserConnectorOAuthFailed");
      return;
    }
    const code = params.get("code");
    if (!code) {
      if (params.get("offline_access_allowed") === "false") {
        notify("appUserConnectorOAuthComplete");
        return;
      }
      setMessage("A autorização terminou sem código de troca.");
      notify("appUserConnectorOAuthFailed");
      return;
    }
    void completeGmailConnect({ data: { code } })
      .then(() => notify("appUserConnectorOAuthComplete"))
      .catch(() => {
        setMessage("Não foi possível concluir a conexão.");
        notify("appUserConnectorOAuthFailed");
      });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="text-center space-y-3">
        <div className="mx-auto h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <h1 className="text-lg font-semibold text-foreground">{message}</h1>
        <p className="text-sm text-muted-foreground-foreground">Você pode fechar esta janela.</p>
      </div>
    </main>
  );
}

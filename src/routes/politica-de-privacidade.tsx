import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/politica-de-privacidade")({
  component: PrivacyPolicyPage,
  head: () => ({
    title: "Política de Privacidade — Zevva",
    meta: [{ name: "description", content: "Política de Privacidade do Zevva Tickets." }],
  }),
});

function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-manrope font-extrabold text-foreground mb-8 tracking-tighter uppercase">Política de Privacidade</h1>
      <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground font-medium">
        <p>A sua privacidade é importante para nós. É política do Zevva respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site Zevva, e outros sites que possuímos e operamos.</p>
        <h2 className="text-xl font-bold text-foreground pt-4">1. Coleta de Informações</h2>
        <p>Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento.</p>
        <h2 className="text-xl font-bold text-foreground pt-4">2. Uso de Dados</h2>
        <p>O Zevva utiliza a integração com o Google Gmail para permitir que você gerencie seus e-mails diretamente pela nossa plataforma. Nós acessamos apenas as permissões autorizadas por você (leitura e envio) e não compartilhamos seus dados de e-mail com terceiros.</p>
        <h2 className="text-xl font-bold text-foreground pt-4">3. Retenção de Dados</h2>
        <p>Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado.</p>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/termos-de-uso")({
  component: TermsOfUsePage,
  head: () => ({
    title: "Termos de Uso — Zevva",
    meta: [{ name: "description", content: "Termos de Uso do Zevva Tickets." }],
  }),
});

function TermsOfUsePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-manrope font-extrabold text-foreground mb-8 tracking-tighter uppercase">Termos de Uso</h1>
      <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground font-medium">
        <p>Ao acessar ao site Zevva, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.</p>
        <h2 className="text-xl font-bold text-foreground pt-4">1. Licença de Uso</h2>
        <p>É concedida permissão para baixar temporariamente uma cópia dos materiais no site Zevva , apenas para visualização transitória pessoal e não comercial.</p>
        <h2 className="text-xl font-bold text-foreground pt-4">2. Isenção de Responsabilidade</h2>
        <p>Os materiais no site do Zevva são fornecidos 'como estão'. O Zevva não oferece garantias, expressas ou implícitas.</p>
        <h2 className="text-xl font-bold text-foreground pt-4">3. Integrações de Terceiros</h2>
        <p>O uso da integração com o Google Gmail está sujeito aos Termos de Serviço do Google.</p>
      </div>
    </div>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Zevva Tickets | Marketplace de Eventos Internacionais" },
      { name: "description", content: "A melhor plataforma para compra e venda de ingressos para eventos internacionais." },
      { name: "author", content: "Zevva" },
      { property: "og:title", content: "Zevva Tickets | Marketplace de Eventos Internacionais" },
      { property: "og:description", content: "A melhor plataforma para compra e venda de ingressos para eventos internacionais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ZevvaTickets" },
      { name: "twitter:title", content: "Zevva Tickets | Marketplace de Eventos Internacionais" },
      { name: "twitter:description", content: "A melhor plataforma para compra e venda de ingressos para eventos internacionais." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c02bb44c-2349-483b-9f0a-835ed1f5d1e7/id-preview-ab517681--7712cd0a-8aef-4478-85d0-5e64a49c39bb.lovable.app-1785873460721.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c02bb44c-2349-483b-9f0a-835ed1f5d1e7/id-preview-ab517681--7712cd0a-8aef-4478-85d0-5e64a49c39bb.lovable.app-1785873460721.png" },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="o seu sistema de caravanas e igrejas internacionais. 1. Frente do site (lado comprador) A home é organizada por coleções curadas: promoções, teatro, festas e shows, esportes, congressos, passeios e tours, infantil, cursos, gastronomia, religião e espiritualidade, eventos online, entre outras. Existe busca por texto (Buscar experiências), filtro por localização (Qualquer lugar) e atalhos por cidade e por data (hoje, amanhã, este fim de semana, este mês). O login aceita conta sem senha, Google, Facebook ou e-mail/senha, e há botão de cadastro separado. 2. Página do evento Cada evento traz título, data/hora de início e fim, endereço com link para mapa, banner, botão de compartilhar, player de audiodescrição (acessibilidade), descrição rica em texto, política específica do evento (por exemplo, no caso que vi: ingresso social trocado por doação de alimento, e regras de meia-entrada por idade), política de cancelamento e de edição de participante (com prazos claros, ex.: até 7 dias após a compra e até 48h antes do evento), informações do organizador com botão seguir e fale com o produtor, opção de denunciar evento suspeito, e um bloco de métodos de pagamento com garantia de segurança dos dados. 3. Seleção de ingresso e checkout O painel lateral Escolha uma opção separa por sessão/data (ex.: domingo vs sábado, sendo um deles marcado como Esgotado). Ao entrar numa sessão, aparecem os tipos de ingresso em lotes progressivos (ex.: Lote 3), cada um com preço base, taxa de serviço destacada separadamente, seletor de quantidade (+/-), parcelamento em até 12x e prazo-limite de venda. Também há tipos especiais como meia-entrada e ingresso solidário, além de campo para cupom de desconto. Depois da seleção, o fluxo normal do Sympla segue para cadastro de dados de cada participante, escolha de pagamento (cartão parcelado, Pix, boleto) e emissão do ingresso digital com QR code para check-in. 4. Painel do organizador/produtor Essa parte fica em um subdomínio próprio que exige login (não entrei, pois não faço login em nome do usuário), mas pela chamada pública da plataforma (Publicação grátis: sem taxa de adesão ou mensalidade, Da publicação à venda: suporte em todas as etapas) e pelo conhecimento geral sobre o produto, a estrutura típica inclui: criação de evento (presencial ou online, categoria, banner, descrição, políticas), configuração de lotes e tipos de ingresso (pago, gratuito, cortesia, meia-entrada, solidário), cupons de desconto, definição de quem absorve a taxa de serviço, gestão financeira com repasses automáticos e relatórios de vendas, lista de participantes exportável, aplicativo de check-in próprio, emissão de certificados (usado em cursos), divulgação com pixel de rastreamento/UTM e API para integrações externas. 5. Suporte institucional Há central de ajuda separada para compradores e para produtores, aplicativo mobile (iOS/Android), páginas de termos de uso, ética e conduta, política de direitos humanos e mapa do site. Aplicação para o seu caso (caravanas e igrejas internacionais) Pensando no seu produto, alguns pontos do Sympla que fazem muito sentido replicar: sistema de lotes com preço progressivo (cria urgência e antecipação de caixa), tipos de ingresso diferenciados (inteira, meia, cortesia, solidário), taxa de serviço transparente e configurável (quem paga: comprador ou organizador), políticas claras de cancelamento e edição de titularidade com prazos, emissão de ingresso com QR code para check-in no embarque do ônibus, painel de participantes exportável (essencial para caravanas — lista de passageiros por veículo/data), e app de check-in. Pontos que você provavelmente vai querer adicionar, que o Sympla não cobre bem porque não é o foco dele: gestão de vagas por ônibus/vans (capacidade por veículo, não só por evento), multi-datas de saída (múltiplas caravanas para o mesmo destino), pagamento internacional/multi-moeda (para participantes de igrejas fora do Brasil), lista de espera automática quando um veículo lota, e integração com WhatsApp para comunicação com os participantes antes da viagem.">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUI } from "@/hooks/use-ui";
import { getTranslations } from "@/lib/i18n-utils";

export function FAQAccordion() {
  const { language } = useUI();
  const t = getTranslations(language).home;

  const faqs = [
    {
      question: t.faq1Question || "Como funcionam as caravanas internacionais?",
      answer: t.faq1Answer || "Nossas caravanas são pacotes completos que incluem passagem, hospedagem, roteiro guiado e acesso a eventos. Tudo é gerenciado através da nossa plataforma com total segurança."
    },
    {
      question: t.faq2Question || "Posso pagar com cartão de crédito internacional?",
      answer: t.faq2Answer || "Sim! Aceitamos cartões de crédito internacionais, Apple Pay, Google Pay e também Pix com cotação atualizada em tempo real para sua comodidade."
    },
    {
      question: t.faq3Question || "Como recebo meu ingresso após a compra?",
      answer: t.faq3Answer || "Imediatamente após a confirmação do pagamento, seu ingresso digital com QR Code estará disponível na seção 'Meus Ingressos' da sua conta Zevva."
    },
    {
      question: t.faq4Question || "É seguro comprar na Zevva Tickets?",
      answer: t.faq4Answer || "Sim. Utilizamos tecnologia de ponta para processamento de pagamentos e criptografia de dados, garantindo que sua experiênca seja 100% protegida."
    }
  ];

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {faqs.map((faq, index) => (
        <AccordionItem 
          key={index} 
          value={`item-${index}`}
          className="border-b border-border px-0 bg-transparent transition-all shadow-none mb-0 group"
        >
          <AccordionTrigger className="text-left font-bold text-lg md:text-xl hover:no-underline hover:text-primary transition-colors py-6 text-foreground">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground font-medium text-base leading-relaxed pb-6 max-w-2xl">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funcionam as caravanas internacionais?",
    answer: "Nossas caravanas são pacotes completos que incluem passagem, hospedagem, roteiro guiado e acesso a eventos. Tudo é gerenciado através da nossa plataforma com total segurança."
  },
  {
    question: "Posso pagar com cartão de crédito internacional?",
    answer: "Sim! Aceitamos cartões de crédito internacionais, Apple Pay, Google Pay e também Pix com cotação atualizada em tempo real para sua comodidade."
  },
  {
    question: "Como recebo meu ingresso após a compra?",
    answer: "Imediatamente após a confirmação do pagamento, seu ingresso digital com QR Code estará disponível na seção 'Meus Ingressos' da sua conta Zevva."
  },
  {
    question: "É seguro comprar na Zevva Tickets?",
    answer: "Sim. Utilizamos tecnologia de ponta para processamento de pagamentos e criptografia de dados, garantindo que sua experiência seja 100% protegida."
  }
];

export function FAQAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {faqs.map((faq, index) => (
        <AccordionItem 
          key={index} 
          value={`item-${index}`}
          className="border border-white/10 rounded-2xl px-6 bg-white/5 data-[state=open]:bg-white/10 transition-all"
        >
          <AccordionTrigger className="text-left font-bold text-lg hover:no-underline hover:text-gold transition-colors py-6">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-white/60 font-medium leading-relaxed pb-6">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

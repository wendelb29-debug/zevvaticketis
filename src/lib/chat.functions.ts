import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getAiChatSuggestions = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    messages: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string()
    })),
    context: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    const { messages, context } = data;
    
    // We would normally call AI Gateway here
    // For now, return contextual mock suggestions that match Zevva's mission
    const suggestions = [
      "Olá! Como posso ajudar com a sua reserva para a Caravana Israel?",
      "Temos pacotes especiais para grupos acima de 10 pessoas. Deseja uma cotação?",
      "Os ingressos para o Congresso de Liderança estão no segundo lote. Posso te enviar o link?"
    ];

    return { suggestions };
  });

export const uploadChatMessageFile = createServerFn({ method: "POST" })
  .inputValidator((data) => z.instanceof(FormData).parse(data))
  .handler(async ({ data }) => {
    // Logic for Supabase Storage upload would go here
    return { url: "https://example.com/mock-file.pdf", name: "contrato_zevva.pdf" };
  });

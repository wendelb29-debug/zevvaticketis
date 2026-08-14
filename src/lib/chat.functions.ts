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
    
    // In a production environment, this would call the AI Gateway
    const suggestions = [
      "Olá! Como posso ajudar com a sua reserva?",
      "Temos pacotes especiais para grupos. Deseja uma cotação?",
      "Os ingressos estão no segundo lote. Posso te enviar o link?"
    ];

    return { suggestions };
  });

export const uploadChatMessageFile = createServerFn({ method: "POST" })
  .inputValidator((data) => z.instanceof(FormData).parse(data))
  .handler(async ({ data }) => {
    // Logic for Supabase Storage upload would go here
    return { url: "", name: "" }; // TODO: Implement real storage upload logic
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

/**
 * Zod schemas for payment validation
 */
const CreatePaymentIntentSchema = z.object({
  ticketTypeId: z.string().uuid(),
  quantity: z.number().int().min(1),
  currency: z.string().length(3).optional().default("USD"),
  paymentMethod: z.enum(["credit_card", "pix", "apple_pay", "google_pay"]),
  tenantId: z.string().uuid(),
});

/**
 * Creates a payment session and reserves stock at the database level.
 * This function uses a database lock to prevent race conditions in ticket stock.
 */
export const createPaymentIntent = createServerFn({ method: "POST" })
  .inputValidator((data) => CreatePaymentIntentSchema.parse(data))
  .handler(async ({ data }) => {
    const { ticketTypeId, quantity, tenantId } = data;

    // 1. Reserve tickets using the database atomic function
    // Note: We use the admin client because the reserve_tickets function is restricted to service_role
    const { data: reserveSuccess, error: reserveError } = await (await import('@/integrations/supabase/client.server')).supabaseAdmin.rpc('reserve_tickets', {
      _ticket_type_id: ticketTypeId,
      _quantity: quantity
    });

    if (reserveError || !reserveSuccess) {
      throw new Error("Estoque insuficiente para a quantidade solicitada.");
    }

    // 2. Here we would call Stripe API to create a Payment Intent
    // For now, we mock the result to enable frontend development
    // In production, process.env['STRIPE_SECRET_KEY'] would be used
    
    const mockPaymentIntent = {
      id: `pi_mock_${Math.random().toString(36).substring(7)}`,
      client_secret: `pi_mock_secret_${Math.random().toString(36).substring(7)}`,
      amount: 10000, // example amount in cents
      currency: data.currency
    };

    return {
      success: true,
      paymentIntent: mockPaymentIntent,
      message: "Pagamento iniciado e estoque reservado."
    };
  });

/**
 * Calculates current Pix quotation based on USD value.
 */
export const getPixQuotation = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({
    amountUsd: z.number().positive(),
  }).parse(data))
  .handler(async ({ data }) => {
    // In production, call a real exchange rate API
    const MOCK_RATE = 5.15; // Example USD/BRL rate
    const totalBrl = data.amountUsd * MOCK_RATE;

    return {
      rate: MOCK_RATE,
      totalBrl,
      expiresIn: 1200 // 20 minutes in seconds
    };
  });

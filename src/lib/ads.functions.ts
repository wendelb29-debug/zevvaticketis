import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

const logAdEventSchema = z.object({
  organizationId: z.string().uuid(),
  campaignId: z.string().uuid(),
  creativeId: z.string().uuid(),
  eventType: z.enum(['eligible', 'served', 'impression', 'click', 'minimize', 'close', 'swipe_dismiss']),
  metadata: z.record(z.any()).optional(),
  pagePath: z.string().optional(),
  deviceHash: z.string().optional(),
  sessionId: z.string().optional()
});

/**
 * Logs an ad event (impression, click, etc.)
 */
export const logAdEvent = createServerFn({ method: "POST" })
  .validator((data: any) => logAdEventSchema.parse(data))

  .handler(async ({ data }) => {
    const { error } = await supabase
      .from("ad_metrics")
      .insert({
        organization_id: data.organizationId,
        campaign_id: data.campaignId,
        creative_id: data.creativeId,
        event_type: data.eventType,
        metadata: (data.metadata as unknown as Json) || null,
        page_path: data.pagePath || '/',
        device_hash: data.deviceHash || null,
        session_id: data.sessionId || null,
        occurred_at: new Date().toISOString()
      });

    if (error) {
      console.error("Error logging ad event:", error);
      return { success: false };
    }

    return { success: true };
  });

const getEligibleAdsSchema = z.object({
  limit: z.number().default(1)
});

/**
 * Fetches eligible ads for the current context (home page)
 */
export const getEligibleAds = createServerFn({ method: "GET" })
  .validator((data: any) => getEligibleAdsSchema.parse(data))

  .handler(async ({ data }) => {
    // Current time for filter
    const now = new Date().toISOString();
    
    // Select active campaigns
    const { data: campaigns, error: campaignError } = await supabase
      .from("ad_campaigns")
      .select(`
        *,
        ad_creatives (*)
      `)
      .eq("status", "ativa")
      .lte("start_at", now)
      .gte("end_at", now)
      .order("priority", { ascending: false });

    if (campaignError) throw campaignError;
    if (!campaigns || campaigns.length === 0) return [];

    // Simple priority-based rotation for now
    return campaigns.slice(0, data.limit).map(c => ({
      ...c,
      creative: c.ad_creatives?.[0] || null
    })).filter(c => c.creative !== null);
  });

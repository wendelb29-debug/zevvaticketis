import { supabase } from "@/integrations/supabase/client";

/**
 * Zevva Tracking Utility
 * Captures UTM parameters and session data to attribute sales and campaign performance.
 */

export interface UTMParams {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  term?: string | null;
  content?: string | null;
}

export const tracking = {
  /**
   * Captures UTMs from URL and stores them in sessionStorage
   */
  captureUTMs: () => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const utms: UTMParams = {
      source: urlParams.get('utm_source'),
      medium: urlParams.get('utm_medium'),
      campaign: urlParams.get('utm_campaign'),
      term: urlParams.get('utm_term'),
      content: urlParams.get('utm_content'),
    };

    // Only save if at least source is present
    if (utms.source) {
      sessionStorage.setItem('zevva_utms', JSON.stringify(utms));
      console.log('[Tracking] UTMs captured:', utms);
    }
  },

  /**
   * Returns stored UTMs
   */
  getStoredUTMs: (): UTMParams | null => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem('zevva_utms');
    return stored ? JSON.parse(stored) : null;
  },

  /**
   * Logs a page view or interaction in the tracking table
   */
  logEvent: async (eventName: string, metadata: any = {}) => {
    try {
      const utms = tracking.getStoredUTMs();
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      
      const { error } = await supabase.from('tracking' as any).insert({
        event_name: eventName,
        url: window.location.href,
        user_id: user?.id,
        utm_source: utms?.source,
        utm_medium: utms?.medium,
        utm_campaign: utms?.campaign,
        utm_term: utms?.term,
        utm_content: utms?.content,
        metadata: {
          ...metadata,
          referrer: document.referrer,
          user_agent: navigator.userAgent,
          screen_res: `${window.screen.width}x${window.screen.height}`
        }
      });

      if (error) console.error('[Tracking] Error logging event:', error);
    } catch (e) {
      console.error('[Tracking] Fatal error:', e);
    }
  },

  /**
   * Attributes an order to a campaign
   */
  attributeOrder: async (orderId: string, eventId: string, amount: number) => {
    try {
      const utms = tracking.getStoredUTMs();
      if (!utms?.campaign) return;

      // Find campaign by name or ID if it exists
      const { data: campaign } = await (supabase
        .from('campaigns' as any)
        .select('id')
        .ilike('name', utms.campaign)
        .maybeSingle() as any);

      if (campaign && (campaign as any).id) {
        await supabase.from('sales_attribution' as any).insert({
          order_id: orderId,
          campaign_id: (campaign as any).id,
          event_id: eventId,
          amount: amount,
          channel: utms.source || 'direct',
          conversion_path: `utm_source=${utms.source}&utm_medium=${utms.medium}`
        });
      }
    } catch (e) {
      console.error('[Tracking] Attribution error:', e);
    }
  }
};

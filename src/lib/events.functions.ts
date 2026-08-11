import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getEventDetails = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string().optional(), slug: z.string().optional() }).parse(data))
  .handler(async ({ data }) => {
    let query = supabase
      .from("events")
      .select(`
        *,
        producer:organizations(*)
      `);

    if (data.id) {
      query = query.eq("id", data.id);
    } else if (data.slug) {
      query = query.eq("slug", data.slug);
    } else {
      throw new Error("ID or Slug is required");
    }

    const { data: event, error: eventError } = await query.single();

    if (eventError) throw eventError;

    // Fetch ticket types
    const { data: ticketTypes } = await supabase
      .from("ticket_types")
      .select("*")
      .eq("event_id", event.id)
      .order("ordem", { ascending: true } as any);

    // Fetch itinerary days
    const ticketTypeIds = ticketTypes?.map(t => t.id) || [];
    let itinerary: any[] = [];
    
    if (ticketTypeIds.length > 0) {
      const { data: itineraryData } = await supabase
        .from("trip_itinerary_days" as any)
        .select("*")
        .in("ticket_type_id", ticketTypeIds)
        .order("dia_numero", { ascending: true });
      
      itinerary = itineraryData || [];
    }

    return {
      event,
      ticketTypes: ticketTypes || [],
      itinerary
    };
  });

export const getFeaturedEvents = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "publicado")
      .eq("featured", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  });


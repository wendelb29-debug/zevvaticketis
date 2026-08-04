import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getEventDetails = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    // Fetch event with producer info
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select(`
        *,
        producer:organizations(*)
      `)
      .eq("id", data.id)
      .single();

    if (eventError) throw eventError;

    // Fetch ticket types
    const { data: ticketTypes } = await supabase
      .from("ticket_types")
      .select("*")
      .eq("event_id", data.id)
      .order("ordem", { ascending: true });

    // Fetch itinerary days for these ticket types
    const ticketTypeIds = ticketTypes?.map(t => t.id) || [];
    let itinerary: any[] = [];
    
    if (ticketTypeIds.length > 0) {
      const { data: itineraryData } = await supabase
        .from("trip_itinerary_days")
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

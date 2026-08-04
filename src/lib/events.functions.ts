import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getEventDetails = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    // We use the client-side supabase here because we want RLS to apply if possible, 
    // but for public events it works fine.
    
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select(`
        *,
        producer:organizations(*),
        tickets:tickets(*)
      `)
      .eq("id", data.id)
      .single();

    if (eventError) throw eventError;

    const { data: itinerary } = await supabase
      .from("trip_itinerary_days")
      .select("*")
      .eq("event_id", data.id)
      .order("day_number", { ascending: true });

    return {
      event,
      itinerary: itinerary || []
    };
  });

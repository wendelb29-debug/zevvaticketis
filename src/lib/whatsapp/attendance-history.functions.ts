import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAttendanceMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    attendanceId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data }) => {
    // We need to find the messages linked to this attendance.
    // In our schema, messages are linked to contacts.
    // However, an attendance represents a period of time.
    // We'll fetch messages for the contact within the start/end time of the attendance.
    
    const { data: attendance, error: attError } = await supabase
      .from('whatsapp_attendances')
      .select('contact_id, started_at, finalized_at')
      .eq('id', data.attendanceId)
      .single();

    if (attError) throw attError;

    let query = supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('contact_id', (attendance as any).contact_id)
      .gte('created_at', (attendance as any).started_at);

    if ((attendance as any).finalized_at) {
      query = query.lte('created_at', (attendance as any).finalized_at);
    }

    const { data: messages, error } = await query.order('created_at', { ascending: true });

    if (error) throw error;
    return messages;
  });

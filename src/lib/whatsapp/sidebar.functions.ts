import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getContactGroups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    tenantId: z.string().uuid(),
    contactId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: allGroups, error: groupsError } = await supabase
      .from('whatsapp_contact_groups')
      .select('*')
      .eq('tenant_id', data.tenantId);

    if (groupsError) throw groupsError;

    const { data: memberships, error: memberError } = await supabase
      .from('whatsapp_contact_group_memberships')
      .select('group_id')
      .eq('contact_id', data.contactId);

    if (memberError) throw memberError;

    const memberGroupIds = new Set(memberships.map(m => m.group_id));

    return allGroups.map(g => ({
      ...g,
      isMember: memberGroupIds.has(g.id)
    }));
  });

export const updateContactGroups = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    contactId: z.string().uuid(),
    groupIds: z.array(z.string().uuid())
  }).parse(data))
  .handler(async ({ data }) => {
    // Delete existing memberships
    const { error: deleteError } = await supabase
      .from('whatsapp_contact_group_memberships')
      .delete()
      .eq('contact_id', data.contactId);

    if (deleteError) throw deleteError;

    if (data.groupIds.length > 0) {
      const { error: insertError } = await supabase
        .from('whatsapp_contact_group_memberships')
        .insert(data.groupIds.map(groupId => ({
          contact_id: data.contactId,
          group_id: groupId
        })));

      if (insertError) throw insertError;
    }

    return { success: true };
  });

export const createContactGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    tenantId: z.string().uuid(),
    name: z.string().min(1),
    description: z.string().optional(),
    color: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: group, error } = await supabase
      .from('whatsapp_contact_groups')
      .insert({
        tenant_id: data.tenantId,
        name: data.name,
        description: data.description ?? null,
        color: data.color || '#E35B62'
      })
      .select()
      .single();

    if (error) throw error;
    return group;
  });

export const getSharedFiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    contactId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('contact_id', data.contactId)
      .or('media_url.neq.null,content.ilike.%http%');

    if (error) throw error;

    const media: any[] = [];
    const docs: any[] = [];
    const links: any[] = [];

    messages.forEach((m: any) => {
      if (m.media_url) {
        const isDoc = m.content?.toLowerCase().endsWith('.pdf') || 
                      m.content?.toLowerCase().endsWith('.doc') || 
                      m.content?.toLowerCase().endsWith('.docx') ||
                      m.message_type === 'document';
        
        const item = {
          id: m.id,
          url: m.media_url,
          name: m.content || 'Arquivo sem nome',
          date: m.created_at,
          sender: m.direction === 'outbound' ? 'Atendente' : 'Cliente'
        };

        if (isDoc) docs.push(item);
        else media.push(item);
      }

      // Basic link extraction
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const foundLinks = m.content?.match(urlRegex);
      if (foundLinks) {
        foundLinks.forEach((url: string) => {
          links.push({
            id: `${m.id}-${url}`,
            url,
            text: m.content,
            date: m.created_at,
            sender: m.direction === 'outbound' ? 'Atendente' : 'Cliente'
          });
        });
      }
    });

    return { media, docs, links };
  });

export const getAttendanceHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    contactId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: history, error } = await supabase
      .from('whatsapp_attendances')
      .select('*, profiles(full_name)')
      .eq('contact_id', data.contactId)
      .eq('status', 'closed')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return history;
  });

export const scheduleWhatsAppMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    tenantId: z.string().uuid(),
    contactId: z.string().uuid(),
    scheduledAt: z.string(),
    message: z.string().min(1)
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: schedule, error } = await supabase
      .from('whatsapp_schedules')
      .insert({
        tenant_id: data.tenantId,
        contact_id: data.contactId,
        agent_id: context.userId,
        scheduled_at: data.scheduledAt,
        message_content: data.message,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return schedule;
  });

export const closeAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    attendanceId: z.string().uuid(),
    reason: z.string().min(1),
    notes: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: attendance, error } = await supabase
      .from('whatsapp_attendances')
      .update({
        status: 'closed',
        closure_reason: data.reason,
        internal_notes: data.notes ?? null,
        closed_at: new Date().toISOString()
      })
      .eq('id', data.attendanceId)
      .select()
      .single();

    if (error) throw error;
    return attendance;
  });

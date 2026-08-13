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
      .select('*')
      .eq('contact_id', data.contactId)
      .eq('status', 'finalized')
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
  .handler(async ({ data, context }) => {
    const { data: attendance, error } = await supabase
      .from('whatsapp_attendances')
      .update({
        status: 'finalized',
        finalization_reason: data.reason,
        internal_notes: data.notes ?? null,
        finalized_at: new Date().toISOString(),
        finalized_by: context.userId
      } as any)
      .eq('id', data.attendanceId)
      .select()
      .single();

    if (error) throw error;

    // Record event
    await supabase.from('attendance_events').insert({
      tenant_id: (attendance as any).tenant_id,
      attendance_id: data.attendanceId,
      event_type: 'finalized',
      new_value: 'finalized',
      description: `Atendimento finalizado por motivo: ${data.reason}`,
      created_by: context.userId
    });

    return attendance;
  });

export const getDepartments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    tenantId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: departments, error } = await supabase
      .from('whatsapp_departments')
      .select('*')
      .eq('tenant_id', data.tenantId)
      .eq('status', 'active')
      .order('name');

    if (error) throw error;
    return departments;
  });

export const getDepartmentAgents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    departmentId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: members, error } = await supabase
      .from('whatsapp_department_members')
      .select('user_id, profiles(full_name, avatar_url, status)')
      .eq('department_id', data.departmentId);

    if (error) throw error;
    return members;
  });

export const transferAttendanceAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    attendanceId: z.string().uuid(),
    newDepartmentId: z.string().uuid(),
    newAgentId: z.string().uuid().optional().nullable(),
    reason: z.string().min(1),
    clientMessage: z.string().optional().nullable()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: result, error } = await supabase.rpc('transfer_attendance', {
      p_attendance_id: data.attendanceId,
      p_new_department_id: data.newDepartmentId,
      p_new_agent_id: data.newAgentId ?? undefined,
      p_reason: data.reason,
      p_client_message: data.clientMessage ?? undefined
    });

    if (error) throw error;
    return result;
  });

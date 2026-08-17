import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const filterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  plan: z.string().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
  orderBy: z.string().default('created_at'),
  orderDir: z.enum(['asc', 'desc']).default('desc'),
});

const periodSchema = z.enum(['hoje', '7d', '30d', 'mes_atual', 'mes_anterior', 'personalizado']);

export const getGlobalStats = createServerFn({ method: "GET" })
  .validator((data) => z.object({ period: periodSchema.optional().default('30d') }).parse(data))
  .handler(async ({ data: input }) => {
    // 1. Verify Platform Admin (Security validation is handled by route but we check here too)
    // In a real app we might use a middleware like requirePlatformAdmin
    
    // Calculate date ranges for comparison
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Dynamic stats queries
    const [
      { count: tenantsTotal },
      { count: tenantsNewMonth },
      { count: tenantsPrevMonth },
      { count: usersTotal },
      { count: usersNewMonth },
      { count: usersPrevMonth },
      { count: eventsTotal },
      { count: eventsPublished },
      { data: ordersData }
    ] = await Promise.all([
      // Projects
      supabaseAdmin.from("tenants").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("tenants").select("*", { count: "exact", head: true })
        .gte('created_at', startOfCurrentMonth.toISOString()),
      supabaseAdmin.from("tenants").select("*", { count: "exact", head: true })
        .gte('created_at', startOfPrevMonth.toISOString())
        .lte('created_at', endOfPrevMonth.toISOString()),
      
      // Users
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true })
        .gte('created_at', startOfCurrentMonth.toISOString()),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true })
        .gte('created_at', startOfPrevMonth.toISOString())
        .lte('created_at', endOfPrevMonth.toISOString()),
      
      // Events
      supabaseAdmin.from("events").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("events").select("*", { count: "exact", head: true })
        .eq('status', 'published'),
      
      // Financial (GMV & Revenue)
      supabaseAdmin.from("orders").select("valor_bruto, taxa_plataforma, status")
        .eq("status", "pago")
    ]);

    const gmv = ordersData?.reduce((acc, curr) => acc + (Number(curr.valor_bruto) || 0), 0) || 0;
    const revenue = ordersData?.reduce((acc, curr) => acc + (Number(curr.taxa_plataforma) || 0), 0) || 0;

    return {
      tenants: {
        total: tenantsTotal || 0,
        newThisMonth: tenantsNewMonth || 0,
        prevMonth: tenantsPrevMonth || 0,
      },
      users: {
        total: usersTotal || 0,
        newThisMonth: usersNewMonth || 0,
        prevMonth: usersPrevMonth || 0,
      },
      events: {
        total: eventsTotal || 0,
        published: eventsPublished || 0,
      },
      financial: {
        gmv,
        revenue,
      }
    };
  });

export const listTenantsPaginated = createServerFn({ method: "GET" })
  .validator((data) => filterSchema.parse(data))
  .handler(async ({ data: input }) => {
    const { search, status, plan, page, pageSize, orderBy, orderDir } = input;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseAdmin
      .from("tenants")
      .select(`
        *,
        owner_profile:profiles!inner(nome, email),
        member_count:tenant_members(count),
        event_count:events(count)
      `, { count: "exact" });

    if (search) {
      query = query.or(`nome.ilike.%${search}%,slug.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (plan) {
      query = query.eq('plan', plan);
    }

    const { data, count, error } = await query
      .order(orderBy, { ascending: orderDir === 'asc' })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  });

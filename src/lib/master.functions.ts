import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const filterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  plan: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().optional(),
  createdAtStart: z.string().optional(),
  createdAtEnd: z.string().optional(),
  owner: z.string().optional(),
  hasEvents: z.boolean().optional(),
  hasSales: z.boolean().optional(),
  nearLimit: z.boolean().optional(),
  aboveLimit: z.boolean().optional(),
  minUsers: z.number().optional(),
  maxUsers: z.number().optional(),
  minEvents: z.number().optional(),
  maxEvents: z.number().optional(),
  minGmv: z.number().optional(),
  maxGmv: z.number().optional(),
  minRevenue: z.number().optional(),
  maxRevenue: z.number().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
  orderBy: z.string().default('created_at'),
  orderDir: z.enum(['asc', 'desc']).default('desc'),
});

const periodSchema = z.enum(['hoje', '7d', '30d', 'mes_atual', 'mes_anterior', 'personalizado']);

export const getGlobalStats = createServerFn({ method: "GET" })
  .validator((data) => z.object({ period: periodSchema.optional().default('30d') }).parse(data))
  .handler(async ({ data: input }) => {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

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
      supabaseAdmin.from("tenants").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("tenants").select("*", { count: "exact", head: true })
        .gte('created_at', startOfCurrentMonth.toISOString()),
      supabaseAdmin.from("tenants").select("*", { count: "exact", head: true })
        .gte('created_at', startOfPrevMonth.toISOString())
        .lte('created_at', endOfPrevMonth.toISOString()),
      
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true })
        .gte('created_at', startOfCurrentMonth.toISOString()),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true })
        .gte('created_at', startOfPrevMonth.toISOString())
        .lte('created_at', endOfPrevMonth.toISOString()),
      
      supabaseAdmin.from("events").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("events").select("*", { count: "exact", head: true })
        .eq('status', 'published'),
      
      supabaseAdmin.from("orders").select("valor_bruto, taxa_plataforma, status")
        .eq("status", "pago")
    ]);

    const gmv = ordersData?.reduce((acc, curr) => acc + (Number(curr.valor_bruto) || 0), 0) || 0;
    const revenue = ordersData?.reduce((acc, curr) => acc + (Number(curr.taxa_plataforma) || 0), 0) || 0;
    const pendingOrders = ordersData?.filter(o => o.status === 'pendente').length || 0;


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
        pendingOrders

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
        member_count:tenant_members(count),
        event_count:events(count)
      `, { count: "exact" });

    if (search) {
      query = query.or(`nome.ilike.%${search}%,slug.ilike.%${search}%,email_contato.ilike.%${search}%,nome_proprietario.ilike.%${search}%,id.eq.${search},dominio_personalizado.ilike.%${search}%`);
    }
    
    if (input.country) query = query.eq('pais_id', input.country);
    if (input.currency) query = query.eq('moeda_padrao_id', input.currency);
    if (input.createdAtStart) query = query.gte('created_at', input.createdAtStart);
    if (input.createdAtEnd) query = query.lte('created_at', input.createdAtEnd);
    if (input.owner) query = query.eq('owner_id' as any, input.owner);

    if (status) {
      query = query.eq('status', status);
    }
    if (plan) {
      query = query.eq('plan', plan);
    }

    const { data, count, error } = await (query as any)
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

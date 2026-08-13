import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabase } from "@/integrations/supabase/client";

export const getPermissionDefinitions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabase
      .from("permission_definitions")
      .select("*")
      .eq("is_active", true)
      .order("module", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  });

export const getProjectRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ tenantId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { data: roles, error } = await supabase
      .from("project_roles")
      .select(`
        *,
        role_permissions (
          permission_id,
          permission_definitions (
            key
          )
        ),
        project_member_roles (
          user_id
        )
      `)
      .eq("tenant_id", data.tenantId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return roles.map(role => ({
      ...role,
      permissions_count: role.role_permissions?.length || 0,
      users_count: role.project_member_roles?.length || 0,
    }));
  });

export const upsertProjectRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid().optional(),
    tenantId: z.string().uuid(),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    color: z.string().optional(),
    permissionIds: z.array(z.string().uuid()),
    isActive: z.boolean().default(true),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { id, tenantId, name, description, color, permissionIds, isActive } = data;

    // Check if user is Admin/Owner in this tenant
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", context.userId)
      .single();

    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      throw new Error("Acesso negado: você não tem permissão para gerenciar cargos.");
    }

    let roleId = id;

    if (id) {
      // Update existing role
      const { error: roleError } = await supabase
        .from("project_roles")
        .update({
          name,
          description: description || null,
          color: color || null,
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .eq("tenant_id", tenantId);

      if (roleError) throw roleError;

      // Sync permissions: Delete old, insert new
      await supabase
        .from("role_permissions")
        .delete()
        .eq("role_id", id);
    } else {
      // Create new role
      const { data: newRole, error: roleError } = await supabase
        .from("project_roles")
        .insert({
          tenant_id: tenantId,
          name,
          description: description || null,
          color: color || null,
          is_active: isActive,
          created_by: context.userId
        })
        .select()
        .single();

      if (roleError) throw roleError;
      roleId = newRole.id;
    }

    if (permissionIds.length > 0) {
      const { error: permError } = await supabase
        .from("role_permissions")
        .insert(
          permissionIds.map(pid => ({
            tenant_id: tenantId,
            role_id: roleId!,
            permission_id: pid
          }))
        );

      if (permError) throw permError;
    }

    return { success: true, roleId };
  });

export const deleteProjectRole = createServerFn({ method: "POST" })

  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data, context }) => {
    // Check if user is Admin/Owner
    const { data: member } = await supabase
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", data.tenantId)
      .eq("user_id", context.userId)
      .single();

    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      throw new Error("Acesso negado.");
    }

    // Check if role is in use
    const { count } = await supabase
      .from("project_member_roles")
      .select("*", { count: 'exact', head: true })
      .eq("role_id", data.id);

    if (count && count > 0) {
      throw new Error("Não é possível excluir um cargo que possui usuários vinculados.");
    }

    const { error } = await supabase
      .from("project_roles")
      .delete()
      .eq("id", data.id)
      .eq("tenant_id", data.tenantId)
      .eq("is_protected", false);

    if (error) throw error;
    return { success: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Roles allowed to perform sensitive operations within a tenant.
 */
export type TenantRole = 'owner' | 'admin' | 'moderator' | 'user';

/**
 * Security validation result.
 */
export interface SecurityValidation {
  authorized: boolean;
  role?: TenantRole;
  isPlatformAdmin: boolean;
  message?: string;
}

/**
 * Checks if a user has a specific role or higher in a tenant.
 * Note: Logic assumes a hierarchy if needed, but here we check for exact or specific set.
 */
export async function validateUserTenantAccess(
  supabase: SupabaseClient<any>,
  userId: string,
  tenantId: string,
  requiredRoles: TenantRole[] = ['owner', 'admin']
): Promise<SecurityValidation> {
  // 1. Check if Platform Admin first (they have god-mode access)
  const { data: platformAdmin } = await supabase
    .from("platform_admins")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (platformAdmin) {
    return { authorized: true, isPlatformAdmin: true };
  }

  // 2. Check tenant membership
  const { data: member } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!member) {
    return { authorized: false, isPlatformAdmin: false, message: "Acesso negado: você não pertence a este ambiente." };
  }

  // 3. Validate role
  const userRole = member.role as TenantRole;
  if (!requiredRoles.includes(userRole)) {
    return { authorized: false, role: userRole, isPlatformAdmin: false, message: "Acesso negado: permissão insuficiente." };
  }

  return { authorized: true, role: userRole, isPlatformAdmin: false };
}

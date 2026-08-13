import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Roles allowed to perform sensitive operations within a tenant.
 * Imported directly from Supabase Database Enums.
 */
export type TenantRole = Database["public"]["Enums"]["tenant_role"];

/**
 * Actions that can be performed within a tenant.
 */
export type TenantAction = 
  | 'criar_evento'
  | 'convidar_equipe'
  | 'gerenciar_participantes'
  | 'acessar_financeiro'
  | 'gerenciar_marketing'
  | 'operar_checkin'
  | 'administrar_checkin';

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
 * Mapping of actions to allowed roles.
 */
const ACTION_PERMISSIONS: Record<TenantAction, TenantRole[]> = {
  criar_evento: ['OWNER', 'ADMIN', 'MANAGER'],
  convidar_equipe: ['OWNER', 'ADMIN'],
  gerenciar_participantes: ['OWNER', 'ADMIN', 'MANAGER', 'CHECKIN_MANAGER'],
  acessar_financeiro: ['OWNER', 'ADMIN', 'FINANCEIRO'],
  gerenciar_marketing: ['OWNER', 'ADMIN', 'MARKETING'],
  operar_checkin: ['OWNER', 'ADMIN', 'CHECKIN_MANAGER', 'CHECKIN_SUPERVISOR', 'CHECKIN_OPERATOR'],
  administrar_checkin: ['OWNER', 'ADMIN', 'CHECKIN_MANAGER', 'CHECKIN_SUPERVISOR'],
};

/**
 * Validates if a user has access to a tenant and permission to perform an action.
 */
export async function validateUserTenantAccess(
  supabase: SupabaseClient<Database>,
  userId: string,
  tenantId: string,
  action?: TenantAction | TenantRole[]
): Promise<SecurityValidation> {
  // 1. Validate platform admin server-side
  const { data: platformAdmin } = await supabase
    .from("platform_admins")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (platformAdmin) {
    // Platform admins are authorized for all tenant actions
    return { authorized: true, isPlatformAdmin: true };
  }

  // 2. Check tenant membership
  const { data: member, error } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !member) {
    return { 
      authorized: false, 
      isPlatformAdmin: false, 
      message: "Acesso negado: você não pertence a este ambiente." 
    };
  }

  const userRole = member.role as TenantRole;
  
  // 3. Validate permission
  let requiredRoles: TenantRole[] = [];
  if (Array.isArray(action)) {
    requiredRoles = action;
  } else if (action) {
    requiredRoles = ACTION_PERMISSIONS[action];
  } else {
    // Default to at least being a member
    return { authorized: true, role: userRole, isPlatformAdmin: false };
  }

  if (!requiredRoles.includes(userRole)) {
    return { 
      authorized: false, 
      role: userRole, 
      isPlatformAdmin: false, 
      message: `Acesso negado: permissão '${userRole}' insuficiente para esta ação.` 
    };
  }

  return { authorized: true, role: userRole, isPlatformAdmin: false };
}


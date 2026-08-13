import { describe, it, expect, vi } from 'vitest';
import { validateUserTenantAccess } from './security';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

describe('validateUserTenantAccess', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
  } as unknown as SupabaseClient<Database>;

  it('should authorize Platform Admins for any action', async () => {
    vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
      if (table === 'platform_admins') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { id: 'admin-1' }, error: null })
            })
          })
        } as any;
      }
      return {} as any;
    });

    const result = await validateUserTenantAccess(mockSupabase, 'user-1', 'tenant-1', 'criar_evento');
    expect(result.authorized).toBe(true);
    expect(result.isPlatformAdmin).toBe(true);
  });

  it('should authorize OWNER to create events', async () => {
    vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
      if (table === 'platform_admins') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) } as any;
      }
      if (table === 'tenant_members') {
        return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { role: 'OWNER' }, error: null }) }) }) }) } as any;
      }
      return {} as any;
    });

    const result = await validateUserTenantAccess(mockSupabase, 'user-1', 'tenant-1', 'criar_evento');
    expect(result.authorized).toBe(true);
    expect(result.role).toBe('OWNER');
  });

  it('should authorize ADMIN to create events', async () => {
    vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
      if (table === 'platform_admins') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) } as any;
      }
      if (table === 'tenant_members') {
        return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { role: 'ADMIN' }, error: null }) }) }) }) } as any;
      }
      return {} as any;
    });

    const result = await validateUserTenantAccess(mockSupabase, 'user-1', 'tenant-1', 'criar_evento');
    expect(result.authorized).toBe(true);
  });

  it('should deny MARKETING access to finance', async () => {
    vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
      if (table === 'platform_admins') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) } as any;
      }
      if (table === 'tenant_members') {
        return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { role: 'MARKETING' }, error: null }) }) }) }) } as any;
      }
      return {} as any;
    });

    const result = await validateUserTenantAccess(mockSupabase, 'user-1', 'tenant-1', 'acessar_financeiro');
    expect(result.authorized).toBe(false);
    expect(result.message).toContain('insuficiente');
  });

  it('should deny CHECKIN_OPERATOR from creating events', async () => {
    vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
      if (table === 'platform_admins') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) } as any;
      }
      if (table === 'tenant_members') {
        return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { role: 'CHECKIN_OPERATOR' }, error: null }) }) }) }) } as any;
      }
      return {} as any;
    });

    const result = await validateUserTenantAccess(mockSupabase, 'user-1', 'tenant-1', 'criar_evento');
    expect(result.authorized).toBe(false);
  });

  it('should deny access if user is not a member of the tenant', async () => {
    vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
      if (table === 'platform_admins') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) } as any;
      }
      if (table === 'tenant_members') {
        return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }) } as any;
      }
      return {} as any;
    });

    const result = await validateUserTenantAccess(mockSupabase, 'user-1', 'tenant-1', 'criar_evento');
    expect(result.authorized).toBe(false);
    expect(result.message).toContain('não pertence');
  });
});

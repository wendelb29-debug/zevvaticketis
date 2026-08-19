import React from 'react';

export function TeamManagement({ tenantId }: { tenantId: string }) {
  return <div className="p-8 text-center text-muted-foreground">Módulo de Equipe (Tenant: {tenantId})</div>;
}
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { 
  Users, UserPlus, Mail, Shield, Clock, CheckCircle2, XCircle, Plus, Loader2, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TeamManagement({ tenantId }: { tenantId: string }) {
  const { data: members, isLoading } = useQuery({
    queryKey: ["admin-tenant-team", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_members")
        .select(`
          *,
          profiles:user_id (
            nome,
            email,
            avatar_url
          )
        `)
        .eq("tenant_id", tenantId);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Carregando equipe...</p>
    </div>
  );

  return (
    <div className="space-y-8 font-inter max-w-6xl mx-auto">
      <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-border bg-card/30">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-foreground">Membros do Projeto</h3>
        </div>
        <div className="divide-y divide-line">
          {members?.map((member) => (
            <div key={member.id} className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 rounded-2xl border border-border">
                  <AvatarImage src={(member.profiles as any)?.avatar_url} />
                  <AvatarFallback className="bg-navy text-primary-foreground font-extrabold">
                    {(member.profiles as any)?.nome?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="font-bold text-foreground">{(member.profiles as any)?.nome || "Usuário sem nome"}</p>
                  <p className="text-xs text-muted-foreground font-medium">{(member.profiles as any)?.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-coral/20 font-extrabold text-[10px] uppercase px-3">
                  {member.role}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

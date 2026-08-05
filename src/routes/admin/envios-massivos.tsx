import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Megaphone, Plus, Mail, MessageSquare, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/admin/envios-massivos")({
  component: EnviosMassivosPage,
});

function EnviosMassivosPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-manrope font-extrabold text-navy">Envios Massivos</h1>
          <p className="text-sm text-muted-fg mt-1">Gerencie suas campanhas de WhatsApp e E-mail.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-bold px-6">
          <Plus className="w-4 h-4" /> Nova Campanha
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total enviadas", value: "0", icon: Megaphone },
          { label: "Entregues", value: "0", icon: CheckCircle },
          { label: "Falharam", value: "0", icon: AlertCircle },
          { label: "Aguardando", value: "0", icon: Clock },
        ].map((stat, i) => (
          <Card key={i} className="border-border shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-surface-2 rounded-xl text-primary">
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-fg uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-extrabold text-navy">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
        <div className="p-6 border-b border-line flex justify-between items-center">
          <h2 className="font-extrabold text-navy">Campanhas Recentes</h2>
        </div>
        <table className="w-full">
          <thead className="bg-surface text-muted text-xs font-extrabold uppercase">
            <tr>
              <th className="px-6 py-4 text-left">Nome</th>
              <th className="px-6 py-4 text-left">Tipo</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Data</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-muted-fg font-medium text-sm">Nenhuma campanha registrada.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

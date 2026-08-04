import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldCheck, Mail, Loader2, Settings } from "lucide-react";

export const Route = createFileRoute("/admin/configuracoes")({
  component: AdminSettings,
});

function AdminSettings() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("promote_to_platform_admin", {
        target_email: email.trim().toLowerCase(),
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };
      if (result.success) {
        toast.success(result.message);
        setEmail("");
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error("Error promoting admin:", error);
      toast.error(error.message || "Erro ao promover usuário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-inter">
      <div>
        <h1 className="text-3xl font-manrope font-extrabold text-navy mb-2">
          Configurações da Plataforma
        </h1>
        <p className="text-navy/60">
          Gerencie permissões globais e acessos administrativos.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-line shadow-sm overflow-hidden">
          <CardHeader className="bg-surface-2/50 border-b border-line">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-coral/10 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-coral" />
              </div>
              <div>
                <CardTitle className="text-xl font-manrope font-bold text-navy">
                  Promover Novo Administrador
                </CardTitle>
                <CardDescription>
                  Adicione novos usuários com permissões totais de administração da plataforma.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handlePromote} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/40" />
                <Input
                  type="email"
                  placeholder="e-mail do usuário"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white border-line focus:ring-coral/20 focus:border-coral transition-all font-medium text-navy"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || !email}
                className="h-12 px-8 bg-coral hover:bg-coral/90 text-white font-extrabold rounded-xl shadow-lg shadow-coral/20 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Promover a Admin"
                )}
              </Button>
            </form>
            <p className="mt-4 text-xs text-navy/40 italic">
              * O usuário deve ter uma conta ativa na plataforma para ser promovido.
            </p>
          </CardContent>
        </Card>

        <Card className="border-line shadow-sm border-dashed">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-navy/5 rounded-full mb-4">
              <Settings className="w-6 h-6 text-navy/20" />
            </div>
            <p className="text-sm font-medium text-navy/40">
              Outras configurações globais estarão disponíveis em breve.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

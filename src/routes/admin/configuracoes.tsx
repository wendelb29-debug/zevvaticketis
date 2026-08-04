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
    <div className="max-w-4xl mx-auto space-y-8 font-inter animate-fade-in">
      <div>
        <h1 className="text-3xl font-manrope font-extrabold text-navy mb-2">
          Configurações da Plataforma
        </h1>
        <p className="text-navy/60">
          Gerencie permissões globais e acessos administrativos de forma segura.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-line shadow-sm overflow-hidden border-t-4 border-t-coral">
          <CardHeader className="bg-surface-2/30 border-b border-line pb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-coral/10 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-coral" />
              </div>
              <div>
                <CardTitle className="text-2xl font-manrope font-extrabold text-navy mb-1">
                  Promover Novo Administrador
                </CardTitle>
                <CardDescription className="text-navy/60 text-base">
                  Digite o e-mail de um usuário existente para conceder acesso total à administração da plataforma.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-10">
            <form onSubmit={handlePromote} className="max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/30" />
                  <Input
                    type="email"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 bg-surface-2 border-line focus:ring-coral/20 focus:border-coral transition-all font-medium text-navy text-lg rounded-2xl"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading || !email}
                  className="h-14 px-10 bg-coral hover:bg-coral/90 text-white font-extrabold rounded-2xl shadow-xl shadow-coral/20 disabled:opacity-50 transition-all text-lg min-w-[200px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Promover"
                  )}
                </Button>
              </div>
              <div className="mt-6 p-4 bg-navy/5 rounded-xl border border-navy/10">
                <p className="text-xs text-navy/60 leading-relaxed">
                  <span className="font-bold text-navy uppercase mr-2 tracking-wider">Atenção:</span> 
                  Esta ação é irreversível através desta interface e concede controle total sobre o sistema, incluindo gestão de produtores, aprovação de eventos e configurações globais.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-line shadow-sm border-dashed">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-navy/5 rounded-2xl mb-5">
              <Settings className="w-8 h-8 text-navy/20" />
            </div>
            <h3 className="text-navy/40 font-manrope font-bold text-lg">Módulos em Desenvolvimento</h3>
            <p className="text-sm font-medium text-navy/30 max-w-xs mt-1">
              Logs de auditoria, gestão de taxas globais e manutenção do sistema estarão disponíveis aqui em breve.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

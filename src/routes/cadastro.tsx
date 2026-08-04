import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/cadastro")({
  component: Cadastro,
});

type RegistrationType = "participant" | "producer" | null;

function Cadastro() {
  const [type, setType] = useState<RegistrationType>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Producer specific
  const [orgNome, setOrgNome] = useState("");
  const [orgDocumento, setOrgDocumento] = useState("");

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast.error("Erro ao entrar com Google: " + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
          },
        },
      });

      if (authError) throw authError;

      if (type === "producer") {
        // 2. Create organization
        const { data: orgData, error: orgError } = await supabase.from("organizations").insert({
          nome: orgNome,
          documento: orgDocumento,
          status: "pendente",
        }).select().single();

        if (orgError) throw orgError;

        // 3. Member link
        if (orgData && authData.user) {
          await supabase.from("organization_members").insert({
            organization_id: orgData.id,
            user_id: authData.user.id,
            role: "produtor_owner",
          });
        }
        
        toast.success("Cadastro realizado! Sua organização está em análise.");
        navigate({ to: "/produtor" });
      } else {
        toast.success("Bem-vindo à Zevva!");
        navigate({ to: "/app" });
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!type) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center mb-12">
          <h1 className="text-4xl font-heading font-extrabold text-foreground mb-4">
            Como você quer usar a <span className="text-primary">Zevva</span>?
          </h1>
          <p className="text-muted-foreground text-lg">
            Escolha seu caminho na plataforma marketplace de eventos internacionais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <Card 
            className="cursor-pointer hover:border-primary transition-all group bg-card border-white/10"
            onClick={() => setType("participant")}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-heading group-hover:text-primary transition-colors">
                Quero comprar ingressos
              </CardTitle>
              <CardDescription className="text-secondary">
                Acesse os melhores eventos globais e pacotes de viagem exclusivos.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl">
                🎟️
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-background">
                Sou Participante
              </Button>
            </CardFooter>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-all group bg-card border-white/10"
            onClick={() => setType("producer")}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-heading group-hover:text-primary transition-colors">
                Quero vender ingressos
              </CardTitle>
              <CardDescription className="text-secondary">
                Crie sua organização, gerencie eventos e venda para o mundo todo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl">
                🚀
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-background">
                Sou Produtor
              </Button>
            </CardFooter>
          </Card>
        </div>

        <p className="mt-8 text-muted-foreground">
          Já tem uma conta? <Link to="/login" className="text-primary hover:underline">Faça login</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-card border-white/10">
        <CardHeader>
          <Button 
            variant="ghost" 
            className="w-fit -ml-2 mb-2 text-muted-foreground"
            onClick={() => setType(null)}
          >
            ← Voltar
          </Button>
          <CardTitle className="text-2xl font-heading text-foreground">
            {type === "participant" ? "Cadastro de Participante" : "Cadastro de Produtor"}
          </CardTitle>
          <CardDescription className="text-secondary">
            {type === "participant" 
              ? "Crie sua conta para explorar eventos." 
              : "Preencha os dados da sua organização para começar a vender."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input 
                id="nome" 
                placeholder="Ex: João Silva" 
                required 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-background border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="email@exemplo.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-white/10"
              />
            </div>

            {type === "producer" && (
              <div className="pt-4 border-t border-white/10 space-y-4">
                <h3 className="font-heading font-bold text-sm text-primary uppercase tracking-wider">
                  Dados da Organização
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="orgNome">Nome da Empresa/Negócio</Label>
                  <Input 
                    id="orgNome" 
                    placeholder="Nome da sua produtora" 
                    required 
                    value={orgNome}
                    onChange={(e) => setOrgNome(e.target.value)}
                    className="bg-background border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgDocumento">CNPJ / Documento Fiscal</Label>
                  <Input 
                    id="orgDocumento" 
                    placeholder="Documento para faturamento" 
                    required 
                    value={orgDocumento}
                    onChange={(e) => setOrgDocumento(e.target.value)}
                    className="bg-background border-white/10"
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-primary text-background font-bold" disabled={loading}>
              {loading ? "Cadastrando..." : "Criar Conta"}
            </Button>
            
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-white/10 hover:bg-white/5"
              onClick={handleGoogleLogin}
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Google
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
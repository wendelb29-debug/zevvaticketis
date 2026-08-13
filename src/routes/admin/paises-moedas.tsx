import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Globe, Plus, ToggleLeft, ToggleRight, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const Route = createFileRoute("/admin/paises-moedas")({
  component: PaisesMoedasPage,
});

function PaisesMoedasPage() {
  const queryClient = useQueryClient();
  const [countryForm, setCountryForm] = useState({ nome: "", codigo_iso: "" });
  const [currencyForm, setCurrencyForm] = useState({ codigo: "", simbolo: "" });

  const { data: countries, isLoading: loadingCountries } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data } = await supabase.from("countries").select("*").order("nome");
      return data;
    }
  });

  const { data: currencies, isLoading: loadingCurrencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const { data } = await supabase.from("currencies").select("*").order("codigo");
      return data;
    }
  });

  const updateCountry = useMutation({
    mutationFn: async ({ id, ativo }: any) => {
      await supabase.from("countries").update({ ativo }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["countries"] })
  });

  const updateCurrency = useMutation({
    mutationFn: async ({ id, ativo }: any) => {
      await supabase.from("currencies").update({ ativo }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["currencies"] })
  });

  const addCountry = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("countries").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      setCountryForm({ nome: "", codigo_iso: "" });
      toast.success("País adicionado");
    }
  });

  const addCurrency = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("currencies").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      setCurrencyForm({ codigo: "", simbolo: "" });
      toast.success("Moeda adicionada");
    }
  });

  return (
    <div className="space-y-10 font-inter">
      <h1 className="text-2xl font-manrope font-extrabold text-foreground">Países e Moedas</h1>
      
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Countries Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <Globe className="text-primary" />
            <h2 className="text-lg font-extrabold text-foreground">Países Ativos</h2>
          </div>
          
          <div className="bg-card p-4 rounded-xl border flex gap-2">
            <Input placeholder="Nome" value={countryForm.nome} onChange={e => setCountryForm({...countryForm, nome: e.target.value})} />
            <Input placeholder="ISO" className="w-20" value={countryForm.codigo_iso} onChange={e => setCountryForm({...countryForm, codigo_iso: e.target.value})} />
            <Button size="icon" className="bg-primary shrink-0" onClick={() => addCountry.mutate(countryForm)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="bg-card rounded-xl border overflow-hidden max-h-[500px] overflow-y-auto">
            {countries?.map((c: any) => (
              <div key={c.id} className="px-4 py-3 flex items-center justify-between hover:bg-card/30 transition-colors border-b last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-muted-foreground w-8">{c.codigo_iso}</span>
                  <span className="font-bold text-foreground">{c.nome}</span>
                </div>
                <button onClick={() => updateCountry.mutate({ id: c.id, ativo: !c.ativo })}>
                  {c.ativo ? (
                    <ToggleRight className="text-primary w-8 h-8" />
                  ) : (
                    <ToggleLeft className="text-muted-foreground w-8 h-8" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Currencies Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <DollarSign className="text-primary" />
            <h2 className="text-lg font-extrabold text-foreground">Moedas Ativas</h2>
          </div>

          <div className="bg-card p-4 rounded-xl border flex gap-2">
            <Input placeholder="Código (Ex: BRL)" value={currencyForm.codigo} onChange={e => setCurrencyForm({...currencyForm, codigo: e.target.value})} />
            <Input placeholder="Símbolo" className="w-20" value={currencyForm.simbolo} onChange={e => setCurrencyForm({...currencyForm, simbolo: e.target.value})} />
            <Button size="icon" className="bg-primary shrink-0" onClick={() => addCurrency.mutate(currencyForm)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="bg-card rounded-xl border overflow-hidden max-h-[500px] overflow-y-auto">
            {currencies?.map((cur: any) => (
              <div key={cur.id} className="px-4 py-3 flex items-center justify-between hover:bg-card/30 transition-colors border-b last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-muted-foreground w-10">{cur.codigo}</span>
                  <span className="font-bold text-foreground">{cur.simbolo}</span>
                </div>
                <button onClick={() => updateCurrency.mutate({ id: cur.id, ativo: !cur.ativo })}>
                  {cur.ativo ? (
                    <ToggleRight className="text-primary w-8 h-8" />
                  ) : (
                    <ToggleLeft className="text-muted-foreground w-8 h-8" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

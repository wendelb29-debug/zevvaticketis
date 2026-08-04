import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShieldCheck, Quote, Ticket, Store, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
export const Route = createFileRoute('/cadastro')({
    component: RegistrationPage,
});
function RegistrationPage() {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [countries, setCountries] = useState([]);
    // Form State
    const [formData, setFormData] = useState({
        nome: '',
        sobrenome: '',
        email: '',
        senha: '',
        orgNome: '',
        orgDocumento: '',
        paisId: '',
        aceiteTermos: false
    });
    useEffect(() => {
        async function fetchCountries() {
            const { data } = await supabase.from('countries').select('*').order('name');
            if (data)
                setCountries(data);
        }
        fetchCountries();
    }, []);
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!formData.aceiteTermos) {
            toast.error('Você precisa aceitar os termos de uso.');
            return;
        }
        setLoading(true);
        try {
            // 1. Create Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.senha,
                options: {
                    data: {
                        nome: `${formData.nome} ${formData.sobrenome}`,
                        role: role
                    }
                }
            });
            if (authError)
                throw authError;
            // 2. If Producer, create Organization
            if (role === 'produtor' && authData.user) {
                const { data: orgData, error: orgError } = await supabase
                    .from('organizations')
                    .insert({
                    nome: formData.orgNome,
                    documento: formData.orgDocumento,
                    pais_id: formData.paisId || null,
                    status: 'pendente'
                })
                    .select()
                    .single();
                if (orgError)
                    throw orgError;
                // 3. Link user to organization as owner
                const { error: memberError } = await supabase
                    .from('organization_members')
                    .insert({
                    organization_id: orgData.id,
                    user_id: authData.user.id,
                    role: 'produtor_owner'
                });
                if (memberError)
                    throw memberError;
                toast.success('Cadastro enviado para aprovação!');
                navigate({ to: '/produtor-pendente' });
            }
            else {
                toast.success('Conta criada com sucesso!');
                navigate({ to: '/app' });
            }
        }
        catch (error) {
            toast.error(error.message || 'Erro ao realizar cadastro');
        }
        finally {
            setLoading(false);
        }
    };
    const nextStep = () => {
        if (step === 1 && !role) {
            toast.error('Selecione como você quer usar a Zevva.');
            return;
        }
        setStep(step + 1);
    };
    return (<div className="min-h-screen flex bg-white font-inter">
      {/* Left Panel */}
      <div className="hidden min-[860px]:flex w-[40%] bg-gradient-to-br from-navy to-[#241f3a] p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-gold/10 rounded-full blur-[100px]"/>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-20 group">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center font-manrope font-black text-navy text-2xl group-hover:scale-110 transition-transform">
              Z
            </div>
            <span className="text-2xl font-manrope font-black tracking-tight">Zevva <span className="text-gold">Tickets</span></span>
          </Link>

          <div className="space-y-6">
            <h1 className="text-5xl font-manrope font-extrabold leading-tight">
              Faça parte da <br />
              <span className="text-gold">comunidade</span> Zevva.
            </h1>
            <p className="text-xl text-white/70 font-medium max-w-md">
              Crie sua conta em poucos segundos e comece a explorar ou organizar eventos incríveis.
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-auto">
          <div className="flex flex-col gap-4 max-w-sm">
            <Quote className="w-8 h-8 text-gold/40"/>
            <p className="text-lg italic font-medium text-white/80">
              "Bem-aventurado o homem que põe no Senhor a sua confiança."
            </p>
            <span className="text-gold font-bold text-sm uppercase tracking-widest">— Salmo 40:4</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col p-6 sm:p-12 relative overflow-y-auto">
        <Button variant="ghost" className="absolute top-8 left-8 text-navy font-bold hover:bg-surface rounded-xl flex items-center gap-2" onClick={() => step > 1 ? setStep(step - 1) : window.history.back()}>
          <ArrowLeft className="w-4 h-4"/> {step > 1 ? 'Voltar passo' : 'Voltar'}
        </Button>

        <div className="m-auto w-full max-w-[440px] py-12 space-y-10">
          {step === 1 ? (<div className="space-y-10">
              <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-3xl font-manrope font-extrabold text-navy">Como você quer usar a Zevva?</h2>
                <p className="text-muted font-medium">Escolha seu perfil para personalizarmos sua experiência.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => setRole('participante')} className={cn("flex flex-col items-center p-8 rounded-[20px] border-2 transition-all space-y-4 text-center group", role === 'participante'
                ? "border-gold bg-gold/5 shadow-lg shadow-gold/10"
                : "border-slate-100 hover:border-slate-200 bg-white")}>
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", role === 'participante' ? "bg-gold text-white" : "bg-slate-50 text-slate-400")}>
                    <Ticket className="w-8 h-8"/>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy">Participante</h3>
                    <p className="text-xs text-slate-500 font-medium">Quero comprar ingressos e caravanas</p>
                  </div>
                </button>

                <button onClick={() => setRole('produtor')} className={cn("flex flex-col items-center p-8 rounded-[20px] border-2 transition-all space-y-4 text-center group", role === 'produtor'
                ? "border-gold bg-gold/5 shadow-lg shadow-gold/10"
                : "border-slate-100 hover:border-slate-200 bg-white")}>
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", role === 'produtor' ? "bg-navy text-white" : "bg-slate-50 text-slate-400")}>
                    <Store className="w-8 h-8"/>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy">Produtor</h3>
                    <p className="text-xs text-slate-500 font-medium">Quero divulgar e vender eventos</p>
                  </div>
                </button>
              </div>

              <div className="space-y-4">
                <Button onClick={nextStep} className="w-full h-14 rounded-[14px] bg-navy text-white font-bold flex items-center justify-center gap-2 group shadow-lg shadow-navy/20">
                  Próximo passo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                </Button>

                <p className="text-center text-slate-500 font-medium">
                  Já tem uma conta? <Link to="/login" className="text-gold font-bold hover:underline">Entre agora</Link>
                </p>
              </div>
            </div>) : (<div className="space-y-8">
              <div className="space-y-2">
                <Badge className="bg-gold/10 text-gold border-0 rounded-full px-4 mb-2">Passo 2 de 2</Badge>
                <h2 className="text-3xl font-manrope font-extrabold text-navy">Crie sua conta</h2>
                <p className="text-muted font-medium">
                  {role === 'produtor' ? 'Complete os dados da sua organização.' : 'Preencha seus dados pessoais para começar.'}
                </p>
              </div>

              <div className="space-y-4">
                <Button variant="outline" className="w-full h-12 rounded-[12px] border-slate-200 font-bold text-navy flex items-center justify-center gap-3" onClick={() => { }}>
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4"/>
                  Continuar com Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"/></div>
                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-4 text-slate-400 font-bold tracking-widest">ou preencha abaixo</span></div>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-bold text-xs uppercase tracking-wider">Nome</Label>
                    <Input placeholder="Ex: João" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="h-11 rounded-[10px] bg-slate-50/50 border-slate-200" required/>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-bold text-xs uppercase tracking-wider">Sobrenome</Label>
                    <Input placeholder="Ex: Silva" value={formData.sobrenome} onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })} className="h-11 rounded-[10px] bg-slate-50/50 border-slate-200" required/>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-navy font-bold text-xs uppercase tracking-wider">E-mail</Label>
                  <Input type="email" placeholder="joao@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-11 rounded-[10px] bg-slate-50/50 border-slate-200" required/>
                </div>

                <div className="space-y-2">
                  <Label className="text-navy font-bold text-xs uppercase tracking-wider">Senha</Label>
                  <Input type="password" placeholder="Mínimo 8 caracteres" value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} className="h-11 rounded-[10px] bg-slate-50/50 border-slate-200" required/>
                </div>

                {role === 'produtor' && (<div className="space-y-5 pt-4 border-t border-slate-100">
                    <div className="bg-gold/5 p-4 rounded-xl flex gap-3">
                      <ShieldCheck className="w-5 h-5 text-gold shrink-0 mt-0.5"/>
                      <p className="text-[11px] text-gold-dark font-medium">Sua organização passa por aprovação da plataforma antes de você poder publicar eventos.</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-navy font-bold text-xs uppercase tracking-wider">Nome da Organização</Label>
                      <Input placeholder="Ex: Igreja Central / Agência de Viagens" value={formData.orgNome} onChange={(e) => setFormData({ ...formData, orgNome: e.target.value })} className="h-11 rounded-[10px] bg-slate-50/50 border-slate-200" required/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-bold text-xs uppercase tracking-wider">País de Sede</Label>
                        <select value={formData.paisId} onChange={(e) => setFormData({ ...formData, paisId: e.target.value })} className="w-full h-11 rounded-[10px] bg-slate-50/50 border-slate-200 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-gold" required>
                          <option value="">Selecione...</option>
                          {countries.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-bold text-xs uppercase tracking-wider">Documento (CNPJ/Tax ID)</Label>
                        <Input placeholder="00.000.000/0000-00" value={formData.orgDocumento} onChange={(e) => setFormData({ ...formData, orgDocumento: e.target.value })} className="h-11 rounded-[10px] bg-slate-50/50 border-slate-200" required/>
                      </div>
                    </div>
                  </div>)}

                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox id="terms" checked={formData.aceiteTermos} onCheckedChange={(checked) => setFormData({ ...formData, aceiteTermos: checked })} className="mt-1 rounded-md border-slate-300 data-[state=checked]:bg-gold data-[state=checked]:border-gold"/>
                  <label htmlFor="terms" className="text-xs font-medium text-slate-500 leading-relaxed cursor-pointer">
                    Estou de acordo com os <Link to="/" className="text-gold font-bold">Termos de Uso</Link> e <Link to="/" className="text-gold font-bold">Política de Privacidade (LGPD)</Link> da Zevva Tickets.
                  </label>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-14 rounded-[14px] bg-gradient-to-r from-gold-bright to-gold text-white font-black uppercase tracking-widest shadow-lg shadow-gold/20 hover:opacity-90 transition-all border-0">
                  {loading ? 'Processando...' : role === 'produtor' ? 'Enviar cadastro pra aprovação' : 'Criar minha conta'}
                </Button>
              </form>
            </div>)}
        </div>
      </div>
    </div>);
}

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Mail, Globe, Apple } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'register'>(defaultView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailFields, setShowEmailFields] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 rounded-[20px] bg-white border-0 shadow-2xl overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-manrope font-extrabold text-navy">
              {view === 'login' ? "Que bom ter você aqui!" : "Crie sua conta"}
            </DialogTitle>
          </div>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-12 rounded-[14px] border-line font-extrabold text-navy hover:bg-surface transition-all group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-12 rounded-[14px] border-line font-extrabold text-navy hover:bg-surface transition-all"
            >
              <Apple className="w-5 h-5 fill-current" />
              Continuar com Apple
            </Button>

            {!showEmailFields ? (
              <Button 
                variant="outline" 
                onClick={() => setShowEmailFields(true)}
                className="w-full justify-start gap-3 h-12 rounded-[14px] border-line font-extrabold text-navy hover:bg-surface transition-all"
              >
                <Mail className="w-5 h-5 text-navy/40" />
                Continuar com e-mail e senha
              </Button>
            ) : (
              <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Input 
                  placeholder="Seu melhor e-mail" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-12 rounded-[14px] border-line focus:ring-gold"
                />
                <Input 
                  type="password" 
                  placeholder="Sua senha" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="h-12 rounded-[14px] border-line focus:ring-gold"
                />
                <Button className="w-full h-12 rounded-[14px] bg-gold hover:bg-gold-deep font-extrabold text-white shadow-lg shadow-gold/20">
                  {view === 'login' ? "Entrar" : "Continuar"}
                </Button>
                <button 
                  onClick={() => setShowEmailFields(false)}
                  className="w-full text-center text-xs font-bold text-muted hover:text-navy transition-colors py-1"
                >
                  Voltar para opções sociais
                </button>
              </div>
            )}
          </div>

          <p className="text-[11px] text-center text-muted font-medium leading-relaxed">
            Ao entrar, concordo com os <a href="#" className="underline hover:text-navy">Termos de Uso</a> e <a href="#" className="underline hover:text-navy">Política de Privacidade</a>.
          </p>
        </div>

        <div className="bg-surface/50 p-6 border-t border-line text-center">
          <p className="text-sm font-bold text-navy">
            {view === 'login' ? "Não tem conta? " : "Já tem conta? "}
            <button 
              onClick={() => setView(view === 'login' ? 'register' : 'login')}
              className="text-gold hover:text-gold-deep underline decoration-2 underline-offset-4"
            >
              {view === 'login' ? "Cadastre-se" : "Entrar"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

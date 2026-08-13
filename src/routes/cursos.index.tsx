import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/cursos/")({
  component: CursosPage,
});

function CursosPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-manrope font-extrabold text-foreground tracking-tight">
              Cursos e Workshops
            </h1>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed">
              Conhecimento profissional com os melhores especialistas do mercado. 
              Módulo completo de cursos será implementado posteriormente.
            </p>
          </div>

          <div className="py-24 flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-surface/50">
            <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Nenhum curso disponível no momento</h2>
            <p className="text-muted-foreground text-sm text-center max-w-sm">
              Fique atento às nossas redes sociais para o lançamento da plataforma de cursos oficial da Zevva.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { cn } from "@/lib/utils";

export function MasterPageHeader({ 
  title, 
  description, 
  children, 
  lastUpdated 
}: { 
  title: string; 
  description: string; 
  children?: React.ReactNode; 
  lastUpdated?: string; 
}) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 mb-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-manrope font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground font-medium">{description}</p>
        {lastUpdated && <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">Atualizado em: {lastUpdated}</p>}
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </header>
  );
}

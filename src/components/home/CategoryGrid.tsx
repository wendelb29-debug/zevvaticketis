import { useNavigate } from "@tanstack/react-router";
import { CATEGORY_THEMES, CategoryType } from "@/lib/categoryThemes";

export function CategoryGrid() {
  const navigate = useNavigate();
  const categories = Object.keys(CATEGORY_THEMES) as CategoryType[];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
      {categories.map((catName) => {
        const theme = CATEGORY_THEMES[catName];
        const Icon = theme.icon;
        
        return (
          <button 
            key={catName}
            onClick={() => navigate({ to: '/eventos', search: { categoria: catName } as any })}
            className="group flex flex-col items-center gap-4 transition-all duration-500"
          >
            <div className="relative w-full aspect-square bg-background border border-border rounded-lg flex items-center justify-center overflow-hidden group-hover:border-border-strong group-hover:bg-surface-elevated transition-all duration-500">
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                style={{ backgroundColor: theme.accentColor }}
              />
              <Icon 
                className="w-8 h-8 text-foreground-muted group-hover:text-primary transition-all duration-500 transform group-hover:scale-110"
              />
            </div>

            <div className="space-y-1 text-center">
              <h3 className="text-[11px] font-bold text-foreground uppercase tracking-[0.15em] leading-tight group-hover:text-primary transition-colors">
                {theme.name}
              </h3>
            </div>
          </button>
        );
      })}
    </div>
  );
}

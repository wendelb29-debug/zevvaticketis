import { useNavigate } from "@tanstack/react-router";
import { CATEGORY_THEMES, CategoryType } from "@/lib/categoryThemes";

export function CategoryGrid() {
  const navigate = useNavigate();
  const categories = Object.keys(CATEGORY_THEMES) as CategoryType[];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-12 gap-y-20">
      {categories.map((catName) => {
        const theme = CATEGORY_THEMES[catName];
        const Icon = theme.icon;
        
        return (
          <button 
            key={catName}
            onClick={() => navigate({ to: '/eventos', search: { categoria: catName, id: undefined } as any })}
            className="group flex flex-col items-center gap-6 transition-all duration-500"
          >
            <div className="relative w-full aspect-[4/5] bg-surface-base border border-border flex items-center justify-center overflow-hidden grayscale group-hover:grayscale-0 group-hover:border-accent group-hover:bg-white transition-all duration-700">
              <Icon 
                className="w-10 h-10 text-foreground-muted group-hover:text-accent transition-all duration-500 transform group-hover:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>

            <div className="space-y-1 text-center">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] leading-tight group-hover:text-accent transition-colors">
                {theme.name}
              </h3>
            </div>
          </button>
        );
      })}
    </div>
  );
}

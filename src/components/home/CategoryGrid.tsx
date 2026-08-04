import { useNavigate } from "@tanstack/react-router";
import { CATEGORY_THEMES, CategoryType } from "@/lib/categoryThemes";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

export function CategoryGrid() {
  const navigate = useNavigate();
  const categories = Object.keys(CATEGORY_THEMES) as CategoryType[];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
      {categories.map((catName) => {
        const theme = CATEGORY_THEMES[catName];
        const Icon = theme.icon;
        
        return (
          <button 
            key={catName}
            onClick={() => navigate({ to: '/eventos', search: { categoria: catName } as any })}
            className="group relative flex flex-col items-center p-8 rounded-[32px] border-2 border-transparent transition-all duration-500 overflow-hidden"
            style={{ 
              backgroundColor: theme.accentColor + '08'
            }}
          >
            {/* Hover Background Accent */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ backgroundColor: theme.accentColor + '15' }}
            />

            <div 
              className="w-16 h-16 rounded-[24px] mb-6 flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10"
              style={{ backgroundColor: theme.accentColor }}
            >
              <Icon className="w-8 h-8" />
            </div>

            <h3 className="text-[11px] font-black text-navy uppercase tracking-widest text-center leading-tight relative z-10">
              {theme.name}
            </h3>

            <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
              <Eye className="w-4 h-4 text-navy/40" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

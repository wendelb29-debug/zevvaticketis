import { Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/event-categories";

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        const isCursos = category.id === "CURSOS";
        const href = isCursos ? "/cursos" : `/eventos/categoria/${category.slug}`;

        return (
          <Link
            key={category.id}
            to={href as any}
            className="group flex flex-col items-center gap-4 p-6 bg-background rounded-xl border border-border hover:border-primary/30 hover:bg-white hover:shadow-xl transition-all duration-300"
          >
            <div className="w-14 h-14 flex items-center justify-center bg-surface rounded-full border border-border group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-300">
              <Icon className="w-6 h-6 text-foreground-muted group-hover:text-primary transition-all duration-300" />
            </div>

            <div className="text-center">
              <h3 className="text-xs font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                {category.name}
              </h3>
            </div>
          </Link>
        );
      })}
    </div>
  );
}


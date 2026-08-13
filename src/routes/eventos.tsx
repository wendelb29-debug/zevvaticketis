import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/eventos")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      busca: (search['busca'] as string) || undefined,
      categoria: (search['categoria'] as string) || undefined,
      cidade: (search['cidade'] as string) || undefined,
      data: (search['data'] as string) || undefined,
      id: (search['id'] as string) || undefined,
    };
  },
  component: EventRedirectPage,
});

function EventRedirectPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/eventos" });

  useEffect(() => {
    const { id, ...otherParams } = search as any;
    if (id) {
      navigate({ to: "/eventos/$id", params: { id }, search: otherParams, replace: true });
    } else {
      navigate({ to: "/eventos", search: otherParams, replace: true });
    }
  }, [search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

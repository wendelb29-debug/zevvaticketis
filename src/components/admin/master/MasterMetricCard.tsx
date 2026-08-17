import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function MasterMetricCard({
  title,
  value,
  description,
  trend,
  trendValue,
  icon: Icon,
  tooltip,
  variant = "default",
  loading = false
}: {
  title: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down";
  trendValue?: string;
  icon?: any;
  tooltip?: string;
  variant?: "default" | "primary" | "navy";
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card className="border-border shadow-sm rounded-2xl overflow-hidden animate-pulse">
        <CardContent className="p-5 space-y-3">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-3 w-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border-border shadow-sm rounded-2xl overflow-hidden transition-all duration-200",
      variant === "primary" ? "bg-primary text-primary-foreground border-primary" : 
      variant === "navy" ? "bg-navy text-primary-foreground border-navy" : "bg-card"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-[11px] font-bold uppercase tracking-wider",
                variant === "default" ? "text-muted-foreground" : "text-primary-foreground/70"
              )}>
                {title}
              </span>
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-3 h-3 opacity-50" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="text-3xl font-manrope font-bold tracking-tight">
              {value}
            </div>
          </div>
          {Icon && (
            <div className={cn(
              "p-2 rounded-lg",
              variant === "default" ? "bg-muted text-muted-foreground" : "bg-white/10 text-primary-foreground"
            )}>
              <Icon size={18} />
            </div>
          )}
        </div>
        
        {(description || trend) && (
          <div className="mt-4 flex items-center gap-2">
            {trend && (
              <div className={cn(
                "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              )}>
                {trend === "up" ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {trendValue}
              </div>
            )}
            {description && (
              <span className={cn(
                "text-[11px] font-medium",
                variant === "default" ? "text-muted-foreground" : "text-primary-foreground/60"
              )}>
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

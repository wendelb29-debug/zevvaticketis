import { Link } from "@tanstack/react-router";

export function CityTicker() {
  const cities = [
    "Jerusalém", "Tel Aviv", "Lisboa", "Porto", "São Paulo", "Rio de Janeiro", 
    "Orlando", "Nova York", "Londres", "Paris", "Roma", "Dubai"
  ];

  // Duplicate for seamless loop
  const tickerItems = [...cities, ...cities, ...cities];

  return (
    <div className="bg-surface-base border-y border-border py-6 overflow-hidden relative">
      <div className="flex animate-marquee whitespace-nowrap">
        {tickerItems.map((city, index) => (
          <div key={index} className="flex items-center mx-12">
            <span className="text-[10px] font-bold text-muted-foreground-foreground uppercase tracking-[0.3em]">{city}</span>
            <div className="w-px h-4 bg-border mx-12 rotate-12" />
          </div>
        ))}
      </div>
      
      {/* Gradients for fade effect */}
      <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-surface-base to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-surface-base to-transparent z-10" />
    </div>
  );
}

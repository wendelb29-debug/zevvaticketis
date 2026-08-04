import { Link } from "@tanstack/react-router";

export function CityTicker() {
  const cities = [
    "Jerusalém", "Tel Aviv", "Lisboa", "Porto", "São Paulo", "Rio de Janeiro", 
    "Orlando", "Nova York", "Londres", "Paris", "Roma", "Dubai"
  ];

  // Duplicate for seamless loop
  const tickerItems = [...cities, ...cities, ...cities];

  return (
    <div className="bg-surface border-y border-line py-3 overflow-hidden relative">
      <div className="flex animate-marquee whitespace-nowrap">
        {tickerItems.map((city, index) => (
          <div key={index} className="flex items-center mx-8">
            <span className="text-[10px] font-black text-navy uppercase tracking-widest">{city}</span>
            <div className="w-1 h-1 rounded-full bg-coral mx-8" />
          </div>
        ))}
      </div>
      
      {/* Gradients for fade effect */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-surface to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-surface to-transparent z-10" />
    </div>
  );
}

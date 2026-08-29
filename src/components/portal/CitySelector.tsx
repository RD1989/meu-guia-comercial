import React from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { usePlatform } from "@/contexts/PlatformContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface CitySelectorProps {
  variant?: "header" | "compact" | "drawer";
}

export function CitySelector({ variant = "header" }: CitySelectorProps) {
  const { currentCity, setCurrentCity, availableCities } = usePlatform();

  const handleSelectCity = (city: string) => {
    setCurrentCity(city);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`h-10 rounded-2xl border-slate-200/80 bg-slate-50/80 hover:bg-white text-slate-800 font-black text-xs gap-1.5 px-3.5 transition-all shadow-sm ${
            variant === "drawer" ? "w-full justify-between" : ""
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate max-w-[120px]">{currentCity || "Selecionar Cidade"}</span>
          </div>
          <ChevronDown className="h-3 w-3 text-slate-400 shrink-0 ml-1" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56 rounded-2xl p-2 bg-white shadow-2xl border-slate-100">
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1.5">
          Cidades Disponíveis
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableCities.map((city) => {
          const isSelected = currentCity.toLowerCase() === city.toLowerCase();

          return (
            <DropdownMenuItem
              key={city}
              onClick={() => handleSelectCity(city)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                isSelected 
                  ? "bg-primary/10 text-primary font-black" 
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{city}</span>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

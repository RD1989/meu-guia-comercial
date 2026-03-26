import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import { MapPin, Target, Navigation, Loader2 } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ... (rest of Leaflet icon fix)

export function MapSelector({ initialPosition = [-23.5505, -46.6333], initialRadius = 5000, onChange }: MapSelectorProps) {
  const [position, setPosition] = useState<[number, number]>(initialPosition);
  const [radius, setRadius] = useState(initialRadius);
  const [isLocating, setIsLocating] = useState(false);

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          onChange(newPos, radius);
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  function MapEvents() {
    useMapEvents({
      click(e) {
        const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
        setPosition(newPos);
        onChange(newPos, radius);
      },
    });
    return null;
  }

  const handleRadiusChange = (value: number[]) => {
    const newRadius = value[0];
    setRadius(newRadius);
    onChange(position, newRadius);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="space-y-1">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
            <Target className="h-3 w-3 text-primary" /> Raio de Propagação: <span className="text-slate-900">{(radius / 1000).toFixed(1)} km</span>
          </Label>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="h-7 px-3 text-[9px] font-black uppercase tracking-widest bg-slate-50 hover:bg-primary hover:text-white transition-all rounded-lg gap-2"
        >
          {isLocating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Navigation className="h-3 w-3" />}
          Minha Localização
        </Button>
      </div>
      
      <Slider
        defaultValue={[radius]}
        max={50000}
        min={1000}
        step={500}
        onValueChange={handleRadiusChange}
        className="py-4"
      />

      <div className="h-[350px] w-full rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner group relative">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
          <Circle 
            center={position} 
            radius={radius} 
            pathOptions={{ 
              fillColor: '#FF6B2C', 
              color: '#FF6B2C', 
              weight: 2, 
              fillOpacity: 0.2 
            }} 
          />
          <MapEvents />
        </MapContainer>
        
        <div className="absolute bottom-4 left-4 z-[10] bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-lg pointer-events-none">
           <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="h-3 w-3 text-primary" /> Clique no mapa para marcar sua sede
           </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
         <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Geográfico</p>
            <p className="text-xs font-bold text-slate-900">Lat: {position[0].toFixed(4)}</p>
            <p className="text-xs font-bold text-slate-900">Lng: {position[1].toFixed(4)}</p>
         </div>
         <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Alcance Estimado</p>
            <p className="text-xs font-bold text-primary">~{Math.floor(radius / 100)} empresas locais</p>
            <p className="text-xs font-bold text-slate-900">Na região metropolitana</p>
         </div>
      </div>
    </div>
  );
}

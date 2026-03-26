import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowUpRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "@/hooks/use-location";
import { cn, getDistance } from "@/lib/utils";
import { MapPin, Zap } from "lucide-react";

interface SmartAdSlotProps {
  type: 'hero_banner' | 'sidebar' | 'blog_inline' | 'popup';
  city?: string;
  className?: string;
}

export function SmartAdSlot({ type, city, className }: SmartAdSlotProps) {
  const userLocation = useLocation();
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(type !== 'popup');
  const targetCity = city || userLocation.city || "São Paulo";

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["smart-ads", type, targetCity, userLocation.lat, userLocation.lng],
    queryFn: async () => {
      let query = (supabase as any)
        .from('business_ads')
        .select('*')
        .eq('status', 'active');
        
      const { data, error } = await query;
      if (error) throw error;
      
      let filtered = data || [];
      
      filtered = filtered.filter((ad: any) => {
        const typeMatch = ad.type === type || (type === 'hero_banner' && ad.type === 'destaque_topo') || (type === 'sidebar' && ad.type === 'lateral');
        if (!typeMatch) return false;
        
        const cityMatch = ad.city === targetCity || !ad.city;
        if (!cityMatch) return false;
        
        if (ad.latitude && ad.longitude && !userLocation.loading && userLocation.lat) {
          const dist = getDistance(userLocation.lat, userLocation.lng, ad.latitude, ad.longitude);
          if (dist > (ad.radius_meters || 10000) / 1000) return false;
        }
        
        return true;
      });
      
      return filtered;
    }
  });

  useEffect(() => {
    if (ads.length > 0) {
      const randomAd = ads[Math.floor(Math.random() * ads.length)];
      setCurrentAd(randomAd);
      
      if (type === 'popup') {
        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [ads, type]);

  if (!currentAd) return null;

  if (type === 'popup') {
    return (
      <AnimatePresence>
        {isVisible && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden relative"
            >
              <button 
                onClick={() => setIsVisible(false)}
                className="absolute top-6 right-6 z-10 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center hover:bg-white transition-all shadow-lg"
              >
                <X className="h-5 w-5 text-slate-900" />
              </button>

              <div className="aspect-video w-full bg-slate-100 relative">
                <img src={currentAd.image_url} alt={currentAd.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-6 flex flex-col gap-2">
                   <div className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 w-fit">
                      <ShieldCheck className="h-3.5 w-3.5" /> Destaque Elite
                   </div>
                   {currentAd.is_flash_deal && (
                     <div className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse w-fit">
                        <Zap className="h-3.5 w-3.5" /> Flash Deal Proximo
                     </div>
                   )}
                </div>
              </div>

              <div className="p-10 space-y-4 text-center">
                 <h3 className="text-3xl font-[900] text-slate-950 tracking-tighter leading-none">{currentAd.title}</h3>
                 <p className="text-slate-500 font-medium leading-relaxed">{currentAd.description}</p>
                 <div className="pt-4">
                    <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20">
                       Aproveitar Agora <ArrowUpRight className="ml-2 h-5 w-5" />
                    </Button>
                 </div>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Oferta exclusiva em {currentAd.city}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  if (type === 'hero_banner') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className={cn("w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row gap-8 p-6 group cursor-pointer hover:shadow-2xl transition-all", className)}
      >
        <div className="h-48 md:w-80 rounded-2xl overflow-hidden shrink-0">
           <img src={currentAd.image_url} alt={currentAd.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
        </div>
        <div className="flex-1 flex flex-col justify-center space-y-3">
           <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Patrocinado</span>
              <div className="h-1 w-1 rounded-full bg-slate-200" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{currentAd.city}</span>
           </div>
           <h4 className="text-2xl font-black text-slate-950 tracking-tighter leading-tight">{currentAd.title}</h4>
           <p className="text-slate-500 font-medium text-sm line-clamp-2">{currentAd.description}</p>
           <div className="pt-2">
              <Button variant="outline" className="h-10 px-8 rounded-xl border-slate-200 font-black text-xs uppercase tracking-widest gap-2">
                 Saiba Mais <ArrowUpRight className="h-4 w-4 text-primary" />
              </Button>
           </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={cn("p-6 bg-white border border-slate-100 rounded-3xl shadow-sm", className)}>
       <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2 italic">Espaço Publicitário Elite</p>
       <h5 className="font-black text-slate-900 mb-1">{currentAd.title}</h5>
       <p className="text-xs text-slate-500 mb-4">{currentAd.description}</p>
       <Button variant="link" className="p-0 h-auto text-primary font-black text-[10px] uppercase tracking-widest">
          Ver Campanha →
       </Button>
    </div>
  );
}

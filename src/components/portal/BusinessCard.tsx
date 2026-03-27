import React, { useRef } from "react";
import { MapPin, Phone, Star, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface BusinessCardProps {
  id: string;
  name: string;
  description?: string;
  address?: string;
  imageUrl?: string;
  categoryName?: string;
  slug: string;
  isFeatured?: boolean;
  performanceScore?: number;
  ratingAverage?: number;
  reviewCount?: number;
  distance?: number;
}

export function BusinessCard({
  name,
  description,
  address,
  imageUrl,
  categoryName,
  slug,
  isFeatured = false,
  performanceScore = 0,
  ratingAverage = 0,
  reviewCount = 0,
  distance,
}: BusinessCardProps) {
  // Lógica de Medalhas de Performance
  const getPerformanceBadge = () => {
    if (performanceScore >= 85) return { label: "Elite Ouro", color: "bg-amber-400 text-amber-950", icon: "🥇" };
    if (performanceScore >= 65) return { label: "Elite Prata", color: "bg-slate-300 text-slate-900", icon: "🥈" };
    if (performanceScore >= 40) return { label: "Elite Bronze", color: "bg-orange-400 text-orange-950", icon: "🥉" };
    return null;
  };

  const performanceBadge = getPerformanceBadge();

  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link to={`/negocio/${slug}`} className="group block" style={{ perspective: 1200 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative flex flex-col h-full bg-white rounded-[32px] overflow-visible border border-slate-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] transition-all duration-500"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Image Container */}
        <div 
          className="relative h-48 w-full overflow-hidden rounded-t-[32px] rounded-b-[4px]"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="absolute inset-0 bg-slate-200 animate-pulse transition-transform duration-700" />
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-300 transition-transform duration-700">
              <MapPin className="h-12 w-12" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2" style={{ transform: "translateZ(40px)" }}>
            {categoryName && (
              <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-md border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg">
                <span>{categoryName}</span>
              </Badge>
            )}
            {isFeatured && (
              <Badge className="bg-primary text-white border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                <Sparkles className="h-3 w-3 mr-1" /> <span>Destaque</span>
              </Badge>
            )}
            {performanceBadge && (
              <Badge className={`${performanceBadge.color} border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-xl ring-2 ring-white/20`}>
                <span className="mr-1">{performanceBadge.icon}</span> <span>{performanceBadge.label}</span>
              </Badge>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4" style={{ transform: "translateZ(35px)" }}>
             <div className={`flex items-center gap-1.5 ${ratingAverage > 0 ? 'bg-emerald-500' : 'bg-slate-500/50'} text-white text-[10px] font-black w-fit px-3 py-1.5 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.2)] backdrop-blur-md border border-white/20`}>
                <Star className={`h-3 w-3 ${ratingAverage > 0 ? 'fill-white' : ''}`} />
                {ratingAverage > 0 ? `${ratingAverage.toFixed(1)} (${reviewCount} avaliações)` : "Novo no Guia"}
             </div>
          </div>
        </div>

        {/* Content */}
        <div 
          className="flex flex-col flex-1 p-5 relative z-10 bg-white/40 rounded-b-[32px] backdrop-blur-sm"
          style={{ transform: "translateZ(20px)" }}
        >
          <div className="flex justify-between items-start mb-1.5">
            <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {name}
            </h3>
          </div>
          
          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4 font-medium">
            {description || "O melhor estabelecimento da região com preços incríveis."}
          </p>

          <div className="mt-auto pt-4 border-t border-slate-200/50 flex items-center justify-between group-hover:border-primary/20 transition-colors">
            <div className="flex flex-col text-slate-400 min-w-0">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 group-hover:text-primary transition-colors" />
                <span className="text-[11px] font-bold truncate uppercase tracking-wider text-slate-500 group-hover:text-slate-700 transition-colors">{address || "Endereço indisponível"}</span>
              </div>
              {distance !== undefined && (
                <span className="text-[10px] font-black text-primary uppercase ml-4.5 mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                   • {distance.toFixed(1)} km de você
                </span>
              )}
            </div>
            <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_10px_20px_-5px_rgba(255,107,44,0.4)] transition-all duration-300 border border-slate-100 group-hover:border-primary/50 group-hover:scale-110">
              <ArrowRight className="h-5 w-5 transition-colors group-hover:text-white group-hover:animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

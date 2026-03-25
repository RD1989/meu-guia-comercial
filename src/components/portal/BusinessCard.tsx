import React from "react";
import { MapPin, Phone, Star, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

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

  return (
    <Link to={`/negocio/${slug}`} className="group block">
      <div className="relative flex flex-col h-full bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
        {/* Image Container */}
        <div className="relative h-56 w-full overflow-hidden">
          <div className="absolute inset-0 bg-slate-200 animate-pulse group-hover:scale-110 transition-transform duration-700" />
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-300 group-hover:scale-110 transition-transform duration-700">
              <MapPin className="h-12 w-12" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
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

          <div className="absolute bottom-4 left-4 right-4">
             <div className={`flex items-center gap-1.5 ${ratingAverage > 0 ? 'bg-emerald-500' : 'bg-slate-500/50'} text-white text-[10px] font-black w-fit px-2 py-1 rounded-lg shadow-lg backdrop-blur-sm`}>
                <Star className={`h-3 w-3 ${ratingAverage > 0 ? 'fill-white' : ''}`} />
                {ratingAverage > 0 ? `${ratingAverage.toFixed(1)} (${reviewCount} avaliações)` : "Novo no Guia"}
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {name}
            </h3>
          </div>
          
          <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-6 font-medium italic">
            {description || "O melhor estabelecimento da região com preços incríveis."}
          </p>

          <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col text-slate-400 min-w-0">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="text-[11px] font-bold truncate uppercase tracking-wider">{address || "Endereço indisponível"}</span>
              </div>
              {distance !== undefined && (
                <span className="text-[10px] font-black text-primary uppercase ml-4.5 mt-0.5 animate-in fade-in slide-in-from-left-1 duration-700">
                   • {distance.toFixed(1)} km de você
                </span>
              )}
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner border border-slate-100">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Zap, User, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export interface Post {
  id: string;
  user_id?: string;
  user_name: string;
  user_avatar?: string;
  business_name?: string;
  is_verified?: boolean;
  content: string;
  media_urls: string[];
  media_type: 'image' | 'video';
  likes_count: number;
  comments_count: number;
  city: string;
  created_at: string;
  is_sponsored?: boolean;
}

interface PostCardProps {
  post: Post;
  onLike?: (id: string) => void;
}

export const PostCard = ({ post, onLike }: PostCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (videoRef.current) {
            if (entry.isIntersecting) {
              videoRef.current.play().catch(() => {});
            } else {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, [post.media_type]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(post.id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 mb-8 group/card"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => navigate(`/comunidade/perfil/${post.user_id || 'dummy'}`)}
        >
          <div className="h-12 w-12 rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center text-white font-black shadow-lg shadow-slate-900/10">
            {post.user_avatar ? (
              <img src={post.user_avatar} alt={post.user_name} className="w-full h-full object-cover" />
            ) : (
              post.user_name[0]
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-black text-slate-900 tracking-tight group-hover/card:text-primary transition-colors">{post.user_name}</h4>
              {post.is_verified && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 fill-blue-500/10" />}
              {post.is_sponsored && (
                <Badge className="bg-primary/10 text-primary border-0 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ml-2">
                   Patrocinado
                </Badge>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest mt-0.5">
              <MapPin className="h-3 w-3" /> {post.city} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full text-slate-300 hover:text-slate-900 hover:bg-slate-50">
           <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="px-8 pb-5">
        <p className="text-slate-700 text-sm leading-relaxed font-medium">
          {post.content}
        </p>
      </div>

      {/* Media with Liquid Background */}
      <div className="w-full bg-slate-50 relative group overflow-hidden">
        {post.media_type === 'video' ? (
          <div className="aspect-[4/5] md:aspect-video relative">
            <video 
              ref={videoRef}
              src={post.media_urls[0]} 
              className="w-full h-full object-cover" 
              muted 
              loop 
              playsInline
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        ) : (
          <div className="aspect-square relative overflow-hidden">
            <img 
              src={post.media_urls[0]} 
              alt="Content" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
            />
          </div>
        )}
        
        {post.is_sponsored && (
          <div className="absolute top-6 left-6">
             <div className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-white/10">
                <Zap className="h-3.5 w-3.5 text-primary animate-pulse" /> Oferta de Elite
             </div>
          </div>
        )}
      </div>

      {/* Enhanced Actions */}
      <div className="p-6 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike}
            className="flex items-center gap-2 group/btn"
          >
            <AnimatePresence mode="wait">
              <motion.div 
                key={isLiked ? 'liked' : 'unliked'}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`h-11 w-11 rounded-full flex items-center justify-center transition-all ${
                  isLiked ? 'bg-rose-50 text-rose-500 shadow-inner' : 'bg-white text-slate-400 shadow-sm group-hover/btn:bg-rose-50 group-hover/btn:text-rose-500'
                }`}
              >
                 <Heart className={`h-5 w-5 ${isLiked ? 'fill-rose-500' : ''}`} />
              </motion.div>
            </AnimatePresence>
            <span className={`text-sm font-black transition-colors ${isLiked ? 'text-rose-600' : 'text-slate-900'}`}>
              {post.likes_count + (isLiked ? 1 : 0)}
            </span>
          </button>
          <button className="flex items-center gap-2 group/btn">
            <div className="h-11 w-11 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm group-hover/btn:bg-blue-50 group-hover/btn:text-blue-500 transition-all">
               <MessageCircle className="h-5 w-5" />
            </div>
            <span className="text-sm font-black text-slate-900">{post.comments_count}</span>
          </button>
        </div>
        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full bg-white shadow-sm text-slate-400 hover:text-primary transition-all">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
};

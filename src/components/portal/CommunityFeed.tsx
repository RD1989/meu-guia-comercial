import React, { useState, useMemo } from "react";
import { PostCard, Post } from "./PostCard";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, Plus, Filter, Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CreatePostModal } from "./CreatePostModal";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/hooks/use-location";
import { toast } from "sonner";
import { getDistance } from "@/lib/utils";

const DUMMY_POSTS: (Post & { lat: number; lng: number })[] = [
  {
    id: "p1",
    user_id: "u1",
    user_name: "Rodrigo L.",
    user_avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200",
    content: "O melhor café da cidade! Recomendo muito o Elite Coffee, o atendimento é impecável. ☕️✨",
    media_urls: ["https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800"],
    media_type: "image",
    likes_count: 24,
    comments_count: 5,
    city: "São Paulo",
    lat: -23.5505,
    lng: -46.6333,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    is_verified: true
  },
  {
    id: "p2",
    user_id: "u2",
    user_name: "Elite Fitness Center",
    business_name: "Elite Fitness",
    content: "Projeto Verão 2026 a todo vapor! Venha conhecer nossa nova área VIP de musculação. 🏋️‍♂️🔥",
    media_urls: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800"],
    media_type: "image",
    likes_count: 156,
    comments_count: 12,
    city: "São Paulo",
    lat: -23.5615,
    lng: -46.6553,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    is_sponsored: true,
    is_verified: true
  },
  {
    id: "p3",
    user_id: "u3",
    user_name: "Marina S.",
    content: "Passeio incrível hoje no parque. A cidade está linda com essa iluminação nova! 😍🌳",
    media_urls: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800"],
    media_type: "image",
    likes_count: 42,
    comments_count: 3,
    city: "Curitiba",
    lat: -25.4284,
    lng: -49.2733,
    created_at: new Date(Date.now() - 10800000).toISOString()
  }
];

export const CommunityFeed = () => {
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const userLocation = useLocation();

  const rankedPosts = useMemo(() => {
    let posts = [...DUMMY_POSTS];

    // Simulação do Algoritmo Local-First
    if (!userLocation.loading && userLocation.lat && filter === "local") {
      return posts
        .map(post => ({
          ...post,
          distance: getDistance(userLocation.lat, userLocation.lng, post.lat, post.lng)
        }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [userLocation, filter]);

  const handleCreatePost = () => {
    if (!user) {
      toast.error("Você precisa estar logado para postar na comunidade.");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPostCreated={() => {
          // Relod logic would go here
        }}
      />
      
      {/* Feed Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <h2 className="text-4xl font-[900] text-slate-900 tracking-tighter leading-none">Comunidade Elite</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> O que está rolando na sua região
          </p>
        </div>
        <Button 
          onClick={handleCreatePost}
          className="h-14 w-14 rounded-3xl bg-slate-900 shadow-2xl shadow-slate-900/20 hover:bg-primary transition-all active:scale-95 group"
        >
           <Plus className="h-6 w-6 text-white group-hover:rotate-90 transition-transform" />
        </Button>
      </div>

      {/* Quick Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-1 group">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
           <Input 
             placeholder="Buscar na comunidade..." 
             className="h-16 pl-14 pr-8 bg-slate-50 border-none rounded-[2rem] text-sm font-bold shadow-sm focus-visible:ring-primary focus-visible:bg-white transition-all"
           />
        </div>
        <div className="flex gap-2">
           <Button 
             variant={filter === 'all' ? 'default' : 'outline'} 
             onClick={() => setFilter('all')}
             className={`h-16 px-8 rounded-[2rem] font-black uppercase text-[10px] tracking-widest ${filter === 'all' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-white border-slate-100 text-slate-400'}`}
           >
              Recentes
           </Button>
           <Button 
             variant={filter === 'local' ? 'default' : 'outline'} 
             onClick={() => setFilter('local')}
             disabled={!userLocation}
             className={`h-16 px-8 rounded-[2rem] font-black uppercase text-[10px] tracking-widest gap-2 ${filter === 'local' ? 'bg-primary text-white shadow-xl shadow-primary/20 border-0' : 'bg-white border-slate-100 text-slate-400'}`}
           >
              <MapPin className="h-3.5 w-3.5" /> Perto de Mim
           </Button>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {rankedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Loading Footer */}
      <div className="py-12 text-center">
         <div className="h-2 w-12 bg-slate-100 rounded-full mx-auto" />
      </div>
    </div>
  );
};

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

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const CommunityFeed = () => {
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const userLocation = useLocation();

  const { data: dbPosts = [], isLoading, refetch } = useQuery({
    queryKey: ["community-posts"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("community_posts")
        .select(`
          *,
          profiles ( name, avatar_url ),
          businesses ( name )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const rankedPosts = useMemo(() => {
    let posts = dbPosts.map((post: any) => ({
      id: post.id,
      user_id: post.user_id,
      user_name: post.profiles?.name || post.businesses?.name || "Usuário",
      user_avatar: post.profiles?.avatar_url,
      business_name: post.businesses?.name,
      content: post.content,
      media_urls: post.media_urls || [],
      media_type: post.media_type,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      city: post.city,
      lat: post.latitude,
      lng: post.longitude,
      created_at: post.created_at,
      is_sponsored: post.is_sponsored,
      is_verified: post.is_verified
    }));

    // Simulação do Algoritmo Local-First
    if (!userLocation.loading && userLocation.lat && filter === "local") {
      return posts
        .map((post: any) => ({
          ...post,
          distance: getDistance(userLocation.lat!, userLocation.lng!, post.lat, post.lng)
        }))
        .sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));
    }

    return posts;
  }, [userLocation, filter, dbPosts]);

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
          refetch(); // Reload actual posts from Supabase!
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
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : rankedPosts.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-100">
             <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-slate-900 mb-2">Comunidade Silenciosa</h3>
             <p className="text-slate-500 font-medium text-sm">Seja o primeiro a compartilhar algo incrível na sua região!</p>
          </div>
        ) : (
          rankedPosts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>

      {/* Loading Footer */}
      <div className="py-12 text-center">
         <div className="h-2 w-12 bg-slate-100 rounded-full mx-auto" />
      </div>
    </div>
  );
};

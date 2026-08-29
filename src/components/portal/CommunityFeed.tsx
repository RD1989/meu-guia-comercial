import React, { useState, useMemo } from "react";
import { PostCard, Post } from "./PostCard";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, Plus, Filter, Search, MapPin, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CreatePostModal } from "./CreatePostModal";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/hooks/use-location";
import { usePlatform } from "@/contexts/PlatformContext";
import { toast } from "sonner";
import { getDistance } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const CommunityFeed = () => {
  const [filter, setFilter] = useState<"city" | "all" | "local">("city");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { currentCity } = usePlatform();
  const userLocation = useLocation();

  const { data: dbPosts = [], isLoading, refetch } = useQuery({
    queryKey: ["community-posts", currentCity],
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

    // Filtro de Busca
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      posts = posts.filter((p: any) => 
        p.content?.toLowerCase().includes(query) ||
        p.user_name?.toLowerCase().includes(query) ||
        p.business_name?.toLowerCase().includes(query)
      );
    }

    // Filtro por Cidade Selecionada
    if (filter === "city" && currentCity) {
      posts = posts.filter((p: any) => !p.city || p.city.toLowerCase() === currentCity.toLowerCase());
    }

    // Algoritmo Local-First por GPS
    if (!userLocation.loading && userLocation.lat && filter === "local") {
      return posts
        .map((post: any) => ({
          ...post,
          distance: getDistance(userLocation.lat!, userLocation.lng!, post.lat, post.lng)
        }))
        .sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));
    }

    return posts;
  }, [userLocation, filter, dbPosts, currentCity, searchTerm]);

  const handleCreatePost = () => {
    if (!user) {
      toast.error("Você precisa estar logado para postar na comunidade.");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 font-sans">
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPostCreated={() => {
          refetch();
        }}
      />
      
      {/* Feed Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h2 className="text-3xl sm:text-4xl font-[900] text-slate-900 tracking-tight leading-none">
            Comunidade Local
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pt-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> O que está rolando {currentCity ? `em ${currentCity}` : "na sua região"}
          </p>
        </div>
        <Button 
          onClick={handleCreatePost}
          className="h-12 w-12 rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/20 hover:bg-primary transition-all active:scale-95 group text-white"
          title="Criar Publicação"
        >
           <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
        </Button>
      </div>

      {/* Quick Search & Filters */}
      <div className="space-y-3 mb-8">
        <div className="relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
           <Input 
             placeholder="Buscar tópicos, pessoas ou empresas..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="h-12 pl-11 pr-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold shadow-sm focus-visible:ring-primary transition-all"
           />
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
           {currentCity && (
             <Button 
               variant={filter === 'city' ? 'default' : 'outline'} 
               onClick={() => setFilter('city')}
               className={`h-10 px-4 rounded-xl font-bold text-xs ${filter === 'city' ? 'bg-primary text-white shadow-md shadow-primary/20 border-none' : 'bg-white border-slate-100 text-slate-600'}`}
             >
                <Building className="h-3.5 w-3.5 mr-1.5" /> {currentCity}
             </Button>
           )}
           <Button 
             variant={filter === 'all' ? 'default' : 'outline'} 
             onClick={() => setFilter('all')}
             className={`h-10 px-4 rounded-xl font-bold text-xs ${filter === 'all' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border-slate-100 text-slate-600'}`}
           >
              Todas as Cidades
           </Button>
           <Button 
             variant={filter === 'local' ? 'default' : 'outline'} 
             onClick={() => setFilter('local')}
             disabled={!userLocation.lat}
             className={`h-10 px-4 rounded-xl font-bold text-xs gap-1.5 ${filter === 'local' ? 'bg-primary text-white shadow-md shadow-primary/20 border-none' : 'bg-white border-slate-100 text-slate-600'}`}
           >
              <MapPin className="h-3.5 w-3.5" /> Mais Próximos (GPS)
           </Button>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : rankedPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-3">
             <MessageSquare className="h-10 w-10 text-slate-300 mx-auto" />
             <h3 className="text-lg font-black text-slate-900">Nenhuma publicação ainda</h3>
             <p className="text-slate-400 font-medium text-xs max-w-sm mx-auto">
               Seja o primeiro a compartilhar uma novidade ou evento na comunidade de {currentCity || "sua cidade"}!
             </p>
             <Button 
               onClick={handleCreatePost}
               className="rounded-2xl h-10 px-6 bg-primary text-white font-bold text-xs uppercase tracking-wider mt-2"
             >
               Criar Primeira Postagem
             </Button>
          </div>
        ) : (
          rankedPosts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>

      {/* Loading Footer */}
      <div className="py-12 text-center">
         <div className="h-1.5 w-10 bg-slate-200 rounded-full mx-auto" />
      </div>
    </div>
  );
};

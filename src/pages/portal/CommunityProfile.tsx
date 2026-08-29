import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, CheckCircle2, MessageCircle, Grid, Play, Heart, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWhatsAppUrl } from "@/lib/whatsapp";
import { SEO } from "@/components/SEO";

const CommunityProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch Business or Profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["community-profile", id],
    enabled: !!id,
    queryFn: async () => {
      // 1. Try finding in businesses table
      const { data: business } = await supabase
        .from("businesses")
        .select("*, categories(name)")
        .or(`id.eq.${id},slug.eq.${id}`)
        .maybeSingle();

      if (business) {
        return {
          type: "business",
          id: business.id,
          name: business.name,
          avatar: business.image_url || "",
          cover: business.image_url || "",
          bio: business.description || "Estabelecimento cadastrado no Guia Comercial.",
          city: (business as any).city || "Local",
          whatsapp: business.whatsapp,
          verified: true,
        };
      }

      // 2. Try finding in profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id!)
        .maybeSingle();

      if (profile) {
        return {
          type: "user",
          id: profile.id,
          name: profile.name || "Membro da Comunidade",
          avatar: (profile as any).avatar_url || "",
          cover: "",
          bio: "Membro da comunidade local.",
          city: "Local",
          whatsapp: "",
          verified: false,
        };
      }

      return null;
    }
  });

  // Fetch Real Posts
  const { data: posts = [] } = useQuery({
    queryKey: ["community-profile-posts", profileData?.id],
    enabled: !!profileData?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("community_posts")
        .select("*")
        .or(`business_id.eq.${profileData!.id},user_id.eq.${profileData!.id}`)
        .order("created_at", { ascending: false });

      if (error) return [];
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-20 md:pb-0">
        <Header />
        <div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        <BottomTabBar />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-white pb-20 md:pb-0">
        <Header />
        <div className="max-w-md mx-auto px-6 py-32 text-center space-y-4">
          <p className="text-xl font-bold text-slate-800">Perfil não encontrado</p>
          <p className="text-sm text-slate-500">O membro ou estabelecimento que você procura não está disponível.</p>
          <Button onClick={() => navigate("/comunidade")} className="rounded-xl font-bold">Voltar à Comunidade</Button>
        </div>
        <BottomTabBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <SEO 
        title={`${profileData.name} - Comunidade`}
        description={profileData.bio}
        image={profileData.avatar}
      />
      <Header />
      
      <main className="pt-20">
        {/* Cover Image */}
        <div className="h-48 md:h-80 w-full overflow-hidden relative bg-slate-900">
          {profileData.cover ? (
            <img src={profileData.cover} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-900 to-primary/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/20 hover:bg-white/40"
          >
             <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>

        {/* Profile Header Info */}
        <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-[2.5rem] bg-slate-900 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center text-white font-black text-4xl">
                 {profileData.avatar ? (
                   <img src={profileData.avatar} alt={profileData.name} className="w-full h-full object-cover" />
                 ) : (
                   <span>{profileData.name[0]}</span>
                 )}
              </div>
              <div className="pb-2 space-y-1">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                   <h1 className="text-3xl font-[900] text-slate-900 tracking-tighter">{profileData.name}</h1>
                   {profileData.verified && <CheckCircle2 className="h-6 w-6 text-blue-500 fill-blue-500/10" />}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest justify-center md:justify-start">
                   <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {profileData.city}</p>
                </div>
              </div>
            </div>

            {profileData.whatsapp && (
              <div className="flex items-center gap-3 justify-center">
                <Button 
                  onClick={() => window.open(formatWhatsAppUrl(profileData.whatsapp), "_blank")}
                  className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl gap-2"
                >
                   <MessageCircle className="h-5 w-5" /> Falar no WhatsApp
                </Button>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="my-8">
             <p className="text-slate-600 font-medium leading-relaxed max-w-2xl text-center md:text-left mx-auto md:mx-0">
                {profileData.bio}
             </p>
          </div>

          {/* Posts Grid */}
          <div className="mb-20">
             <div className="flex items-center gap-8 mb-8 border-b border-slate-100 pb-4">
                <div className="font-black uppercase text-xs tracking-widest text-slate-900 flex items-center gap-2">
                   <Grid className="h-4 w-4 text-primary" /> Publicações ({posts.length})
                </div>
             </div>

             {posts.length === 0 ? (
               <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                 <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                 <p className="font-bold text-slate-600 text-sm">Nenhuma publicação ainda</p>
                 <p className="text-xs text-slate-400">Este perfil ainda não compartilhou fotos ou novidades.</p>
               </div>
             ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                  {posts.map((post: any) => (
                    <motion.div 
                      key={post.id}
                      whileHover={{ scale: 0.98 }}
                      className="aspect-square bg-slate-100 rounded-3xl md:rounded-[2rem] overflow-hidden relative group cursor-pointer"
                    >
                      {post.media_url ? (
                        <img src={post.media_url} alt="Media" className="w-full h-full object-cover" />
                      ) : (
                        <div className="p-6 h-full flex items-center justify-center bg-slate-50 text-slate-700 text-xs font-bold text-center">
                          {post.content}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-6 text-white backdrop-blur-[2px]">
                         <div className="flex items-center gap-2 font-black text-sm">
                            <Heart className="h-5 w-5 fill-white" /> {post.likes_count || 0}
                         </div>
                      </div>
                    </motion.div>
                  ))}
               </div>
             )}
          </div>
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
};

export default CommunityProfile;


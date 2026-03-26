import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, CheckCircle2, UserPlus, MessageCircle, Grid, Play, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DUMMY_USER = {
  id: "u123",
  name: "Elite Fitness Center",
  avatar: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200",
  cover: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200",
  bio: "Transformando vidas através do esporte. A maior estrutura da região agora na palma da sua mão! 💪🔥",
  city: "São Paulo, SP",
  joined: "Janeiro 2024",
  is_verified: true,
  followers: 1250,
  following: 84,
  posts_count: 42
};

const DUMMY_MEDIA = [
  { id: "m1", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400", type: "image", likes: 120 },
  { id: "m2", url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=400", type: "image", likes: 85 },
  { id: "m3", url: "https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=400", type: "video", likes: 340 },
  { id: "m4", url: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=400", type: "image", likes: 67 },
  { id: "m5", url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=400", type: "image", likes: 92 },
  { id: "m6", url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400", type: "video", likes: 156 }
];

const CommunityProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <Header />
      
      <main className="pt-20">
        {/* Cover Image */}
        <div className="h-48 md:h-80 w-full overflow-hidden relative">
          <img src={DUMMY_USER.cover} alt="Cover" className="w-full h-full object-cover" />
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
                 <img src={DUMMY_USER.avatar} alt={DUMMY_USER.name} className="w-full h-full object-cover" />
              </div>
              <div className="pb-2 space-y-1">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                   <h1 className="text-3xl font-[900] text-slate-900 tracking-tighter">{DUMMY_USER.name}</h1>
                   {DUMMY_USER.is_verified && <CheckCircle2 className="h-6 w-6 text-blue-500 fill-blue-500/10" />}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest justify-center md:justify-start">
                   <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {DUMMY_USER.city}</p>
                   <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Entrou em {DUMMY_USER.joined}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center">
              <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/20 gap-2">
                 <UserPlus className="h-4 w-4" /> Seguir
              </Button>
              <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-100 bg-white text-slate-600 hover:bg-slate-50 shadow-sm p-0">
                 <MessageCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center md:justify-start gap-12 py-8 border-b border-slate-50 mb-8 mt-4 overflow-x-auto">
             <div className="text-center md:text-left">
                <p className="text-2xl font-black text-slate-900">{DUMMY_USER.posts_count}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Postagens</p>
             </div>
             <div className="text-center md:text-left">
                <p className="text-2xl font-black text-slate-900">1.2K</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Seguidores</p>
             </div>
             <div className="text-center md:text-left">
                <p className="text-2xl font-black text-slate-900">{DUMMY_USER.following}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Seguindo</p>
             </div>
          </div>

          {/* Bio */}
          <div className="mb-12">
             <p className="text-slate-600 font-medium leading-relaxed max-w-2xl text-center md:text-left mx-auto md:mx-0">
                {DUMMY_USER.bio}
             </p>
          </div>

          {/* Tabs / Media Feed */}
          <div className="mb-20">
             <div className="flex items-center gap-8 mb-8 border-b border-slate-50 justify-center md:justify-start">
                <button className="pb-4 border-b-2 border-primary text-slate-900 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                   <Grid className="h-4 w-4" /> Grade
                </button>
                <button className="pb-4 text-slate-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                   <Play className="h-4 w-4" /> Vídeos
                </button>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                {DUMMY_MEDIA.map((item) => (
                  <motion.div 
                    key={item.id}
                    whileHover={{ scale: 0.98 }}
                    className="aspect-square bg-slate-100 rounded-3xl md:rounded-[2rem] overflow-hidden relative group cursor-pointer"
                  >
                    <img src={item.url} alt="Media" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-6 text-white backdrop-blur-[2px]">
                       <div className="flex items-center gap-2 font-black text-sm">
                          <Heart className="h-5 w-5 fill-white" /> {item.likes}
                       </div>
                       {item.type === 'video' && <Play className="h-6 w-6 fill-white" />}
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
};

export default CommunityProfile;

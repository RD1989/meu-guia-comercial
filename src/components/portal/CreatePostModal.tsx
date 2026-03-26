import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Video, X, Sparkles, Send, Loader2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export const CreatePostModal = ({ isOpen, onClose, onPostCreated }: CreatePostModalProps) => {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaType(type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handlePost = async () => {
    if (!content.trim() && !mediaFile) return;

    setLoading(true);
    try {
      // 1. Check Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para postar.");
        setLoading(false);
        return;
      }

      let mediaUrl = "";
      // 2. Upload Media if exists
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('community-media')
          .upload(filePath, mediaFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('community-media')
          .getPublicUrl(filePath);
          
        mediaUrl = publicUrl;
      }

      // 3. Create Post Record
      const { error: postError } = await (supabase as any).from('community_posts').insert({
        user_id: user.id,
        content,
        media_urls: mediaUrl ? [mediaUrl] : [],
        media_type: mediaType,
        city: "São Paulo", // Default for demo
        likes_count: 0
      });

      if (postError) throw postError;

      toast.success("Postagem realizada com sucesso!");
      setContent("");
      clearMedia();
      onPostCreated?.();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao postar: " + (error.message || "Tente novamente mais tarde."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[3rem] bg-white">
        <DialogHeader className="p-8 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
             </div>
             <DialogTitle className="text-xl font-black tracking-tighter">Criar Postagem Elite</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="O que está acontecendo na sua cidade?"
            className="min-h-[150px] bg-slate-50 border-none rounded-3xl p-6 text-slate-700 font-medium focus-visible:ring-primary focus-visible:bg-white transition-all text-sm"
          />

          <AnimatePresence>
            {mediaPreview && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative aspect-square w-full rounded-3xl overflow-hidden border border-slate-100 bg-slate-50"
              >
                {mediaType === 'video' ? (
                  <video src={mediaPreview} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                )}
                <button 
                  onClick={clearMedia}
                  className="absolute top-4 right-4 h-10 w-10 rounded-full bg-slate-900/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-rose-500 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4">
             <div className="flex gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*"
                  onChange={(e) => handleFileSelect(e, e.target.files?.[0]?.type.startsWith('video') ? 'video' : 'image')}
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-14 px-6 rounded-2xl border-slate-100 gap-2 font-black uppercase text-[10px] tracking-widest text-slate-600 hover:bg-primary/5 hover:text-primary transition-all"
                >
                   <Image className="h-4 w-4" /> Foto
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = "video/*";
                      fileInputRef.current.click();
                    }
                  }}
                  className="h-14 px-6 rounded-2xl border-slate-100 gap-2 font-black uppercase text-[10px] tracking-widest text-slate-600 hover:bg-primary/5 hover:text-primary transition-all"
                >
                   <Video className="h-4 w-4" /> Vídeo
                </Button>
             </div>
             
             <Button 
               onClick={handlePost}
               disabled={loading || (!content.trim() && !mediaFile)}
               className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 gap-2 transition-all active:scale-95"
             >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Postar
             </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

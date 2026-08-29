import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, Video, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaUploadProps {
  bucket: "business-images" | "product-images";
  currentUrl?: string | null;
  type?: "image" | "video";
  onUpload: (url: string, type: "image" | "video") => void;
  onRemove?: () => void;
  className?: string;
  multimedia?: boolean;
}

export function MediaUpload({
  bucket,
  currentUrl,
  type = "image",
  onUpload,
  onRemove,
  className,
  multimedia = true,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isImage && !isVideo) {
      toast.error("Selecione um arquivo de imagem ou vídeo.");
      return;
    }

    if (isVideo && file.size > 20 * 1024 * 1024) {
      toast.error("Vídeo deve ter no máximo 20MB.");
      return;
    }

    if (isImage && file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onUpload(data.publicUrl, isVideo ? "video" : "image");
      toast.success(isVideo ? "Vídeo enviado!" : "Imagem enviada!");
    } catch (err: any) {
      toast.error(`Erro ao enviar: ${err.message}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("relative group", className)}>
      <div
        className={cn(
          "rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all aspect-[16/10]"
        )}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {currentUrl ? (
          type === "video" ? (
            <video
              src={currentUrl}
              className="w-full h-full object-cover"
              controls={false}
              muted
              loop
              autoPlay
            />
          ) : (
            <img
              src={currentUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            {multimedia ? (
              <div className="flex gap-2">
                <Camera className="h-6 w-6" />
                <Video className="h-6 w-6" />
              </div>
            ) : (
              <Camera className="h-8 w-8" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {multimedia ? "Enviar Mídia" : "Enviar Foto"}
            </span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {currentUrl && onRemove && !uploading && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={multimedia ? "image/*,video/*" : "image/*"}
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}

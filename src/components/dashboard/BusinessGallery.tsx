import { useState } from "react";
import { MediaUpload } from "./MediaUpload";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Image as ImageIcon, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface BusinessGalleryProps {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  maxPhotos?: number;
  maxVideos?: number;
}

export function BusinessGallery({
  items = [],
  onChange,
  maxPhotos = 20,
  maxVideos = 5,
}: BusinessGalleryProps) {
  const photoCount = items.filter(i => i.type === "image").length;
  const videoCount = items.filter(i => i.type === "video").length;

  const handleAdd = (url: string, type: "image" | "video") => {
    if (type === "image" && photoCount >= maxPhotos) {
      // toast handled in parent or here
      return;
    }
    if (type === "video" && videoCount >= maxVideos) {
      return;
    }
    onChange([...items, { url, type }]);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div key={index} className="relative group aspect-[16/10] rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            {item.type === "video" ? (
              <video src={item.url} className="w-full h-full object-cover" muted loop autoPlay />
            ) : (
              <img src={item.url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
            )}
            
            <div className="absolute top-2 left-2">
              <div className="bg-black/50 backdrop-blur-md p-1.5 rounded-lg text-white">
                {item.type === "video" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
              </div>
            </div>

            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-lg"
              onClick={() => handleRemove(index)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        
        {(photoCount < maxPhotos || videoCount < maxVideos) && (
          <MediaUpload
            bucket="business-images"
            onUpload={handleAdd}
            className="h-full"
          />
        )}
      </div>

      <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span className={photoCount >= maxPhotos ? "text-red-400" : ""}>
          Fotos: {photoCount}/{maxPhotos}
        </span>
        <span className={videoCount >= maxVideos ? "text-red-400" : ""}>
          Vídeos: {videoCount}/{maxVideos}
        </span>
      </div>
    </div>
  );
}

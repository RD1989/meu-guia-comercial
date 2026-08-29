import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown, HelpCircle, Upload, Loader2 } from "lucide-react";

interface BannersManagerTabProps {
  formData: any;
  onChange: (e: any) => void;
  banners: any[];
  setBanners: React.Dispatch<React.SetStateAction<any[]>>;
  bannersLoading: boolean;
  onBannerUpload: (e: React.ChangeEvent<HTMLInputElement>, bannerId: string, index: number) => void;
  uploadingBanner: string | null;
}

export function BannersManagerTab({
  formData,
  onChange,
  banners,
  setBanners,
  bannersLoading,
  onBannerUpload,
  uploadingBanner
}: BannersManagerTabProps) {

  const handleAddBanner = () => {
    const newBanner = {
      id: Math.random().toString(36).substr(2, 9),
      image_url: "",
      title: "Novo Banner",
      subtitle: "",
      link_url: "",
      active: true,
      sort_order: banners.length + 1,
      isNew: true
    };
    setBanners([...banners, newBanner]);
  };

  const handleRemoveBanner = (index: number) => {
    const updated = banners.filter((_, i) => i !== index);
    setBanners(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === banners.length - 1)
    ) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...banners];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalcular sort_order
    updated.forEach((b, i) => {
      b.sort_order = i + 1;
    });

    setBanners(updated);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle>Configurações do Slider</CardTitle>
          <CardDescription>Ajuste o comportamento do carrossel na página inicial.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs space-y-2">
            <Label htmlFor="banner_interval">Tempo de Transição (segundos)</Label>
            <div className="flex gap-4 items-center">
              <Input 
                id="banner_interval" 
                type="number" 
                value={formData.banner_interval || 5} 
                onChange={onChange} 
                min={2} 
                max={30} 
              />
              <span className="text-slate-400 text-sm whitespace-nowrap">segundos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gerenciar Banners do Portal</CardTitle>
            <CardDescription>Adicione imagens promocionais e campanhas para o topo da Home.</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 rounded-xl font-bold"
            onClick={handleAddBanner}
          >
            <Plus className="h-4 w-4" /> Adicionar Banner
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {banners.length === 0 && !bannersLoading && (
              <div className="p-12 text-center border-2 border-dashed rounded-2xl bg-slate-50 text-slate-400">
                Nenhum banner cadastrado. Clique em Adicionar acima para começar.
              </div>
            )}
            
            {banners.map((banner, index) => (
              <div 
                key={banner.id} 
                className="flex flex-col md:flex-row gap-6 p-6 border rounded-3xl bg-slate-50/50 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="w-full md:w-64 h-36 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border">
                  {banner.image_url ? (
                    <img src={banner.image_url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Imagem do Banner (URL ou Upload)</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={banner.image_url || ""} 
                          onChange={(e) => {
                            const updated = [...banners];
                            updated[index].image_url = e.target.value;
                            setBanners(updated);
                          }} 
                          placeholder="https://..."
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            id={`banner-upload-${banner.id}`} 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => onBannerUpload(e, banner.id, index)}
                            disabled={uploadingBanner === banner.id}
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            asChild
                            disabled={uploadingBanner === banner.id}
                          >
                            <label htmlFor={`banner-upload-${banner.id}`} className="cursor-pointer">
                              {uploadingBanner === banner.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            </label>
                          </Button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                        <HelpCircle className="h-3 w-3" /> Recomendado: 1920x1080px (Alta resolução)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Título / Descrição</Label>
                      <Input 
                        value={banner.title || ""} 
                        onChange={(e) => {
                          const updated = [...banners];
                          updated[index].title = e.target.value;
                          setBanners(updated);
                        }} 
                        placeholder="Ex: Festival Gastronômico da Cidade"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-lg"
                        disabled={index === 0}
                        onClick={() => handleMove(index, "up")}
                      >
                        <ArrowUp className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-lg"
                        disabled={index === banners.length - 1}
                        onClick={() => handleMove(index, "down")}
                      >
                        <ArrowDown className="h-4 w-4 text-slate-600" />
                      </Button>
                    </div>

                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleRemoveBanner(index)}
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remover
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

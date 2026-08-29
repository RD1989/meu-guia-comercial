import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HelpCircle, Upload, Loader2 } from "lucide-react";

interface GeneralConfigTabProps {
  formData: any;
  onChange: (e: any) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingLogo: boolean;
}

export function GeneralConfigTab({ formData, onChange, onLogoUpload, uploadingLogo }: GeneralConfigTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle>Identidade do Sistema</CardTitle>
          <CardDescription>Nome e descrições principais para o SEO.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform_name">Nome da Plataforma</Label>
            <Input 
              id="platform_name" 
              value={formData.platform_name || ""} 
              onChange={onChange} 
              placeholder="Ex: Guia Local Pro" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform_description">Descrição (Slogan)</Label>
            <Textarea 
              id="platform_description" 
              value={formData.platform_description || ""} 
              onChange={onChange} 
              rows={3} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform_city">Cidade Padrão</Label>
              <Input 
                id="platform_city" 
                value={formData.platform_city || ""} 
                onChange={onChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform_state">Estado (UF)</Label>
              <Input 
                id="platform_state" 
                value={formData.platform_state || ""} 
                onChange={onChange} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle>Logotipo da Plataforma</CardTitle>
          <CardDescription>Upload de imagem transparente para o cabeçalho.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="platform_logo_url">URL do Logotipo</Label>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Input 
                  id="platform_logo_url" 
                  value={formData.platform_logo_url || ""} 
                  onChange={onChange} 
                  placeholder="https://..." 
                  className="flex-1"
                />
                <div className="relative">
                  <input 
                    type="file" 
                    id="logo-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={onLogoUpload}
                    disabled={uploadingLogo}
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    asChild
                    disabled={uploadingLogo}
                  >
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </label>
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <HelpCircle className="h-4 w-4 text-primary mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Guia de Tamanho (Logo)</p>
                  <p className="text-xs text-slate-500">O tamanho ideal é 512x512px (1:1) ou formato horizontal. Use fundos transparentes (PNG ou SVG).</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-36 w-full border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden relative group">
            {formData.platform_logo_url ? (
              <img src={formData.platform_logo_url} alt="Preview Logo" className="max-h-28 object-contain" />
            ) : (
              <div className="text-center">
                <HelpCircle className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400 mt-2">Preview da Logo</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SocialLinksTabProps {
  formData: any;
  onChange: (e: any) => void;
}

export function SocialLinksTab({ formData, onChange }: SocialLinksTabProps) {
  return (
    <Card className="border-none shadow-sm bg-white max-w-2xl">
      <CardHeader>
        <CardTitle>Contatos e Redes Sociais</CardTitle>
        <CardDescription>Links institucionais que aparecerão no rodapé e páginas de contato.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="platform_whatsapp">WhatsApp Institucional (com DDD)</Label>
          <Input 
            id="platform_whatsapp" 
            value={formData.platform_whatsapp || ""} 
            onChange={onChange} 
            placeholder="11999998888"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform_email">E-mail de Suporte</Label>
          <Input 
            id="platform_email" 
            value={formData.platform_email || ""} 
            onChange={onChange} 
            placeholder="contato@meuguia.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform_instagram">Instagram (URL ou @)</Label>
          <Input 
            id="platform_instagram" 
            value={formData.platform_instagram || ""} 
            onChange={onChange} 
            placeholder="https://instagram.com/meuguia"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform_facebook">Facebook (URL)</Label>
          <Input 
            id="platform_facebook" 
            value={formData.platform_facebook || ""} 
            onChange={onChange} 
            placeholder="https://facebook.com/meuguia"
          />
        </div>
        <div className="col-span-full space-y-2">
          <Label htmlFor="platform_footer_text">Texto de Direitos Autorais do Rodapé</Label>
          <Input 
            id="platform_footer_text" 
            value={formData.platform_footer_text || ""} 
            onChange={onChange} 
          />
        </div>
      </CardContent>
    </Card>
  );
}

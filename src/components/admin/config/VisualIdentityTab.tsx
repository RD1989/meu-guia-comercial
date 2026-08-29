import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VisualIdentityTabProps {
  formData: any;
  onChange: (e: any) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export function VisualIdentityTab({ formData, onChange, setFormData }: VisualIdentityTabProps) {
  return (
    <Card className="border-none shadow-sm bg-white max-w-xl">
      <CardHeader>
        <CardTitle>Cores do Sistema</CardTitle>
        <CardDescription>Define a cor primária que será usada em botões, links e destaques no portal.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div 
            className="h-20 w-20 rounded-2xl shadow-inner border border-slate-200"
            style={{ backgroundColor: formData.platform_primary_color || "#2563eb" }}
          />
          <div className="flex-1 space-y-2">
            <Label htmlFor="platform_primary_color">Cor Primária (HEX)</Label>
            <div className="flex gap-2">
              <Input 
                id="platform_primary_color" 
                value={formData.platform_primary_color || "#2563eb"} 
                onChange={onChange}
                placeholder="#2563eb"
              />
              <input 
                type="color" 
                value={formData.platform_primary_color || "#2563eb"} 
                onChange={(e) => setFormData((prev: any) => ({ ...prev, platform_primary_color: e.target.value }))}
                className="h-10 w-12 rounded border cursor-pointer p-0"
              />
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 border border-slate-100 italic">
          * A alteração da cor será aplicada globalmente no portal público e nos botões imediatamente após salvar.
        </div>
      </CardContent>
    </Card>
  );
}

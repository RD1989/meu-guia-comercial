import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CitiesManagerTabProps {
  formData: any;
  onChange: (e: any) => void;
}

export function CitiesManagerTab({ formData, onChange }: CitiesManagerTabProps) {
  const citiesList = (formData.platform_cities || "")
    .split(",")
    .map((c: string) => c.trim())
    .filter(Boolean);

  return (
    <Card className="border-none shadow-sm bg-white max-w-2xl">
      <CardHeader>
        <CardTitle>Cidades Atendidas (Multi-Cidades)</CardTitle>
        <CardDescription>
          Gerencie as cidades que estarão disponíveis para os visitantes escolherem no topo da plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="platform_cities">Lista de Cidades (Separadas por vírgula)</Label>
          <Textarea 
            id="platform_cities" 
            value={formData.platform_cities || ""} 
            onChange={onChange} 
            placeholder="Ex: São Paulo, Campinas, Santos, Sorocaba, Ribeirão Preto"
            rows={4}
            className="font-medium"
          />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
            💡 Digite os nomes das cidades exatamente como deseja que apareçam no seletor do cabeçalho.
          </p>
        </div>
        
        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3">
            Cidades Cadastradas ({citiesList.length}):
          </h4>
          <div className="flex flex-wrap gap-2">
            {citiesList.length === 0 ? (
              <span className="text-xs text-slate-400">Nenhuma cidade digitada ainda.</span>
            ) : (
              citiesList.map((city: string, i: number) => (
                <div 
                  key={i} 
                  className="px-3.5 py-1 bg-white border border-primary/20 rounded-full text-xs font-bold text-primary shadow-sm"
                >
                  📍 {city}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

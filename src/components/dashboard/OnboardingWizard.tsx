import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, MapPin, Image, Clock, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { cleanPhoneNumber } from "@/lib/whatsapp";

interface OnboardingWizardProps {
  onCompleted?: () => void;
}

export function OnboardingWizard({ onCompleted }: OnboardingWizardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  
  // Location
  const [city, setCity] = useState("São Paulo");
  const [state, setState] = useState("SP");
  const [address, setAddress] = useState("");

  // Media
  const [imageUrl, setImageUrl] = useState("");

  // Categories Query
  const { data: categories = [] } = useQuery({
    queryKey: ["categories-onboarding"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data || [];
    }
  });

  const createBusinessMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");
      if (!name.trim()) throw new Error("Nome da empresa é obrigatório");

      const baseSlug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      const slug = `${baseSlug}-${randomSuffix}`;

      // Default opening hours
      const defaultHours = {
        mon: { open: "08:00", close: "18:00", closed: false },
        tue: { open: "08:00", close: "18:00", closed: false },
        wed: { open: "08:00", close: "18:00", closed: false },
        thu: { open: "08:00", close: "18:00", closed: false },
        fri: { open: "08:00", close: "18:00", closed: false },
        sat: { open: "08:00", close: "14:00", closed: false },
        sun: { open: "08:00", close: "12:00", closed: true },
      };

      const cleanedWhatsapp = cleanPhoneNumber(whatsapp || phone);

      const payload: any = {
        owner_id: user.id,
        name: name.trim(),
        slug,
        category_id: categoryId || null,
        phone: phone.trim(),
        whatsapp: cleanedWhatsapp,
        description: description.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        address: address.trim(),
        image_url: imageUrl || null,
        active: true,
        business_hours: defaultHours,
        profile_views: 0,
        whatsapp_clicks: 0
      };

      const { data, error } = await (supabase as any)
        .from("businesses")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Empresa cadastrada com sucesso! Bem-vindo ao seu painel.");
      queryClient.invalidateQueries({ queryKey: ["my-business"] });
      if (onCompleted) onCompleted();
    },
    onError: (err: any) => {
      toast.error("Erro ao criar empresa: " + err.message);
    }
  });

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        toast.error("Informe o nome da sua empresa");
        return;
      }
      if (!whatsapp.trim() && !phone.trim()) {
        toast.error("Informe pelo menos um telefone ou WhatsApp");
        return;
      }
    }
    if (step === 2) {
      if (!address.trim()) {
        toast.error("Informe o endereço do estabelecimento");
        return;
      }
    }
    setStep(s => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setStep(s => Math.max(s - 1, 1));
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card className="rounded-[2.5rem] border border-slate-200 shadow-2xl bg-white overflow-hidden p-8 md:p-12">
        {/* Wizard Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Configuração Inicial do Lojista
          </div>
          <h2 className="text-3xl font-[900] text-slate-900 tracking-tight">Cadastre sua Empresa</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">Leva menos de 2 minutos para colocar sua vitrine no ar.</p>

          {/* Stepper Progress */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === i 
                    ? "w-10 bg-primary" 
                    : step > i 
                    ? "w-6 bg-emerald-500" 
                    : "w-6 bg-slate-100"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Informações Básicas */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
              <Store className="h-4 w-4" /> 1. Dados do Estabelecimento
            </div>

            <div>
              <Label className="text-xs font-bold uppercase text-slate-700">Nome da Empresa *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Padaria Estrela da Manhã"
                className="mt-1 h-12 rounded-xl text-sm font-bold"
              />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase text-slate-700">Segmento / Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-1 h-12 rounded-xl text-sm font-medium">
                  <SelectValue placeholder="Selecione a categoria principal" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold uppercase text-slate-700">WhatsApp para Pedidos *</Label>
                <Input 
                  value={whatsapp} 
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 99999-8888"
                  className="mt-1 h-12 rounded-xl text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase text-slate-700">Telefone Fixo / Comercial</Label>
                <Input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 3333-4444"
                  className="mt-1 h-12 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase text-slate-700">Descrição Curta (Apresentação)</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Conte brevemente o que sua empresa oferece aos clientes da cidade..."
                className="mt-1 text-xs"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 2: Localização */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
              <MapPin className="h-4 w-4" /> 2. Onde seu negócio fica?
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label className="text-xs font-bold uppercase text-slate-700">Cidade *</Label>
                <Input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Sua Cidade"
                  className="mt-1 h-12 rounded-xl text-sm font-bold"
                />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase text-slate-700">Estado (UF)</Label>
                <Input 
                  value={state} 
                  onChange={(e) => setState(e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                  className="mt-1 h-12 rounded-xl text-sm font-bold uppercase text-center"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase text-slate-700">Endereço Completo (Rua, Número, Bairro) *</Label>
              <Input 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Av. Central, 1250 - Centro"
                className="mt-1 h-12 rounded-xl text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 3: Imagem de Capa */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
              <Image className="h-4 w-4" /> 3. Foto de Capa / Fachada
            </div>
            <p className="text-xs text-slate-500">
              Uma boa foto da fachada ou logotipo aumenta em até 3x os cliques no seu perfil.
            </p>

            <ImageUpload 
              value={imageUrl} 
              onChange={(url) => setImageUrl(url)}
              bucket="business-images"
            />
          </div>
        )}

        {/* Step 4: Conclusão */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-in fade-in duration-300 py-4">
            <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">{name}</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{city}, {state}</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">{description || "Tudo pronto para publicar seu comércio no guia local."}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs space-y-1">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Status Inicial:</span>
                <span className="text-emerald-600">Online & Ativo</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>WhatsApp:</span>
                <span>{whatsapp || phone}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Endereço:</span>
                <span className="truncate max-w-[200px]">{address}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
          {step > 1 ? (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBack} 
              className="rounded-xl h-12 px-6 font-bold text-xs gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          ) : <div />}

          {step < 4 ? (
            <Button 
              type="button" 
              onClick={handleNext} 
              className="rounded-xl h-12 px-8 font-black uppercase text-xs tracking-wider gap-2 bg-primary hover:bg-primary/90 text-white"
            >
              Avançar <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={() => createBusinessMutation.mutate()}
              disabled={createBusinessMutation.isPending}
              className="rounded-xl h-12 px-8 font-black uppercase text-xs tracking-wider gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20"
            >
              {createBusinessMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Finalizar e Abrir Painel
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

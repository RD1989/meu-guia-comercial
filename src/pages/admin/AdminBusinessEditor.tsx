import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, Store, Loader2 } from "lucide-react";

export default function AdminBusinessEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!slug;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category_id: "",
    plan_tier: "FREE",
    active: true,
    image_url: ""
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data;
    }
  });

  const { data: business, isLoading: loadingBusiness } = useQuery({
    queryKey: ["admin-business", slug],
    queryFn: async () => {
      if (!isEditing) return null;
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing
  });

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || "",
        slug: business.slug || "",
        description: business.description || "",
        category_id: business.category_id || "",
        plan_tier: business.plan_tier || "FREE",
        active: business.active ?? true,
        image_url: business.image_url || ""
      });
    }
  }, [business]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEditing) {
        const { error } = await supabase
          .from("businesses")
          .update(payload)
          .eq("id", business.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("businesses")
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      toast.success(isEditing ? "Empresa atualizada!" : "Empresa criada com sucesso!");
      navigate("/admin/empresas");
    },
    onError: (error: any) => {
      toast.error("Erro ao salvar: " + error.message);
    }
  });

  if (isEditing && loadingBusiness) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/admin/empresas")}
          className="hover:bg-slate-100 -ml-2 text-slate-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {isEditing ? `Editar: ${business.name}` : "Cadastrar Nova Empresa"}
            </h1>
            <p className="text-slate-500">Configure as informações básicas do estabelecimento.</p>
          </div>
          <Button 
            onClick={() => saveMutation.mutate(formData)}
            disabled={saveMutation.isPending}
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Alterações
          </Button>
        </div>

        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Store className="h-4 w-4" /> Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Empresa</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Pastelaria do João" 
                  className="bg-slate-50 border-none focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL amigável)</Label>
                <Input 
                  id="slug" 
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  placeholder="ex-pastelaria-do-joao" 
                  className="bg-slate-50 border-none focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição / Resumo</Label>
              <Textarea 
                id="description" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Conte um pouco sobre a empresa..." 
                className="bg-slate-50 border-none focus-visible:ring-primary/20 h-32"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Categoria Principal</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(val) => setFormData({...formData, category_id: val})}
                >
                  <SelectTrigger className="bg-slate-50 border-none">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plano de Assinatura</Label>
                <Select 
                  value={formData.plan_tier} 
                  onValueChange={(val) => setFormData({...formData, plan_tier: val})}
                >
                  <SelectTrigger className="bg-slate-50 border-none">
                    <SelectValue placeholder="Escolha o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Gratuito</SelectItem>
                    <SelectItem value="PROFESSIONAL">Profissional</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise (SaaS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL da Imagem (Logo/Capa)</Label>
              <Input 
                id="image" 
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                placeholder="https://..." 
                className="bg-slate-50 border-none focus-visible:ring-primary/20"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

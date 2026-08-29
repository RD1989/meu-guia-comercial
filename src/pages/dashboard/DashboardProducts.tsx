import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Package, Loader2 } from "lucide-react";
import { useProducts, type Product } from "@/hooks/use-products";
import { useBusiness } from "@/hooks/use-business";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const DashboardProducts = () => {
  const { business, isLoading: bizLoading } = useBusiness();
  const { products, isLoading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { limits } = usePlanLimits();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", image_url: "", category: "" });

  const openNew = () => {
    if (products.length >= limits.maxProducts) {
      toast.error(`Limite do catálogo atingido! Seu plano (${limits.tier}) permite até ${limits.maxProducts} produtos.`);
      return;
    }
    setEditingProduct(null);
    setForm({ name: "", description: "", price: "", image_url: "", category: "" });
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price?.toString() || "",
      image_url: product.image_url || "",
      category: (product as any).category || "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price) return;

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      image_url: form.image_url || null,
      category: form.category || null,
    };

    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, ...payload },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      addProduct.mutate(payload as any, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const toggleActive = (product: Product) => {
    updateProduct.mutate({ id: product.id, active: !product.active });
  };

  const handleDelete = (id: string) => {
    deleteProduct.mutate(id);
  };

  if (bizLoading || isLoading) {
    return (
      <DashboardLayout title="Produtos">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!business) {
    return (
      <DashboardLayout title="Produtos">
        <Card className="p-12 text-center">
          <p className="text-sm text-muted-foreground">Nenhum negócio vinculado à sua conta.</p>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Produtos">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{products.length} de {limits.maxProducts} produtos permitidos no Plano {limits.tier}</p>
          <Button 
            onClick={openNew} 
            className={`h-10 rounded-xl gap-2 ${products.length >= limits.maxProducts ? 'opacity-50 grayscale' : ''}`}
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        {products.length >= limits.maxProducts && (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between gap-4">
             <div className="space-y-1">
               <p className="text-xs font-black text-amber-900 uppercase tracking-widest leading-none">Limite do Plano Atingido</p>
               <p className="text-[10px] text-amber-700 font-medium">Você já cadastrou {products.length} produtos. Faça upgrade para o plano Pro para cadastrar até 50.</p>
             </div>
             <Link to="/planos">
               <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-black text-[9px] uppercase tracking-widest rounded-full h-8 px-4">Upgrade Já</Button>
             </Link>
          </div>
        )}

        {products.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 rounded-[2rem] bg-slate-50/50">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-base font-bold text-slate-400 capitalize">Nenhum produto em seu catálogo</p>
            <p className="text-xs text-slate-400 mt-1 mb-6">Comece adicionando seus itens para aparecerem no cardápio digital.</p>
            <Button onClick={openNew} className="rounded-2xl h-12 gap-2 shadow-lg shadow-primary/10 px-8 font-black uppercase text-[10px] tracking-widest">
              <Plus className="h-4 w-4" />
              Adicionar Primeiro Produto
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card 
                key={product.id} 
                className={`group border-0 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 ${!product.active ? "opacity-60 grayscale-[0.5]" : ""}`}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-slate-200" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                       <Badge
                        variant={product.active ? "default" : "secondary"}
                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border-0 cursor-pointer shadow-lg backdrop-blur-md ${product.active ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/90 text-white'}`}
                        onClick={(e) => { e.stopPropagation(); toggleActive(product); }}
                      >
                        {product.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-black text-slate-900 truncate tracking-tight">{product.name}</h3>
                        <p className="text-sm font-black text-primary whitespace-nowrap">R$ {(product.price ?? 0).toFixed(2)}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-1 h-4">{product.description || "Sem descrição..."}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex flex-wrap gap-1.5 min-h-[22px]">
                        {(product as any).category && (
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-100 bg-slate-50 text-slate-500 px-2 leading-none">{ (product as any).category }</Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => openEdit(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-xs">Imagem do Produto</Label>
                <ImageUpload
                  bucket="product-images"
                  currentUrl={form.image_url || null}
                  onUpload={(url) => setForm((f) => ({ ...f, image_url: url }))}
                  onRemove={() => setForm((f) => ({ ...f, image_url: "" }))}
                  aspectRatio="square"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="prod-name" className="text-xs">Nome</Label>
                <Input id="prod-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1.5 h-11 rounded-xl" placeholder="Nome do produto" />
              </div>
              <div>
                <Label htmlFor="prod-desc" className="text-xs">Descrição</Label>
                <Input id="prod-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="mt-1.5 h-11 rounded-xl" placeholder="Breve descrição" />
              </div>
              <div>
                <Label htmlFor="prod-price" className="text-xs">Preço (R$)</Label>
                <Input id="prod-price" type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="mt-1.5 h-11 rounded-xl" placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="prod-category" className="text-xs">Categoria do Cardápio (Ex: Pizzas, Bebidas)</Label>
                <Input id="prod-category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="mt-1.5 h-11 rounded-xl" placeholder="Ex: Entradas" />
              </div>
              <Button onClick={handleSave} disabled={addProduct.isPending || updateProduct.isPending} className="w-full h-11 rounded-xl font-semibold">
                {(addProduct.isPending || updateProduct.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingProduct ? "Salvar Alterações" : "Adicionar Produto"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DashboardProducts;

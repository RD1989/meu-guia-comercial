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

const DashboardProducts = () => {
  const { business, isLoading: bizLoading } = useBusiness();
  const { products, isLoading, addProduct, updateProduct, deleteProduct } = useProducts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", image_url: "", category: "" });

  const openNew = () => {
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
          <p className="text-sm text-muted-foreground">{products.length} produtos cadastrados</p>
          <Button onClick={openNew} className="h-10 rounded-xl gap-2">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        {products.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum produto cadastrado</p>
            <Button onClick={openNew} variant="outline" className="mt-4 rounded-xl gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Primeiro Produto
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {products.map((product) => (
              <Card key={product.id} className={!product.active ? "opacity-60" : ""}>
                <CardContent className="p-0">
                  {product.image_url && (
                    <div className="aspect-[16/10] overflow-hidden rounded-t-lg">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-foreground truncate">{product.name}</h3>
                          <Badge
                            variant={product.active ? "default" : "secondary"}
                            className="text-[10px] cursor-pointer"
                            onClick={() => toggleActive(product)}
                          >
                            {product.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <p className="text-sm font-bold text-primary">
                            R$ {(product.price ?? 0).toFixed(2)}
                          </p>
                          {(product as any).category && (
                            <Badge variant="outline" className="text-[9px] uppercase tracking-tighter ml-auto">{ (product as any).category }</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
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

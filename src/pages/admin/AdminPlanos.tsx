import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Sparkles, Building2, Megaphone } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    name: "Grátis",
    price: "R$ 0",
    description: "Para pequenos negócios locais",
    features: ["Perfil Básico", "1 Categoria", "Horário de Funcionamento"],
    icon: Building2,
    color: "slate"
  },
  {
    name: "Profissional",
    price: "R$ 49,90",
    description: "Destaque sua empresa",
    features: ["Até 3 Categorias", "Galeria de Fotos", "Links Redes Sociais", "Selo de Verificado", "Prioridade na Busca"],
    icon: Sparkles,
    color: "blue",
    featured: true
  },
  {
    name: "Enterprise",
    price: "R$ 99,90",
    description: "Domine sua região",
    features: ["Categorias Ilimitadas", "Gestão de Produtos", "Suporte VIP", "Anúncios em Banners", "Relatórios de Vendas"],
    icon: Megaphone,
    color: "indigo"
  }
];

export default function AdminPlanos() {
  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Planos e Assinaturas</h1>
          <p className="text-slate-500">Gerencie os pacotes e preços oferecidos aos lojistas.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={`border-slate-100 shadow-sm ${plan.featured ? 'ring-2 ring-primary border-transparent' : ''}`}>
              <CardHeader>
                <div className={`h-12 w-12 rounded-xl bg-${plan.color}-50 text-${plan.color}-600 flex items-center justify-center mb-4`}>
                  <plan.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 ml-1">/mês</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${plan.featured ? 'bg-primary' : 'bg-slate-800'}`}
                  onClick={() => toast.success(`Módulo de edição do plano ${plan.name} ativado!`)}
                >
                  Editar Plano
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

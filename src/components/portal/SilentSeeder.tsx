import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * SilentSeeder - Garante que o banco de dados tenha dados de demonstração 
 * se as tabelas estiverem vazias. Atua de forma silenciosa e eficiente.
 */
export const SilentSeeder = () => {
  useEffect(() => {
    const runSeeding = async () => {
      // 1. Verificar Categorias
      const { data: cats } = await supabase.from("categories").select("id").limit(1);
      if (!cats || cats.length === 0) {
        console.log("🌱 Populando Categorias...");
        await supabase.from("categories").insert([
          { name: "Restaurantes", slug: "restaurantes", icon: "Utensils", color: "rose" },
          { name: "Tecnologia", slug: "tecnologia", icon: "Laptop", color: "blue" },
          { name: "Saúde", slug: "saude", icon: "HeartPulse", color: "emerald" },
          { name: "Serviços", slug: "servicos", icon: "Briefcase", color: "slate" },
          { name: "Educação", slug: "educacao", icon: "GraduationCap", color: "indigo" },
          { name: "Beleza", slug: "beleza", icon: "Scissors", color: "pink" },
        ]);
      }

      // 2. Verificar Empresas (Businesses)
      const { data: biz } = await supabase.from("businesses").select("id").limit(1);
      if (!biz || biz.length === 0) {
        console.log("🌱 Populando Empresas de Exemplo...");
        // Pegar uma categoria para associar
        const { data: firstCat } = await supabase.from("categories").select("id").limit(1).single();
        if (firstCat) {
          await supabase.from("businesses").insert([
            {
              name: "Elite Burguer & Grill",
              slug: "elite-burguer",
              description: "O melhor hambúrguer artesanal da região com ingredientes selecionados.",
              category_id: firstCat.id,
              address: "Av. Central, 500 - Centro",
              city: "Rio de Janeiro",
              phone: "(21) 99999-9999",
              active: true,
              performance_score: 95,
              rating_average: 4.9,
              image_url: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&auto=format&fit=crop&q=60"
            },
            {
              name: "Spa Relax Total",
              slug: "spa-relax",
              description: "Massagens relaxantes e terapias holísticas para o seu bem-estar.",
              category_id: firstCat.id, // Em um seed real buscaríamos a categoria Beleza
              address: "Rua das Flores, 120",
              city: "Rio de Janeiro",
              phone: "(21) 88888-8888",
              active: true,
              performance_score: 88,
              rating_average: 4.7,
              image_url: "https://images.unsplash.com/photo-1544161515-4ae6b91829d2?w=800&auto=format&fit=crop&q=60"
            }
          ]);
        }
      }

      // 3. Verificar Cupons
      const { data: coupons } = await supabase.from("coupons").select("id").limit(1);
      if (!coupons || coupons.length === 0) {
        const { data: firstBiz } = await supabase.from("businesses").select("id").limit(1).single();
        if (firstBiz) {
          console.log("🌱 Populando Cupons...");
          await supabase.from("coupons").insert([
            {
              business_id: firstBiz.id,
              title: "50% OFF no Segundo Combo",
              description: "Válido para qualquer hambúrguer do cardápio nas terças e quartas.",
              discount_type: "percent",
              discount_value: 50,
              code: "ELITE50",
              active: true,
              valid_until: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
            },
            {
              business_id: firstBiz.id,
              title: "Batata Grátis",
              description: "Ganhe uma batata média na compra de qualquer sanduíche individual.",
              discount_type: "freebie",
              discount_value: 0,
              code: "FREPOTATO",
              active: true,
              valid_until: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString()
            }
          ]);
        }
      }

      // 4. Verificar Eventos
      const { data: events } = await supabase.from("local_events").select("id").limit(1);
      if (!events || events.length === 0) {
        const { data: firstBiz } = await supabase.from("businesses").select("id").limit(1).single();
        if (firstBiz) {
          console.log("🌱 Populando Eventos...");
          await supabase.from("local_events").insert([
            {
              business_id: firstBiz.id,
              title: "Noite do Jazz & Blues",
              description: "Uma noite inesquecível com os melhores músicos da cena local.",
              event_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
              location: "Elite Burguer - Lounge Superior",
              is_free: true,
              active: true,
              cover_image_url: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop&q=60"
            }
          ]);
        }
      }

      // 5. Verificar Posts da Comunidade
      const { data: posts } = await supabase.from("community_posts").select("id").limit(1);
      if (!posts || posts.length === 0) {
        console.log("🌱 Populando Posts da Comunidade...");
        const { data: firstBiz } = await supabase.from("businesses").select("id").limit(1).single();
        await supabase.from("community_posts").insert([
          {
            content: "Pessoal, acabei de sair do Elite Burguer e o atendimento está impecável hoje! Alguém mais por aqui? 🍔🔥",
            city: "Rio de Janeiro",
            likes_count: 12,
            comments_count: 3,
            is_verified: true,
            business_id: firstBiz?.id
          },
          {
            content: "Dica de ouro: A nova feira de orgânicos na Praça Central começa sábado às 08h. Não percam! 🍎🥦",
            city: "Rio de Janeiro",
            likes_count: 45,
            comments_count: 8,
            is_verified: false
          }
        ]);
      }
    };

    runSeeding();
  }, []);

  return null; // Componente invisível
};

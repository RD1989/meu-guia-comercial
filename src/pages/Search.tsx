import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { SearchBar } from "@/components/portal/SearchBar";
import { BusinessCard } from "@/components/portal/BusinessCard";
import { Loader2 } from "lucide-react";
import { useLocation } from "@/hooks/use-location";
import { getDistance } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Target, MapPin } from "lucide-react";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("categoria") || "";
  const queryText = searchParams.get("q") || "";
  const [radius, setRadius] = useState(10); // Default 10km
  const userLoc = useLocation();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["search-businesses", selectedCategory, queryText],
    queryFn: async () => {
      let q = supabase
        .from("businesses")
        .select("*, categories(name, slug), reviews(count)")
        .eq("active", true)
        .order("performance_score", { ascending: false });

      if (selectedCategory) {
        // Filter by category slug via join
        const cat = categories.find((c) => c.slug === selectedCategory);
        if (cat) q = q.eq("category_id", cat.id);
      }

      if (queryText) {
        q = q.or(`name.ilike.%${queryText}%,description.ilike.%${queryText}%`);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: true,
  });

  const handleCategoryClick = (slug: string) => {
    if (selectedCategory === slug) {
      searchParams.delete("categoria");
    } else {
      searchParams.set("categoria", slug);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <SearchBar />

        {/* Categories filter */}
        <div className="mt-6 space-y-4">
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`px-4 py-2 rounded-full border text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat.slug
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {!userLoc.loading && userLoc.lat && (
            <div className="bg-white/50 backdrop-blur-sm border border-slate-100 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtro Raio X</span>
                </div>
                <span className="text-sm font-black text-slate-900">{radius}km</span>
              </div>
              <Slider
                defaultValue={[radius]}
                max={50}
                min={1}
                step={1}
                onValueChange={(val) => setRadius(val[0])}
                className="py-4"
              />
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center mt-2">
                Mostrando apenas estabelecimentos em um raio de {radius}km de você
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {businesses.length} estabelecimento{businesses.length !== 1 ? "s" : ""} encontrado{businesses.length !== 1 ? "s" : ""}
              </p>
              {businesses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum resultado encontrado. Tente outra busca.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {businesses
                    .map((biz) => {
                      let distance;
                      if (!userLoc.loading && userLoc.lat && (biz as any).latitude) {
                        distance = getDistance(
                          userLoc.lat,
                          userLoc.lng,
                          (biz as any).latitude,
                          (biz as any).longitude
                        );
                      }
                      return { ...biz, distance };
                    })
                    .filter((biz) => {
                      // Apply radius filter if distance is available
                      if (biz.distance !== undefined) {
                        return biz.distance <= radius;
                      }
                      return true; // Keep if no location data (optional)
                    })
                    .sort((a, b) => {
                      // Se tem distância, prioriza os mais próximos
                      if (a.distance !== undefined && b.distance !== undefined) {
                        return a.distance - b.distance;
                      }
                      return 0; // Mantém a ordem original do score se não houver distância
                    })
                    .map((biz) => (
                      <BusinessCard
                        key={biz.id}
                        id={biz.id}
                        name={biz.name}
                        description={biz.description || undefined}
                        address={biz.address || undefined}
                        imageUrl={biz.image_url || undefined}
                        categoryName={(biz.categories as any)?.name || undefined}
                        slug={biz.slug}
                        performanceScore={(biz as any).performance_score}
                        ratingAverage={(biz as any).rating_average}
                        reviewCount={(biz as any).reviews?.[0]?.count || 0}
                        distance={biz.distance}
                      />
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
};

export default Search;

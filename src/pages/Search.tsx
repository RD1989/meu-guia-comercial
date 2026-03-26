import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { SearchBar } from "@/components/portal/SearchBar";
import { BusinessCard } from "@/components/portal/BusinessCard";
import { Loader2, LayoutList, Map, Target } from "lucide-react";
import { useLocation } from "@/hooks/use-location";
import { getDistance } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";

// Corrigir ícone do Leaflet com webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const orangeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("categoria") || "";
  const queryText = searchParams.get("q") || "";
  const [radius, setRadius] = useState(10);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const userLoc = useLocation();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
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
        .order("performance_score", { ascending: false })
        .limit(100);

      if (selectedCategory) {
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

  const processedBusinesses = businesses
    .map((biz) => {
      let distance: number | undefined;
      if (!userLoc.loading && userLoc.lat && (biz as any).latitude) {
        distance = getDistance(userLoc.lat, userLoc.lng, (biz as any).latitude, (biz as any).longitude);
      }
      return { ...biz, distance };
    })
    .filter((biz) => {
      if (biz.distance !== undefined) return biz.distance <= radius;
      return true;
    })
    .sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) return a.distance - b.distance;
      return 0;
    });

  // Centro do mapa: posição do usuário ou primeiro negócio com coords
  const mapCenter: [number, number] = userLoc.lat
    ? [userLoc.lat, userLoc.lng]
    : processedBusinesses.find((b) => (b as any).latitude)
    ? [(processedBusinesses.find((b) => (b as any).latitude) as any).latitude, (processedBusinesses.find((b) => (b as any).latitude) as any).longitude]
    : [-14.235, -51.925]; // centro do Brasil como fallback

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

        {/* Toggle Lista / Mapa */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {processedBusinesses.length} estabelecimento{processedBusinesses.length !== 1 ? "s" : ""} encontrado{processedBusinesses.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <LayoutList className="h-3.5 w-3.5" /> Lista
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                viewMode === "map" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <Map className="h-3.5 w-3.5" /> Mapa
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : viewMode === "map" ? (
            /* ──── MODO MAPA ──── */
            <div className="rounded-[2rem] overflow-hidden border border-slate-100 shadow-lg" style={{ height: "70vh" }}>
              <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {processedBusinesses
                  .filter((b) => (b as any).latitude && (b as any).longitude)
                  .map((biz) => (
                    <Marker
                      key={biz.id}
                      position={[(biz as any).latitude, (biz as any).longitude]}
                      icon={orangeIcon}
                    >
                      <Popup>
                        <div className="min-w-[180px]">
                          {biz.image_url && (
                            <img src={biz.image_url} alt={biz.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                          )}
                          <p className="font-black text-slate-900 text-sm">{biz.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{(biz as any).address || ""}</p>
                          <Link
                            to={`/negocio/${biz.slug}`}
                            className="mt-2 inline-block w-full text-center bg-primary text-white text-xs font-black py-1.5 rounded-lg"
                          >
                            Ver Perfil
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>
          ) : (
            /* ──── MODO LISTA ──── */
            processedBusinesses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum resultado encontrado. Tente outra busca.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {processedBusinesses.map((biz) => (
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
            )
          )}
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
};

export default Search;

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const News = () => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-foreground mb-6">Notícias da Cidade</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma notícia publicada ainda.
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex gap-4 p-4">
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title} className="h-20 w-20 rounded-xl flex-shrink-0 object-cover" />
                  ) : (
                    <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0 flex items-center justify-center">
                      <span className="text-xl text-primary/30">📰</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(post.created_at), "d 'de' MMM", { locale: ptBR })}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
};

export default News;

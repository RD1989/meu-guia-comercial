import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-xl group">
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="O que você está procurando hoje?"
          className="pl-14 h-14 bg-white border-slate-100 rounded-3xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] text-sm font-bold focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all placeholder:text-slate-400 placeholder:font-medium"
        />
      </div>
    </form>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { useLocation } from "@/hooks/use-location";
import { MapPin } from "lucide-react";

interface Message {
  role: "user" | "bot";
  content: string;
}

export const LocalConciergeWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Olá! Sou o Concierge do seu Guia Comercial. Como posso te ajudar a encontrar algo na cidade hoje?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userLoc = useLocation();

  useEffect(() => {
    if (!userLoc.loading && userLoc.city) {
      setMessages([
        { 
          role: "bot", 
          content: `Olá! Notei que você está em **${userLoc.city}** (${userLoc.region}). Sou seu Concierge de Elite. Como posso te ajudar a explorar os melhores estabelecimentos da sua vizinhança agora?` 
        }
      ]);
    }
  }, [userLoc.loading, userLoc.city, userLoc.region]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("local-concierge", {
        body: { 
          query: userMsg,
          location: {
            lat: userLoc.lat,
            lng: userLoc.lng,
            city: userLoc.city,
            region: userLoc.region
          }
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: "bot", content: data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "bot", content: "Ops, tive um probleminha para processar sua pergunta. Pode tentar novamente?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] md:w-[400px] h-[550px] bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm">Concierge Local IA</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Online Agora</p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div ref={scrollRef} className="space-y-6 max-h-[400px]">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user" 
                      ? "bg-primary text-white font-medium" 
                      : "bg-slate-50 text-slate-700 border border-slate-100"
                    }`}>
                      <div className="prose prose-sm prose-slate dark:prose-invert">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      <p className="text-xs text-slate-400 font-bold">IA pensando...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-6 border-t border-slate-50 bg-slate-50/50">
              <div className="relative group">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Pergunte sobre a cidade..."
                  className="pr-12 h-12 bg-white border-none rounded-2xl shadow-sm focus-visible:ring-primary group-hover:shadow-md transition-all"
                />
                <Button 
                  size="icon" 
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="absolute right-1.5 top-1.5 h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 text-white transition-all active:scale-90 shadow-lg shadow-primary/20"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[9px] text-center text-slate-400 mt-4 font-bold flex items-center justify-center gap-1 uppercase tracking-tighter">
                <Sparkles className="h-3 w-3 text-primary" /> Powered by AI local expert
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 w-16 bg-slate-900 text-white rounded-[24px] shadow-2xl flex items-center justify-center hover:bg-primary transition-colors group relative"
      >
        {isOpen ? <X className="h-8 w-8 text-white" /> : <MessageSquare className="h-8 w-8 text-white group-hover:animate-bounce" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary border-2 border-white rounded-full animate-bounce shadow-lg" />
        )}
      </motion.button>
    </div>
  );
};

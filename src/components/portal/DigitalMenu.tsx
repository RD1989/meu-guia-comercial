import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart, Send, ChevronRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface DigitalMenuProps {
  products: any[];
  businessName: string;
  whatsapp: string;
}

export const DigitalMenu: React.FC<DigitalMenuProps> = ({ products, businessName, whatsapp }) => {
  const { items, addToCart, updateQuantity, total, clearCart } = useCart();
  const [showCart, setShowCart] = useState(false);

  const handleCheckout = () => {
    if (items.length === 0) return;

    const message = encodeURIComponent(
      `*🛒 NOVO PEDIDO - ${businessName}*\n\n` +
      items.map(i => `✅ ${i.quantity}x ${i.name} (R$ ${i.price.toFixed(2)})`).join("\n") +
      `\n\n*Total: R$ ${total.toFixed(2)}*\n\nVi seu anúncio no Guia Comercial.`
    );

    window.open(`https://wa.me/${whatsapp}?text=${message}`, "_blank");
  };

  const categories = Array.from(new Set(products.map(p => (p as any).category || "Geral")));

  return (
    <div className="space-y-8 mt-10 pb-32 relative">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full" />
          Cardápio Digital
        </h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Faça seu pedido agora</p>
      </div>

      {categories.map((cat, idx) => (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          key={cat} 
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
             <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary/80 whitespace-nowrap">
              {cat}
            </h3>
            <div className="h-[1px] w-full bg-gradient-to-r from-primary/20 to-transparent" />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {products.filter(p => (p as any).category === cat || (!p.category && cat === "Geral")).map(product => {
              const inCart = items.find(i => i.id === product.id);
              
              return (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  key={product.id}
                >
                  <Card className="overflow-hidden border-0 shadow-sm bg-white hover:shadow-xl transition-all duration-300 rounded-[2rem] p-4 flex gap-4 items-center group">
                    <div className="h-24 w-24 flex-shrink-0 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center relative">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <span className="text-2xl opacity-20 group-hover:scale-125 transition-transform">🍽️</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm md:text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{product.description || "Ingredientes selecionados para sua melhor experiência."}</p>
                      <div className="flex items-center gap-2 mt-3">
                         <span className="text-base font-black text-primary">R$ {(product.price || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 pr-2">
                      {inCart ? (
                        <div className="flex items-center gap-3 bg-primary/5 rounded-2xl p-1.5 border border-primary/10">
                          <button 
                            onClick={() => updateQuantity(product.id, -1)} 
                            className="h-8 w-8 flex items-center justify-center bg-white rounded-xl shadow-sm text-primary hover:bg-primary hover:text-white transition-all"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-black w-4 text-center">{inCart.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(product.id, 1)} 
                            className="h-8 w-8 flex items-center justify-center bg-primary rounded-xl shadow-md text-white hover:bg-primary/90 transition-all"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => addToCart({ id: product.id, name: product.name, price: product.price || 0 })} 
                          className="h-10 px-5 rounded-2xl gap-2 font-bold shadow-lg shadow-primary/10 group-hover:shadow-primary/20 transition-all"
                        >
                          <Plus className="h-4 w-4" /> Add
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Floating Cart Indicator */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-50 md:max-w-md md:mx-auto"
          >
            <div 
              onClick={() => setShowCart(true)}
              className="bg-primary/95 backdrop-blur-md text-white p-4 rounded-[2rem] shadow-2xl flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center relative">
                  <ShoppingCart className="h-6 w-6" />
                  <Badge className="absolute -top-2 -right-2 bg-white text-primary font-black border-2 border-primary h-6 min-w-6 rounded-full p-0 flex items-center justify-center text-[10px]">
                    {items.reduce((acc, i) => acc + i.quantity, 0)}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black opacity-70 tracking-tighter">Seu Pedido</p>
                  <p className="text-lg font-black tracking-tight">R$ {total.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-black text-sm uppercase tracking-widest pl-4">
                Ver Carrinho
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Summary Modal (Simplified for now, but Elite) */}
      <AnimatePresence>
        {showCart && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 max-h-[80vh] flex flex-col relative"
            >
              <button 
                onClick={() => setShowCart(false)}
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-black tracking-tight mb-1">Confira seu pedido 🛒</h3>
                <p className="text-xs text-muted-foreground">Revise os itens antes de enviar para o WhatsApp.</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl">
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{item.name}</p>
                      <p className="text-xs text-primary font-black">R$ {item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                      <button onClick={() => updateQuantity(item.id, -1)} className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"><Minus className="h-3 w-3" /></button>
                      <span className="text-xs font-black">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total do Pedido</p>
                  <p className="text-3xl font-black text-primary">R$ {total.toFixed(2)}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={clearCart} className="h-14 flex-1 rounded-2xl font-bold gap-2 text-destructive border-destructive/20 hover:bg-destructive/5 uppercase text-xs tracking-widest">Limpar</Button>
                  <Button onClick={handleCheckout} className="h-14 flex-[2] rounded-2xl font-black gap-2 shadow-xl shadow-primary/20 text-lg">
                    <Send className="h-5 w-5" /> PEDIR AGORA
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

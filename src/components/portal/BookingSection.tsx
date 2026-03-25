import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, CheckCircle2, Send, ChevronRight, Sparkles, MapPin, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { motion, AnimatePresence } from "framer-motion";

interface BookingSectionProps {
  services: any[];
  businessName: string;
  whatsapp: string;
}

export const BookingSection: React.FC<BookingSectionProps> = ({ services, businessName, whatsapp }) => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");

  const timeSlots = {
    Manhã: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
    Tarde: ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"]
  };

  const handleBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    const message = encodeURIComponent(
      `*📅 NOVO AGENDAMENTO - ${businessName}*\n\n` +
      `📌 *Serviço:* ${selectedService.name}\n` +
      `📆 *Data:* ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}\n` +
      `⏰ *Horário:* ${selectedTime}\n\n` +
      `*Solicitado via Guia Comercial* 🚀`
    );

    window.open(`https://wa.me/${whatsapp}?text=${message}`, "_blank");
  };

  return (
    <div className="space-y-8 mt-12 pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full" />
          Agendamento Online
        </h2>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Reserve seu horário em segundos</p>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-black uppercase text-muted-foreground/60 tracking-widest pl-1">1. Escolha o Serviço</p>
        <div className="grid grid-cols-1 gap-4">
          {services.map((service) => (
            <motion.div
              key={service.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedService(service);
                setSelectedTime(""); // Reset time when service changes
              }}
            >
              <Card 
                className={`p-5 cursor-pointer transition-all duration-300 rounded-[2rem] border-2 relative overflow-hidden group ${
                  selectedService?.id === service.id 
                  ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5' 
                  : 'border-transparent bg-white hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center relative z-10">
                  <div className="space-y-1">
                    <h4 className={`text-base font-black transition-colors ${selectedService?.id === service.id ? 'text-primary' : 'text-foreground'}`}>
                      {service.name}
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold flex items-center gap-1 text-muted-foreground uppercase tracking-tight">
                        <Clock className="h-3 w-3" /> {service.duration_minutes} min
                      </span>
                      <span className="text-[11px] font-black text-primary p-1 px-3 bg-primary/10 rounded-full">
                        R$ {service.price?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {selectedService?.id === service.id ? (
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <Plus className="h-5 w-5" />
                    </div>
                  )}
                </div>
                {selectedService?.id === service.id && (
                  <motion.div 
                    layoutId="serviceHighlight"
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-none"
                  />
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedService && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="space-y-8"
          >
            <div className="space-y-4">
               <p className="text-xs font-black uppercase text-muted-foreground/60 tracking-widest pl-1">2. Data & Horário</p>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 backdrop-blur-sm">
                  <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md"
                      locale={ptBR}
                    />
                  </div>

                  <div className="space-y-6">
                    {Object.entries(timeSlots).map(([period, slots]) => (
                      <div key={period} className="space-y-3">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">{period}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map(time => (
                            <Button
                              key={time}
                              variant="ghost"
                              onClick={() => setSelectedTime(time)}
                              className={`h-11 rounded-2xl text-[11px] font-black tracking-tight transition-all duration-300 ${
                                selectedTime === time 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                                : 'bg-white hover:bg-primary/10 hover:text-primary border border-slate-100'
                              }`}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Sparkles className="h-20 w-20 text-primary" />
               </div>
               
               <div className="flex items-start justify-between relative z-10 mb-6 font-bold">
                 <div>
                    <h5 className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Resumo da Reserva</h5>
                    <p className="text-xl font-black text-foreground">{selectedService.name}</p>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="text-xs flex items-center gap-1.5 text-primary">
                         <CalendarIcon className="h-3.5 w-3.5" /> 
                         {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : "-"}
                       </span>
                       <span className={`text-xs flex items-center gap-1.5 ${selectedTime ? 'text-primary' : 'text-slate-300'}`}>
                         <Clock className="h-3.5 w-3.5" /> 
                         {selectedTime || "Selecione a hora"}
                       </span>
                    </div>
                 </div>
                 <p className="text-2xl font-black text-primary">R$ {selectedService.price?.toFixed(2)}</p>
               </div>

               <Button 
                onClick={handleBooking} 
                disabled={!selectedTime} 
                className="w-full h-16 rounded-[1.5rem] gap-3 text-lg font-black shadow-2xl shadow-primary/30 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Send className="h-5 w-5" />
                SOLICITAR AGENDAMENTO
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

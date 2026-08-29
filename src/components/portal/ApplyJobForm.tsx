import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Send, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ApplyJobFormProps {
  jobId: string;
  jobTitle: string;
  onSuccess?: () => void;
}

export const ApplyJobForm = ({ jobId, jobTitle, onSuccess }: ApplyJobFormProps) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cover_letter: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("O arquivo deve ter no máximo 5MB.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !file) {
      toast.error("Por favor, preencha nome, e-mail e anexe seu currículo.");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload do Currículo para o Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("job_cvs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("job_cvs")
        .getPublicUrl(filePath);

      // 2. Salvar Candidatura no Banco
      const { error: dbError } = await (supabase as any).from("job_applications").insert([{
        job_id: jobId,
        candidate_name: form.name,
        candidate_email: form.email,
        candidate_phone: form.phone,
        cover_letter: form.cover_letter,
        resume_url: publicUrl
      }] as any);

      if (dbError) throw dbError;

      setSubmitted(true);
      toast.success("Candidatura enviada com sucesso!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao enviar candidatura: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-12 text-center space-y-4"
      >
        <div className="h-20 w-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-black text-slate-900">Tudo Pronto!</h3>
        <p className="text-slate-500">Sua candidatura para <strong>{jobTitle}</strong> foi enviada. Boa sorte!</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label className="text-xs font-bold uppercase text-slate-400">Seu Nome Completo</Label>
          <Input 
            required
            value={form.name}
            onChange={e => setForm(p => ({...p, name: e.target.value}))}
            placeholder="Ex: João Silva"
            className="bg-slate-50 border-none h-12 rounded-xl"
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-xs font-bold uppercase text-slate-400">E-mail de Contato</Label>
          <Input 
            required
            type="email"
            value={form.email}
            onChange={e => setForm(p => ({...p, email: e.target.value}))}
            placeholder="Ex: joao@email.com"
            className="bg-slate-50 border-none h-12 rounded-xl"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label className="text-xs font-bold uppercase text-slate-400">Telefone / WhatsApp</Label>
        <Input 
          value={form.phone}
          onChange={e => setForm(p => ({...p, phone: e.target.value}))}
          placeholder="Ex: (11) 99999-9999"
          className="bg-slate-50 border-none h-12 rounded-xl"
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-xs font-bold uppercase text-slate-400">Apresentação Curta (Cover Letter)</Label>
        <Textarea 
          value={form.cover_letter}
          onChange={e => setForm(p => ({...p, cover_letter: e.target.value}))}
          placeholder="Fale um pouco sobre sua experiência e por que deseja esta vaga..."
          className="bg-slate-50 border-none min-h-[120px] rounded-xl"
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-xs font-bold uppercase text-slate-400">Currículo (PDF ou Imagem - Max 5MB)</Label>
        <div className="relative">
          <input 
            type="file" 
            accept=".pdf,.doc,.docx,image/*"
            onChange={handleFileChange}
            className="hidden"
            id="cv-upload"
          />
          <label 
            htmlFor="cv-upload"
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-8 cursor-pointer transition-all hover:bg-slate-50 ${
              file ? "border-primary bg-primary/5" : "border-slate-200"
            }`}
          >
            {file ? (
              <>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <span className="text-sm font-bold text-primary">{file.name}</span>
                <span className="text-[10px] text-slate-400 uppercase mt-1">Clique para trocar</span>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-slate-300 mb-2" />
                <span className="text-sm font-bold text-slate-500">Clique para anexar seu currículo</span>
                <span className="text-[10px] text-slate-400 uppercase mt-1">PDF, Word ou Imagem</span>
              </>
            )}
          </label>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full h-14 bg-slate-900 hover:bg-primary text-white font-black text-lg rounded-3xl gap-2 shadow-xl shadow-slate-200 transition-all active:scale-95"
      >
        {loading ? (
          <><Loader2 className="h-6 w-6 animate-spin" /> Processando...</>
        ) : (
          <><Send className="h-6 w-6" /> Enviar Candidatura de Elite</>
        )}
      </Button>
    </form>
  );
};

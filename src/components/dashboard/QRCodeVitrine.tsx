import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, QrCode, Share2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { generateQRCodeSVG } from "@/lib/qrcode";

interface QRCodeVitrineProps {
  slug: string;
  businessName: string;
}

export function QRCodeVitrine({ slug, businessName }: QRCodeVitrineProps) {
  const [svgDataUrl, setSvgDataUrl] = useState<string>("");
  const businessUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/negocio/${slug}` 
    : `/negocio/${slug}`;

  useEffect(() => {
    if (slug) {
      const svg = generateQRCodeSVG(businessUrl, 320, 2);
      const encoded = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      setSvgDataUrl(encoded);
    }
  }, [slug, businessUrl]);

  const downloadQR = () => {
    // Renderiza o SVG em um canvas HTML5 e exporta PNG de altíssima definição (600x600)
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = svgDataUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fundo branco
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 600, 600);
      ctx.drawImage(img, 30, 30, 540, 540);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `qrcode-${slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR Code em alta definição baixado com sucesso!");
    };
  };

  const copyLink = () => {
    navigator.clipboard.writeText(businessUrl);
    toast.success("Link da vitrine copiado para a área de transferência!");
  };

  const printQR = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code — ${businessName}</title>
          <style>
            body { 
              display: flex; flex-direction: column; align-items: center; justify-content: center;
              min-height: 100vh; margin: 0; font-family: 'Arial', sans-serif; background: white; padding: 40px;
            }
            .container { text-align: center; border: 3px solid #0F172A; border-radius: 24px; padding: 40px 50px; max-width: 400px; }
            img { width: 280px; height: 280px; }
            h1 { font-size: 22px; font-weight: 900; color: #0F172A; margin: 20px 0 8px; letter-spacing: -0.5px; }
            p { font-size: 12px; color: #64748b; margin: 0; word-break: break-all; }
            .badge { display: inline-block; background: #2563eb; color: white; font-size: 10px; font-weight: 800; 
                     text-transform: uppercase; letter-spacing: 2px; padding: 6px 16px; border-radius: 100px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="badge">Escaneie e Visite a Vitrine</div>
            <img src="${svgDataUrl}" alt="QR Code" />
            <h1>${businessName}</h1>
            <p>${businessUrl}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden">
      <CardHeader className="pb-2 p-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-black text-slate-900 tracking-tight">QR Code da Vitrine</CardTitle>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Imprima e coloque no seu balcão</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-2">
        <div className="flex flex-col items-center gap-6">
          {/* QR Code Display */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-400/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-inner">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt={`QR Code para ${businessName}`}
                  className="w-44 h-44 object-contain"
                />
              ) : (
                <div className="w-44 h-44 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <QrCode className="h-12 w-12 text-slate-300 animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* URL */}
          <div className="w-full bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Link da sua vitrine</p>
            <p className="text-xs font-bold text-slate-700 break-all">{businessUrl}</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              onClick={downloadQR}
              className="h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/30"
            >
              <Download className="h-4 w-4" />
              Baixar PNG
            </Button>
            <Button
              onClick={printQR}
              variant="outline"
              className="h-12 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest gap-2 text-slate-700 hover:bg-slate-50"
            >
              <QrCode className="h-4 w-4" />
              Imprimir
            </Button>
            <Button
              onClick={copyLink}
              variant="outline"
              className="h-12 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest gap-2 text-slate-700 hover:bg-slate-50"
            >
              <Share2 className="h-4 w-4" />
              Copiar Link
            </Button>
            <Button
              onClick={() => window.open(businessUrl, "_blank")}
              variant="outline"
              className="h-12 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest gap-2 text-slate-700 hover:bg-slate-50"
            >
              <ExternalLink className="h-4 w-4" />
              Visualizar
            </Button>
          </div>

          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">
            Cole no balcão, cardápio físico ou janela da loja
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

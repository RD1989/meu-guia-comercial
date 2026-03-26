console.log("🚀 [BOOTSTRAP INITIALIZED] " + new Date().toISOString());
window.__SAP_START = Date.now();

import { createRoot } from "react-dom/client";
import "./index.css";

async function bootstrap() {
  console.log("📦 [DIAGNOSTICO] Bootstrap iniciado. Tentando carregar App.tsx...");
  
  try {
    const { default: App } = await import("./App.tsx");
    console.log("✅ [DIAGNOSTICO] App.tsx carregado com sucesso.");

    const container = document.getElementById("root");
    if (!container) {
      throw new Error("❌ [ERRO CRITICO] Elemento #root não encontrado no DOM!");
    }

    const root = createRoot(container);
    root.render(<App />);
    console.log("✨ [DIAGNOSTICO] Renderização do React disparada.");
  } catch (error) {
    console.error("🔥 [ERRO FATAL] Falha durante o carregamento ou renderização:", error);
    
    // Fallback UI no Body
    document.body.innerHTML = `
      <div style="padding: 24px; font-family: system-ui; background: #fff1f2; color: #be123c; border: 2px solid #fb7185; border-radius: 12px; margin: 20px;">
        <h1 style="margin: 0 0 16px 0; font-size: 20px;">Erro de Inicialização (V4)</h1>
        <p style="margin: 0 0 12px 0;">Ocorreu um erro crítico ao carregar o aplicativo:</p>
        <pre style="background: #000; color: #fff; padding: 16px; border-radius: 8px; overflow: auto; font-size: 13px;">${error instanceof Error ? error.stack || error.message : String(error)}</pre>
        <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #be123c; color: white; border: none; border-radius: 6px; cursor: pointer;">Tentar Novamente</button>
      </div>
    `;
  }
}

bootstrap();

console.log("🚀 [BOOTSTRAP INITIALIZED] " + new Date().toISOString());
window.__SAP_START = Date.now();

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("📦 [DIAGNOSTICO] Módulos importados. Iniciando renderização...");
console.log("📍 [DIAGNOSTICO] Localização:", window.location.href);

try {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("❌ [ERRO CRITICO] Elemento #root não encontrado no DOM!");
  }
  createRoot(container).render(<App />);
  console.log("✅ [DIAGNOSTICO] Renderização do React disparada.");
} catch (error) {
  console.error("🔥 [ERRO FATAL] Falha no bootstrap do React:", error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; background: #fff1f2; color: #be123c; border: 2px solid #fb7185; border-radius: 12px; margin: 20px;">
      <h1 style="margin-top: 0;">Erro de Inicialização</h1>
      <p>O sistema falhou ao iniciar. Detalhes técnicos:</p>
      <pre style="background: #000; color: #fff; padding: 15px; border-radius: 8px; overflow: auto;">${error}</pre>
    </div>
  `;
}

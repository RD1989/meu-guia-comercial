import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100">
            <div className="h-20 w-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-rose-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter mb-4">Ops! Algo deu errado.</h1>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Encontramos um erro inesperado ao carregar esta página. Nossa equipe técnica já foi notificada.
            </p>
            
            {process.env.NODE_ENV === 'development' || true && (
              <div className="mb-8 p-4 bg-slate-50 rounded-2xl text-left overflow-auto max-h-40 border border-slate-100">
                <p className="text-[10px] font-mono text-rose-600 font-bold uppercase mb-2">Detalhes do Erro:</p>
                <code className="text-[11px] font-mono text-slate-700 break-words">
                  {this.state.error?.toString()}
                </code>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest gap-2"
              >
                <RefreshCcw className="h-4 w-4" /> Tentar Novamente
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/'}
                className="w-full h-12 rounded-2xl text-slate-400 font-black uppercase text-[10px] tracking-widest gap-2"
              >
                <Home className="h-4 w-4" /> Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

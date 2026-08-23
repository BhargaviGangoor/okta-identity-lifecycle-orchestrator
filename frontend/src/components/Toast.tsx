import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  success: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const duration = toast.duration ?? 4000;
      const newToast: ToastMessage = { ...toast, id };

      setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: "success" });
  }, [showToast]);

  const warning = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: "warning" });
  }, [showToast]);

  const error = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: "error" });
  }, [showToast]);

  const info = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: "info" });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, warning, error, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const type = t.type || "info";
          return (
            <div
              key={t.id}
              className="pointer-events-auto bg-[#181818] border border-white/15 text-white rounded-[20px] p-4 shadow-2xl backdrop-blur-xl flex items-start gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200 transition-all hover:border-white/30 group"
            >
              <div className="shrink-0 mt-0.5">
                {type === "success" && (
                  <div className="w-6 h-6 rounded-full bg-[#D4E84A]/20 text-[#D4E84A] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                {type === "warning" && (
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                )}
                {type === "error" && (
                  <div className="w-6 h-6 rounded-full bg-[#E8703A]/20 text-[#E8703A] flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                )}
                {type === "info" && (
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <h5 className="text-xs font-bold text-white leading-snug">{t.title}</h5>
                {t.description && (
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed font-sans line-clamp-2">
                    {t.description}
                  </p>
                )}
                {t.actionLabel && t.onAction && (
                  <button
                    onClick={() => {
                      t.onAction?.();
                      removeToast(t.id);
                    }}
                    className="mt-2 text-[10px] font-mono font-bold text-[#D4E84A] hover:underline uppercase tracking-wider block"
                  >
                    {t.actionLabel} →
                  </button>
                )}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-neutral-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback stub if used outside provider
    return {
      showToast: () => {},
      success: (msg: string) => console.log("[Toast Success]", msg),
      warning: (msg: string) => console.warn("[Toast Warning]", msg),
      error: (msg: string) => console.error("[Toast Error]", msg),
      info: (msg: string) => console.info("[Toast Info]", msg),
    };
  }
  return context;
}

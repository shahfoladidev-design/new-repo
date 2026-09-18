"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useIsClient } from "@/lib/use-is-client";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/admin/action-result";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
};

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type AdminFeedbackApi = {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  fromResult: (result: ActionResult, fallbackSuccess?: string) => boolean;
  run: (
    action: () => Promise<ActionResult | void>,
    options?: { successMessage?: string; errorMessage?: string },
  ) => Promise<boolean>;
};

const AdminFeedbackContext = createContext<AdminFeedbackApi | null>(null);

const TOAST_MS = 4200;

export function AdminFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(
    null,
  );
  const mounted = useIsClient();
  const timers = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((id) => window.clearTimeout(id));
      activeTimers.clear();
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev.slice(-4), { id, tone, title, description }]);
      const timer = window.setTimeout(() => dismiss(id), TOAST_MS);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ ...options, resolve });
    });
  }, []);

  const api = useMemo<AdminFeedbackApi>(
    () => ({
      success: (title, description) => push("success", title, description),
      error: (title, description) => push("error", title, description),
      info: (title, description) => push("info", title, description),
      confirm,
      fromResult: (result, fallbackSuccess = "Changes saved") => {
        if (result.ok) {
          push("success", result.message ?? fallbackSuccess);
          return true;
        }
        push("error", "Could not save", result.error);
        return false;
      },
      run: async (action, options) => {
        try {
          const result = await action();
          if (!result) {
            push("success", options?.successMessage ?? "Changes saved");
            return true;
          }
          if (result.ok) {
            push("success", result.message ?? options?.successMessage ?? "Changes saved");
            return true;
          }
          push("error", options?.errorMessage ?? "Could not save", result.error);
          return false;
        } catch (err) {
          push(
            "error",
            options?.errorMessage ?? "Could not save",
            err instanceof Error ? err.message : "Something went wrong.",
          );
          return false;
        }
      },
    }),
    [confirm, push],
  );

  return (
    <AdminFeedbackContext.Provider value={api}>
      {children}
      {mounted
        ? createPortal(
            <>
              <div
                className="pointer-events-none fixed inset-x-0 top-0 z-[200] flex flex-col items-end gap-2 p-4 sm:p-6"
                aria-live="polite"
                aria-relevant="additions"
              >
                {toasts.map((toast) => (
                  <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
                ))}
              </div>
              {confirmState ? (
                <ConfirmDialog
                  options={confirmState}
                  onCancel={() => {
                    confirmState.resolve(false);
                    setConfirmState(null);
                  }}
                  onConfirm={() => {
                    confirmState.resolve(true);
                    setConfirmState(null);
                  }}
                />
              ) : null}
            </>,
            document.body,
          )
        : null}
    </AdminFeedbackContext.Provider>
  );
}

export function useAdminFeedback() {
  const ctx = useContext(AdminFeedbackContext);
  if (!ctx) {
    throw new Error("useAdminFeedback must be used within AdminFeedbackProvider");
  }
  return ctx;
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const Icon = toast.tone === "success" ? CheckCircle2 : toast.tone === "error" ? AlertCircle : Info;
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur",
        toast.tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-950",
        toast.tone === "error" && "border-red-200 bg-red-50 text-red-950",
        toast.tone === "info" && "border-border bg-card text-foreground",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0",
          toast.tone === "success" && "text-emerald-600",
          toast.tone === "error" && "text-red-600",
          toast.tone === "info" && "text-primary",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description ? <p className="mt-0.5 text-xs opacity-80">{toast.description}</p> : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-full p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function ConfirmDialog({
  options,
  onCancel,
  onConfirm,
}: {
  options: ConfirmOptions;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const descId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Cancel" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <h2 id={titleId} className="text-lg font-semibold text-foreground">
          {options.title}
        </h2>
        <p id={descId} className="mt-2 text-sm text-muted-foreground">
          {options.message}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            {options.cancelLabel ?? "Cancel"}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium text-white",
              options.danger ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:opacity-90",
            )}
          >
            {options.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

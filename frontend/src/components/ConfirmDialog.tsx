"use client";

interface ConfirmDialogProps {
  message: string;
  confirmLabel?: string;
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  message,
  confirmLabel = "Confirmar",
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="glass w-full max-w-sm rounded-2xl p-6">
        <p className="text-sm text-[var(--foreground)]">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="glass-icon-btn cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-[var(--foreground)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className="glass-btn-danger cursor-pointer rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed"
          >
            {isBusy ? "Eliminando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

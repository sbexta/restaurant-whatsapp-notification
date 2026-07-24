"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { X } from "lucide-react";
import { Customer, CustomerFormValues } from "@/types/customer";

interface CustomerFormModalProps {
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
}

export default function CustomerFormModal({ customer, onClose, onSubmit }: CustomerFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    defaultValues: { name: "", document: "", phone: "" },
  });

  useEffect(() => {
    reset({
      name: customer?.name ?? "",
      document: customer?.document ?? "",
      phone: customer?.phone ?? "",
    });
  }, [customer, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : "No se pudo guardar el cliente.",
      });
    }
  });

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-normal text-[var(--foreground)]">
            {customer ? "Editar cliente" : "Nuevo cliente"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="glass-icon-btn cursor-pointer rounded-full p-1 text-[var(--muted-foreground)]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Nombre</label>
            <input
              {...register("name", { required: "El nombre es obligatorio" })}
              className="glass-input w-full rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Cédula</label>
            <input
              {...register("document", { required: "La cédula es obligatoria" })}
              className="glass-input w-full rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none"
            />
            {errors.document && <p className="mt-1 text-sm text-red-600">{errors.document.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Teléfono</label>
            <input
              {...register("phone", { required: "El teléfono es obligatorio" })}
              className="glass-input w-full rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none"
              placeholder="573101234567"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="glass-icon-btn cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-[var(--foreground)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="glass-btn-brand cursor-pointer rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

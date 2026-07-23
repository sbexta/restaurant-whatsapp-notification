"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
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
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {customer ? "Editar cliente" : "Nuevo cliente"}
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
            <input
              {...register("name", { required: "El nombre es obligatorio" })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Cédula</label>
            <input
              {...register("document", { required: "La cédula es obligatoria" })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.document && <p className="mt-1 text-sm text-red-600">{errors.document.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              {...register("phone", { required: "El teléfono es obligatorio" })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="573101234567"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

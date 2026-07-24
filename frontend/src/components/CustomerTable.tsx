"use client";

import { Check, Pencil, Trash2 } from "lucide-react";
import { Customer } from "@/types/customer";

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onMarkReady: (customer: Customer) => void;
  pendingActionId: number | null;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function CustomerTable({
  customers,
  onEdit,
  onDelete,
  onMarkReady,
  pendingActionId,
}: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="glass rounded-xl px-4 py-10 text-center text-sm text-[var(--muted-foreground)]">
        No hay clientes registrados todavía.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {customers.map((customer) => (
        <li
          key={customer.id}
          className="glass-card flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="glass-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white">
              {initials(customer.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-normal text-[var(--foreground)]">
                {customer.name}
              </p>
              <p className="truncate text-xs text-[var(--muted-foreground)]">
                Cédula {customer.document} &middot; {customer.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:shrink-0">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                customer.status === "Listo" ? "glass-pill-ready" : "glass-pill-pending"
              }`}
            >
              {customer.status}
            </span>

            {customer.status === "Pendiente" && (
              <button
                onClick={() => onMarkReady(customer)}
                disabled={pendingActionId === customer.id}
                aria-label={`Marcar a ${customer.name} como listo`}
                title="Marcar como listo"
                className="glass-btn-brand flex h-9 w-9 cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed"
              >
                {pendingActionId === customer.id ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                )}
              </button>
            )}

            <button
              onClick={() => onEdit(customer)}
              aria-label={`Editar a ${customer.name}`}
              title="Editar"
              className="glass-icon-btn flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[var(--foreground)]"
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </button>

            <button
              onClick={() => onDelete(customer)}
              aria-label={`Eliminar a ${customer.name}`}
              title="Eliminar"
              className="glass-icon-btn flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-red-700"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

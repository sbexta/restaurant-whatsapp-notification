"use client";

import { Customer } from "@/types/customer";

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onMarkReady: (customer: Customer) => void;
  pendingActionId: number | null;
}

export default function CustomerTable({
  customers,
  onEdit,
  onDelete,
  onMarkReady,
  pendingActionId,
}: CustomerTableProps) {
  if (customers.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">No hay clientes registrados todavía.</p>;
  }

  return (
    <table className="w-full border-collapse overflow-hidden rounded-lg bg-white text-sm shadow">
      <thead>
        <tr className="bg-gray-100 text-left text-gray-600">
          <th className="px-4 py-3 font-medium">Nombre</th>
          <th className="px-4 py-3 font-medium">Cédula</th>
          <th className="px-4 py-3 font-medium">Teléfono</th>
          <th className="px-4 py-3 font-medium">Estado</th>
          <th className="px-4 py-3 font-medium">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {customers.map((customer) => (
          <tr key={customer.id} className="border-t border-gray-100">
            <td className="px-4 py-3 text-gray-900">{customer.name}</td>
            <td className="px-4 py-3 text-gray-700">{customer.document}</td>
            <td className="px-4 py-3 text-gray-700">{customer.phone}</td>
            <td className="px-4 py-3">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  customer.status === "Listo"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {customer.status}
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onEdit(customer)}
                  className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(customer)}
                  className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
                {customer.status === "Pendiente" && (
                  <button
                    onClick={() => onMarkReady(customer)}
                    disabled={pendingActionId === customer.id}
                    className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {pendingActionId === customer.id ? "Enviando..." : "Marcar como listo"}
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

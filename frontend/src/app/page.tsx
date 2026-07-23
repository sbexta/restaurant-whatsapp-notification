"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  createCustomer,
  deleteCustomer,
  getCustomers,
  markCustomerReady,
  updateCustomer,
} from "@/lib/api";
import { Customer, CustomerFormValues } from "@/types/customer";
import CustomerTable from "@/components/CustomerTable";
import CustomerFormModal from "@/components/CustomerFormModal";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadCustomers() {
    setLoading(true);
    try {
      setCustomers(await getCustomers());
      setError(null);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch-on-mount
    loadCustomers();
  }, []);

  function openCreateForm() {
    setEditingCustomer(null);
    setIsFormOpen(true);
  }

  function openEditForm(customer: Customer) {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  }

  async function handleFormSubmit(values: CustomerFormValues) {
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, values);
    } else {
      await createCustomer(values);
    }
    setIsFormOpen(false);
    await loadCustomers();
  }

  async function confirmDelete() {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
      await loadCustomers();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "No se pudo eliminar el cliente.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleMarkReady(customer: Customer) {
    setPendingActionId(customer.id);
    try {
      await markCustomerReady(customer.id);
      await loadCustomers();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "No se pudo enviar la notificación.");
    } finally {
      setPendingActionId(null);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
        <button
          onClick={openCreateForm}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nuevo cliente
        </button>
      </div>

      {actionError && (
        <div className="mb-4 flex items-center justify-between rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="font-medium hover:underline">
            Cerrar
          </button>
        </div>
      )}

      {loading && <p className="text-sm text-gray-500">Cargando...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <CustomerTable
          customers={customers}
          onEdit={openEditForm}
          onDelete={setCustomerToDelete}
          onMarkReady={handleMarkReady}
          pendingActionId={pendingActionId}
        />
      )}

      {isFormOpen && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {customerToDelete && (
        <ConfirmDialog
          message={`¿Eliminar a ${customerToDelete.name}?`}
          confirmLabel="Eliminar"
          isBusy={isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => setCustomerToDelete(null)}
        />
      )}
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Plus, X } from "lucide-react";
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
import ThemeToggle from "@/components/ThemeToggle";

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
    <div className="min-h-full">
      <header className="glass-header sticky top-0 z-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="glass-avatar flex h-10 w-10 items-center justify-center rounded-full">
              <MessageCircle className="h-5 w-5 text-white" strokeWidth={2.25} aria-hidden />
            </span>
            <div>
              <h1 className="font-heading text-lg font-normal leading-tight text-white">Clientes</h1>
              <p className="text-xs text-white/75">Notificaciones de pedido por WhatsApp</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={openCreateForm}
              className="glass-btn-brand flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold sm:px-5"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              <span className="hidden sm:inline">Nuevo cliente</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {actionError && (
          <div className="glass-alert mb-4 flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError(null)}
              aria-label="Cerrar mensaje de error"
              className="glass-icon-btn cursor-pointer rounded-full p-1"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}

        {loading && (
          <div className="glass flex items-center gap-3 rounded-xl px-4 py-4 text-sm text-[var(--muted-foreground)]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--brand-dark)] border-t-transparent" />
            Cargando clientes...
          </div>
        )}

        {error && <div className="glass-alert rounded-xl px-4 py-3 text-sm">{error}</div>}

        {!loading && !error && (
          <CustomerTable
            customers={customers}
            onEdit={openEditForm}
            onDelete={setCustomerToDelete}
            onMarkReady={handleMarkReady}
            pendingActionId={pendingActionId}
          />
        )}
      </main>

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
    </div>
  );
}

import { Customer, CustomerFormValues } from "@/types/customer";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5199";

export class ApiError extends Error {}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data?.error) return data.error as string;
    if (data?.errors) {
      return Object.values(data.errors as Record<string, string[]>).flat().join(" ");
    }
  } catch {
    // response had no JSON body
  }
  return `Error inesperado (HTTP ${response.status}).`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getCustomers(): Promise<Customer[]> {
  return request<Customer[]>("/customers");
}

export function createCustomer(values: CustomerFormValues): Promise<Customer> {
  return request<Customer>("/customers", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function updateCustomer(id: number, values: CustomerFormValues): Promise<Customer> {
  return request<Customer>(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(values),
  });
}

export function deleteCustomer(id: number): Promise<void> {
  return request<void>(`/customers/${id}`, { method: "DELETE" });
}

export function markCustomerReady(id: number): Promise<Customer> {
  return request<Customer>(`/customers/${id}/ready`, { method: "POST" });
}

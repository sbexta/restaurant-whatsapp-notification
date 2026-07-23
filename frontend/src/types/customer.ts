export type CustomerStatus = "Pendiente" | "Listo";

export interface Customer {
  id: number;
  name: string;
  document: string;
  phone: string;
  status: CustomerStatus;
  createdAt: string;
}

export interface CustomerFormValues {
  name: string;
  document: string;
  phone: string;
}

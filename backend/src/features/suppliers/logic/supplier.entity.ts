export interface SupplierEntity {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: Date;
}

export interface CreateSupplierInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateSupplierInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

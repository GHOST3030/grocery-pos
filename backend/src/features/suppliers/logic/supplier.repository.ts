import { CreateSupplierInput, SupplierEntity, UpdateSupplierInput } from './supplier.entity';

export interface SupplierRepository {
  list(): Promise<SupplierEntity[]>;
  findById(id: string): Promise<SupplierEntity | null>;
  create(input: CreateSupplierInput): Promise<SupplierEntity>;
  update(id: string, input: UpdateSupplierInput): Promise<SupplierEntity>;
  remove(id: string): Promise<void>;
}

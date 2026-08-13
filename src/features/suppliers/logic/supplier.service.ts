import { NotFoundError } from '../../../shared/errors/AppError';
import { SupplierRepository } from './supplier.repository';
import { CreateSupplierInput, SupplierEntity, UpdateSupplierInput } from './supplier.entity';

export class SupplierService {
  constructor(private readonly repo: SupplierRepository) {}

  list(): Promise<SupplierEntity[]> {
    return this.repo.list();
  }

  create(input: CreateSupplierInput): Promise<SupplierEntity> {
    return this.repo.create(input);
  }

  async update(id: string, input: UpdateSupplierInput): Promise<SupplierEntity> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError('Supplier');
    return this.repo.update(id, input);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError('Supplier');
    await this.repo.remove(id);
  }
}

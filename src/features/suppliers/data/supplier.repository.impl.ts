import { prisma } from '../../../shared/database/prisma';
import { SupplierRepository } from '../logic/supplier.repository';
import { CreateSupplierInput, SupplierEntity, UpdateSupplierInput } from '../logic/supplier.entity';

export class PrismaSupplierRepository implements SupplierRepository {
  async list(): Promise<SupplierEntity[]> {
    return prisma.supplier.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string): Promise<SupplierEntity | null> {
    return prisma.supplier.findUnique({ where: { id } });
  }

  async create(input: CreateSupplierInput): Promise<SupplierEntity> {
    return prisma.supplier.create({ data: input });
  }

  async update(id: string, input: UpdateSupplierInput): Promise<SupplierEntity> {
    return prisma.supplier.update({ where: { id }, data: input });
  }

  async remove(id: string): Promise<void> {
    await prisma.supplier.delete({ where: { id } });
  }
}

import { prisma } from '../../../shared/database/prisma';
import { CategoryRepository } from '../logic/category.repository';
import { CategoryEntity } from '../logic/category.entity';

export class PrismaCategoryRepository implements CategoryRepository {
  async list(): Promise<CategoryEntity[]> {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    return prisma.category.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    return prisma.category.findUnique({ where: { name } });
  }

  async create(name: string): Promise<CategoryEntity> {
    return prisma.category.create({ data: { name } });
  }

  async update(id: string, name: string): Promise<CategoryEntity> {
    return prisma.category.update({ where: { id }, data: { name } });
  }

  async remove(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }
}

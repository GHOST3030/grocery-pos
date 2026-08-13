import { Prisma } from '@prisma/client';
import { prisma } from '../../../shared/database/prisma';
import { ProductListFilters, ProductRepository } from '../logic/product.repository';
import { CreateProductInput, ProductEntity, UpdateProductInput } from '../logic/product.entity';

// Prisma returns Decimal objects for costPrice/sellPrice/stockQty/reorderLevel —
// convert to plain numbers at the data boundary so the rest of the app (logic,
// presentation, JSON responses) works with ordinary numbers.
function toEntity(row: any): ProductEntity {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description,
    costPrice: Number(row.costPrice),
    sellPrice: Number(row.sellPrice),
    unit: row.unit,
    stockQty: Number(row.stockQty),
    reorderLevel: Number(row.reorderLevel),
    active: row.active,
    categoryId: row.categoryId,
    supplierId: row.supplierId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaProductRepository implements ProductRepository {
  async findById(id: string): Promise<ProductEntity | null> {
    const row = await prisma.product.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  }

  async findBySku(sku: string): Promise<ProductEntity | null> {
    const row = await prisma.product.findUnique({ where: { sku } });
    return row ? toEntity(row) : null;
  }

  async list(filters: ProductListFilters): Promise<ProductEntity[]> {
    const where: Prisma.ProductWhereInput = {};

    if (filters.activeOnly) {
      where.active = true;
    }
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const rows = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return rows.map(toEntity);
  }

  async create(input: CreateProductInput): Promise<ProductEntity> {
    const row = await prisma.product.create({
      data: {
        sku: input.sku,
        name: input.name,
        description: input.description,
        costPrice: input.costPrice,
        sellPrice: input.sellPrice,
        unit: input.unit ?? 'pcs',
        stockQty: input.stockQty ?? 0,
        reorderLevel: input.reorderLevel ?? 5,
        categoryId: input.categoryId,
        supplierId: input.supplierId,
      },
    });
    return toEntity(row);
  }

  async update(id: string, input: UpdateProductInput): Promise<ProductEntity> {
    const row = await prisma.product.update({
      where: { id },
      data: input,
    });
    return toEntity(row);
  }

  async softDelete(id: string): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: { active: false },
    });
  }
}

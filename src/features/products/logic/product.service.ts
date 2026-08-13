import { DuplicateSkuError, NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { ProductRepository, ProductListFilters } from './product.repository';
import { CreateProductInput, ProductEntity, UpdateProductInput } from './product.entity';

export class ProductService {
  constructor(private readonly repo: ProductRepository) {}

  async list(filters: ProductListFilters): Promise<ProductEntity[]> {
    return this.repo.list(filters);
  }

  async getById(id: string): Promise<ProductEntity> {
    const product = await this.repo.findById(id);
    if (!product) throw new NotFoundError('Product');
    return product;
  }

  async getBySku(sku: string): Promise<ProductEntity> {
    const product = await this.repo.findBySku(sku);
    if (!product) throw new NotFoundError('Product');
    return product;
  }

  async create(input: CreateProductInput): Promise<ProductEntity> {
    if (input.sellPrice < input.costPrice) {
      // Not blocked outright — sometimes a loss-leader is intentional —
      // but caught here as a place to add a warning flag later if wanted.
    }
    if (input.costPrice < 0 || input.sellPrice < 0) {
      throw new ValidationError('Prices cannot be negative');
    }

    const existing = await this.repo.findBySku(input.sku);
    if (existing) {
      throw new DuplicateSkuError(input.sku);
    }

    return this.repo.create(input);
  }

  async update(id: string, input: UpdateProductInput): Promise<ProductEntity> {
    // Ensures a 404 is thrown for a missing product rather than letting
    // Prisma's own "record not found" error leak through as a 500.
    await this.getById(id);

    if (
      (input.costPrice !== undefined && input.costPrice < 0) ||
      (input.sellPrice !== undefined && input.sellPrice < 0)
    ) {
      throw new ValidationError('Prices cannot be negative');
    }

    return this.repo.update(id, input);
  }

  /** Soft delete — product is deactivated, not removed, since past sales reference it. */
  async remove(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.softDelete(id);
  }
}

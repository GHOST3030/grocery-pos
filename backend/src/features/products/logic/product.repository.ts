import { CreateProductInput, ProductEntity, UpdateProductInput } from './product.entity';

export interface ProductListFilters {
  search?: string;
  categoryId?: string;
  activeOnly?: boolean;
}

export interface ProductRepository {
  findById(id: string): Promise<ProductEntity | null>;
  findBySku(sku: string): Promise<ProductEntity | null>;
  list(filters: ProductListFilters): Promise<ProductEntity[]>;
  create(input: CreateProductInput): Promise<ProductEntity>;
  update(id: string, input: UpdateProductInput): Promise<ProductEntity>;
  /** Soft delete — sets active = false. Products are never hard-deleted
   *  because past SaleItems reference them. */
  softDelete(id: string): Promise<void>;
}

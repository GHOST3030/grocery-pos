export interface ProductEntity {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  costPrice: number;
  sellPrice: number;
  unit: string;
  stockQty: number;
  reorderLevel: number;
  active: boolean;
  categoryId: string | null;
  supplierId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  description?: string;
  costPrice: number;
  sellPrice: number;
  unit?: string;
  stockQty?: number;
  reorderLevel?: number;
  categoryId?: string;
  supplierId?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  costPrice?: number;
  sellPrice?: number;
  unit?: string;
  reorderLevel?: number;
  categoryId?: string | null;
  supplierId?: string | null;
  active?: boolean;
  // Note: stockQty is intentionally NOT editable here — stock changes must
  // go through the inventory feature's StockAdjustment audit trail, never
  // a silent field update on the product itself.
}

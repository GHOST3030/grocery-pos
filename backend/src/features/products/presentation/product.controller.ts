import { Request, Response } from 'express';
import { ProductService } from '../logic/product.service';
import { PrismaProductRepository } from '../data/product.repository.impl';
import { paramStr } from '../../../shared/utils/request';

const productService = new ProductService(new PrismaProductRepository());

export const productController = {
  async list(req: Request, res: Response) {
    const { search, categoryId, activeOnly } = req.query as {
      search?: string;
      categoryId?: string;
      activeOnly?: boolean;
    };
    const products = await productService.list({ search, categoryId, activeOnly });
    res.json({ products });
  },

  async getById(req: Request, res: Response) {
    const product = await productService.getById(paramStr(req.params.id));
    res.json({ product });
  },

  async getBySku(req: Request, res: Response) {
    // Used by the POS checkout screen for barcode scan lookups.
    const product = await productService.getBySku(paramStr(req.params.sku));
    res.json({ product });
  },

  async create(req: Request, res: Response) {
    const product = await productService.create(req.body);
    res.status(201).json({ product });
  },

  async update(req: Request, res: Response) {
    const product = await productService.update(paramStr(req.params.id), req.body);
    res.json({ product });
  },

  async remove(req: Request, res: Response) {
    await productService.remove(paramStr(req.params.id));
    res.status(204).send();
  },
};

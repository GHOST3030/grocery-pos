import { Request, Response } from 'express';
import { SupplierService } from '../logic/supplier.service';
import { PrismaSupplierRepository } from '../data/supplier.repository.impl';
import { paramStr } from '../../../shared/utils/request';

const supplierService = new SupplierService(new PrismaSupplierRepository());

export const supplierController = {
  async list(_req: Request, res: Response) {
    const suppliers = await supplierService.list();
    res.json({ suppliers });
  },

  async create(req: Request, res: Response) {
    const supplier = await supplierService.create(req.body);
    res.status(201).json({ supplier });
  },

  async update(req: Request, res: Response) {
    const supplier = await supplierService.update(paramStr(req.params.id), req.body);
    res.json({ supplier });
  },

  async remove(req: Request, res: Response) {
    await supplierService.remove(paramStr(req.params.id));
    res.status(204).send();
  },
};

import { Request, Response } from 'express';
import { CategoryService } from '../logic/category.service';
import { PrismaCategoryRepository } from '../data/category.repository.impl';
import { paramStr } from '../../../shared/utils/request';

const categoryService = new CategoryService(new PrismaCategoryRepository());

export const categoryController = {
  async list(_req: Request, res: Response) {
    const categories = await categoryService.list();
    res.json({ categories });
  },

  async create(req: Request, res: Response) {
    const category = await categoryService.create(req.body.name);
    res.status(201).json({ category });
  },

  async update(req: Request, res: Response) {
    const category = await categoryService.update(paramStr(req.params.id), req.body.name);
    res.json({ category });
  },

  async remove(req: Request, res: Response) {
    await categoryService.remove(paramStr(req.params.id));
    res.status(204).send();
  },
};

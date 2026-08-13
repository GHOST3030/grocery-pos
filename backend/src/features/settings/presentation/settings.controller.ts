import { Request, Response } from 'express';
import { SettingsService } from '../logic/settings.service';

const settingsService = new SettingsService();

export const settingsController = {
  async getAll(_req: Request, res: Response) {
    const settings = await settingsService.getAll();
    res.json({ settings });
  },

  async update(req: Request, res: Response) {
    await settingsService.setMany(req.body);
    const settings = await settingsService.getAll();
    res.json({ settings });
  },
};

export { settingsService };

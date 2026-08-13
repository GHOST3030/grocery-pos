import { Request, Response } from 'express';
import { SaleService } from '../logic/sale.service';
import { PrismaSaleRepository } from '../data/sale.repository.impl';
import { ReceiptService } from '../logic/receipt.service';
import { settingsService } from '../../settings/presentation/settings.controller';
import { UnauthorizedError, ValidationError } from '../../../shared/errors/AppError';
import { paramStr } from '../../../shared/utils/request';

const saleService = new SaleService(new PrismaSaleRepository());
const receiptService = new ReceiptService();

export const saleController = {
  async checkout(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError();
    const sale = await saleService.checkout({
      ...req.body,
      cashierId: req.user.userId,
    });
    res.status(201).json({ sale });
  },

  async getById(req: Request, res: Response) {
    const sale = await saleService.getById(paramStr(req.params.id));
    res.json({ sale });
  },

  async getByReceiptNo(req: Request, res: Response) {
    const sale = await saleService.getByReceiptNo(paramStr(req.params.receiptNo));
    res.json({ sale });
  },

  async list(req: Request, res: Response) {
    const { from, to } = req.query as { from?: string; to?: string };
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sales = await saleService.listByDateRange({
      from: from ? new Date(from) : defaultFrom,
      to: to ? new Date(to) : now,
    });
    res.json({ sales });
  },

  async void(req: Request, res: Response) {
    await saleService.voidSale(paramStr(req.params.id));
    res.status(204).send();
  },

  /** Prints (or re-prints) the receipt for a completed sale. */
  async printReceipt(req: Request, res: Response) {
    const sale = await saleService.getById(paramStr(req.params.id));
    const settings = await settingsService.getAll();

    try {
      await receiptService.printReceipt(sale, {
        storeName: settings.storeName,
        currencySymbol: settings.currencySymbol,
        receiptFooter: settings.receiptFooter,
        printerInterface: settings.printerInterface,
      });
    } catch (err) {
      // Printing is a hardware side effect, not a business rule failure —
      // the sale already succeeded. Surface a clear error so the UI can
      // show "printer offline, retry?" without implying the sale failed.
      throw new ValidationError(
        `Sale completed, but printing failed: ${err instanceof Error ? err.message : 'unknown error'}`
      );
    }

    res.json({ printed: true });
  },
};

import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';
import { SaleEntity } from './sale.entity';

export interface StoreSettings {
  storeName: string;
  address?: string;
  phone?: string;
  currencySymbol: string;
  receiptFooter?: string;
  /** Printer connection target — e.g. 'usb', or a serial/network path.
   *  See node-thermal-printer docs; kept generic so it's configurable
   *  per deployment without code changes. */
  printerInterface: string;
}

/**
 * Builds and sends the receipt to the thermal printer, and issues the
 * cash-drawer kick command via the same ESC/POS connection. Kept as its
 * own service (not folded into SaleService) since it's a hardware side
 * effect, not a business rule — a failed print should never roll back
 * a completed sale.
 */
export class ReceiptService {
  async printReceipt(sale: SaleEntity, settings: StoreSettings): Promise<void> {
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: settings.printerInterface,
    });

    const isConnected = await printer.isPrinterConnected().catch(() => false);
    if (!isConnected) {
      // Printing is a side effect, not a business rule — the caller
      // decides how to surface this (e.g. show "printer offline" in UI),
      // it must never block or roll back the sale itself.
      throw new Error('Printer is not connected');
    }

    printer.alignCenter();
    printer.bold(true);
    printer.println(settings.storeName);
    printer.bold(false);
    if (settings.address) printer.println(settings.address);
    if (settings.phone) printer.println(settings.phone);
    printer.drawLine();

    printer.alignLeft();
    printer.println(`Receipt: ${sale.receiptNo}`);
    printer.println(`Date: ${sale.createdAt.toLocaleString()}`);
    printer.println(`Cashier: ${sale.cashierName}`);
    printer.drawLine();

    for (const item of sale.items) {
      printer.println(item.productName);
      printer.tableCustom([
        { text: `  ${item.qty} x ${settings.currencySymbol}${item.unitPrice.toFixed(2)}`, align: 'LEFT', width: 0.6 },
        { text: `${settings.currencySymbol}${item.lineTotal.toFixed(2)}`, align: 'RIGHT', width: 0.4 },
      ]);
    }
    printer.drawLine();

    printer.tableCustom([
      { text: 'Subtotal', align: 'LEFT', width: 0.6 },
      { text: `${settings.currencySymbol}${sale.subtotal.toFixed(2)}`, align: 'RIGHT', width: 0.4 },
    ]);
    if (sale.discount > 0) {
      printer.tableCustom([
        { text: 'Discount', align: 'LEFT', width: 0.6 },
        { text: `-${settings.currencySymbol}${sale.discount.toFixed(2)}`, align: 'RIGHT', width: 0.4 },
      ]);
    }
    if (sale.tax > 0) {
      printer.tableCustom([
        { text: 'Tax', align: 'LEFT', width: 0.6 },
        { text: `${settings.currencySymbol}${sale.tax.toFixed(2)}`, align: 'RIGHT', width: 0.4 },
      ]);
    }
    printer.bold(true);
    printer.tableCustom([
      { text: 'TOTAL', align: 'LEFT', width: 0.6 },
      { text: `${settings.currencySymbol}${sale.total.toFixed(2)}`, align: 'RIGHT', width: 0.4 },
    ]);
    printer.bold(false);

    printer.tableCustom([
      { text: `Paid (${sale.paymentMethod})`, align: 'LEFT', width: 0.6 },
      { text: `${settings.currencySymbol}${sale.amountPaid.toFixed(2)}`, align: 'RIGHT', width: 0.4 },
    ]);
    printer.tableCustom([
      { text: 'Change', align: 'LEFT', width: 0.6 },
      { text: `${settings.currencySymbol}${sale.changeDue.toFixed(2)}`, align: 'RIGHT', width: 0.4 },
    ]);

    printer.drawLine();
    printer.alignCenter();
    printer.println(settings.receiptFooter ?? 'Thank you for shopping with us!');
    printer.cut();
    printer.openCashDrawer();

    await printer.execute();
  }
}

import { prisma } from '../../../shared/database/prisma';

const DEFAULTS: Record<string, string> = {
  storeName: 'My Grocery Store',
  currencySymbol: '$',
  taxRate: '0',
  receiptFooter: 'Thank you for shopping with us!',
  printerInterface: 'usb', // e.g. 'usb', 'tcp://192.168.x.x', '/dev/usb/lp0'
};

export class SettingsService {
  async getAll(): Promise<Record<string, string>> {
    const rows = await prisma.setting.findMany();
    const stored = Object.fromEntries(rows.map((r: { key: string; value: string }) => [r.key, r.value]));
    return { ...DEFAULTS, ...stored };
  }

  async get(key: string): Promise<string> {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row?.value ?? DEFAULTS[key] ?? '';
  }

  async set(key: string, value: string): Promise<void> {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async setMany(entries: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(entries)) {
      await this.set(key, value);
    }
  }
}

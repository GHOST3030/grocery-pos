import { create } from 'zustand';
import type { CartLine, Product } from '../types';

interface CartState {
  lines: CartLine[];
  addProduct: (product: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeLine: (productId: string) => void;
  clear: () => void;
  subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],

  addProduct: (product, qty = 1) => {
    set((state) => {
      const existing = state.lines.find((l) => l.product.id === product.id);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.product.id === product.id ? { ...l, qty: l.qty + qty } : l
          ),
        };
      }
      return { lines: [...state.lines, { product, qty }] };
    });
  },

  setQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeLine(productId);
      return;
    }
    set((state) => ({
      lines: state.lines.map((l) => (l.product.id === productId ? { ...l, qty } : l)),
    }));
  },

  removeLine: (productId) => {
    set((state) => ({ lines: state.lines.filter((l) => l.product.id !== productId) }));
  },

  clear: () => set({ lines: [] }),

  subtotal: () => get().lines.reduce((sum, l) => sum + l.product.sellPrice * l.qty, 0),
}));

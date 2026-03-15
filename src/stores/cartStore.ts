import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  unit: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  discountCode: string;
  discountAmount: number;
  loyaltyPointsToRedeem: number;
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  setDiscount: (code: string, amount: number) => void;
  setLoyaltyRedeem: (points: number) => void;
  clear: () => void;
  get subtotal(): number;
  get total(): number;
  get itemCount(): number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discountCode: '',
      discountAmount: 0,
      loyaltyPointsToRedeem: 0,

      addItem: (item, qty = 1) =>
        set(s => {
          const existing = s.items.find(i => i.productId === item.productId);
          if (existing) return { items: s.items.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + qty } : i) };
          return { items: [...s.items, { ...item, quantity: qty }] };
        }),

      updateQty: (productId, qty) =>
        set(s => qty <= 0
          ? { items: s.items.filter(i => i.productId !== productId) }
          : { items: s.items.map(i => i.productId === productId ? { ...i, quantity: qty } : i) }
        ),

      removeItem: (productId) => set(s => ({ items: s.items.filter(i => i.productId !== productId) })),
      setDiscount: (code, amount) => set({ discountCode: code, discountAmount: amount }),
      setLoyaltyRedeem: (points) => set({ loyaltyPointsToRedeem: points }),
      clear: () => set({ items: [], discountCode: '', discountAmount: 0, loyaltyPointsToRedeem: 0 }),

      get subtotal() { return get().items.reduce((s, i) => s + i.price * i.quantity, 0); },
      get total() {
        const s = get();
        return Math.max(0, s.subtotal - s.discountAmount - s.loyaltyPointsToRedeem * 0.01);
      },
      get itemCount() { return get().items.reduce((s, i) => s + i.quantity, 0); },
    }),
    { name: 'cart-store' }
  )
);

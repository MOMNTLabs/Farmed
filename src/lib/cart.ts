export type CartLine = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string | null;
  imageAlt?: string | null;
  quantity: number;
  allowsOnlineOrder: boolean;
  stock: number;
};

export const CART_STORAGE_KEY = "farmed_cart";

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as CartLine[];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event("cart:changed"));
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.price * line.quantity, 0);
}

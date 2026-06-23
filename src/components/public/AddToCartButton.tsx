"use client";

import { ShoppingCart } from "lucide-react";
import type { CartLine } from "@/lib/cart";
import { readCart, writeCart } from "@/lib/cart";

type AddToCartButtonProps = {
  line: Omit<CartLine, "quantity">;
  disabled?: boolean;
};

export function AddToCartButton({ line, disabled }: AddToCartButtonProps) {
  function add() {
    const cart = readCart();
    const current = cart.find((item) => item.productId === line.productId);

    if (current) {
      current.quantity = Math.min(current.quantity + 1, line.stock);
      writeCart(cart);
      return;
    }

    writeCart([...cart, { ...line, quantity: 1 }]);
  }

  return (
    <button type="button" onClick={add} disabled={disabled} className="btn-primary w-full">
      <ShoppingCart size={18} />
      Adicionar
    </button>
  );
}

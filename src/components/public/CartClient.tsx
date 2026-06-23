"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductImage } from "@/components/public/ProductImage";
import type { CartLine } from "@/lib/cart";
import { cartSubtotal, readCart, writeCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/format";

export function CartClient() {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    setLines(readCart());
  }, []);

  const subtotal = useMemo(() => cartSubtotal(lines), [lines]);

  function persist(next: CartLine[]) {
    setLines(next);
    writeCart(next);
  }

  function updateQuantity(productId: string, quantity: number) {
    persist(
      lines.map((line) =>
        line.productId === productId ? { ...line, quantity: Math.max(1, Math.min(quantity, line.stock)) } : line
      )
    );
  }

  function remove(productId: string) {
    persist(lines.filter((line) => line.productId !== productId));
  }

  const hasBlocked = lines.some((line) => !line.allowsOnlineOrder || line.quantity > line.stock);

  if (lines.length === 0) {
    return (
      <div className="panel p-8 text-center">
        <h1 className="text-2xl font-bold text-ink">Seu carrinho está vazio</h1>
        <p className="mt-2 text-slate-600">Adicione produtos do catálogo para iniciar o pedido.</p>
        <Link href="/produtos" className="btn-primary mt-6">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {lines.map((line) => (
          <article key={line.productId} className="panel grid gap-4 p-4 sm:grid-cols-[96px_1fr_auto]">
            <ProductImage src={line.imageUrl} alt={line.imageAlt || line.name} className="aspect-square" />
            <div>
              <Link href={`/produtos/${line.slug}`} className="font-bold text-ink">
                {line.name}
              </Link>
              <p className="mt-1 text-sm text-slate-600">{formatCurrency(line.price)}</p>
              {line.quantity > line.stock && <p className="mt-2 text-sm text-red-600">Quantidade maior que estoque disponível.</p>}
              {!line.allowsOnlineOrder && <p className="mt-2 text-sm text-red-600">Produto não permite pedido online.</p>}
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary px-2" onClick={() => updateQuantity(line.productId, line.quantity - 1)} aria-label="Diminuir">
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-semibold">{line.quantity}</span>
              <button className="btn-secondary px-2" onClick={() => updateQuantity(line.productId, line.quantity + 1)} aria-label="Aumentar">
                <Plus size={16} />
              </button>
              <button className="btn-secondary px-2" onClick={() => remove(line.productId)} aria-label="Remover">
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>
      <aside className="panel h-fit p-5">
        <h2 className="text-lg font-bold text-ink">Resumo</h2>
        <div className="mt-4 flex justify-between text-sm">
          <span>Subtotal</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <p className="mt-3 text-xs text-slate-500">Frete e disponibilidade final serão confirmados pela farmácia.</p>
        <Link href="/checkout" className={`mt-5 ${hasBlocked ? "btn-secondary pointer-events-none opacity-60" : "btn-primary"} w-full`}>
          Prosseguir para checkout
        </Link>
      </aside>
    </div>
  );
}

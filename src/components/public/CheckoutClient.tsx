"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CartLine } from "@/lib/cart";
import { cartSubtotal, readCart, writeCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/format";

export function CheckoutClient() {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const subtotal = useMemo(() => cartSubtotal(lines), [lines]);

  useEffect(() => {
    setLines(readCart());
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      customerName: form.get("customerName"),
      whatsapp: form.get("whatsapp"),
      cpf: form.get("cpf"),
      address: form.get("address"),
      district: form.get("district"),
      city: form.get("city"),
      deliveryMethod: form.get("deliveryMethod"),
      notes: form.get("notes"),
      prescriptionWillBeSent: form.get("prescriptionWillBeSent") === "on",
      items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity }))
    };

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as { orderId?: string; error?: string };
    setLoading(false);

    if (!response.ok || !result.orderId) {
      setError(result.error || "Não foi possível criar o pedido.");
      return;
    }

    writeCart([]);
    router.push(`/pedido/${result.orderId}`);
  }

  if (lines.length === 0) {
    return (
      <div className="panel p-8 text-center">
        <h1 className="text-2xl font-bold text-ink">Carrinho vazio</h1>
        <p className="mt-2 text-slate-600">Adicione produtos antes de finalizar.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="panel grid gap-4 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Nome do cliente</label>
          <input name="customerName" required className="field mt-1" />
        </div>
        <div>
          <label className="label">WhatsApp</label>
          <input name="whatsapp" required className="field mt-1" placeholder="(11) 99999-9999" />
        </div>
        <div>
          <label className="label">CPF opcional</label>
          <input name="cpf" className="field mt-1" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Endereço completo</label>
          <input name="address" required className="field mt-1" />
        </div>
        <div>
          <label className="label">Bairro</label>
          <input name="district" required className="field mt-1" />
        </div>
        <div>
          <label className="label">Cidade</label>
          <input name="city" required className="field mt-1" />
        </div>
        <div>
          <label className="label">Forma de entrega</label>
          <select name="deliveryMethod" className="field mt-1" defaultValue="DELIVERY">
            <option value="DELIVERY">Entrega</option>
            <option value="PICKUP">Retirada</option>
          </select>
        </div>
        <label className="mt-7 flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="prescriptionWillBeSent" className="h-4 w-4" />
          Enviarei receita quando necessário
        </label>
        <div className="sm:col-span-2">
          <label className="label">Observações</label>
          <textarea name="notes" className="field mt-1 min-h-28" />
        </div>
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
      </div>

      <aside className="panel h-fit p-5">
        <h2 className="text-lg font-bold text-ink">Resumo do pedido</h2>
        <div className="mt-4 space-y-3 text-sm">
          {lines.map((line) => (
            <div key={line.productId} className="flex justify-between gap-3">
              <span>
                {line.quantity}x {line.name}
              </span>
              <strong>{formatCurrency(line.quantity * line.price)}</strong>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-between border-t border-slate-200 pt-4">
          <span>Subtotal</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <p className="mt-3 text-xs text-slate-500">Não há pagamento online nesta versão.</p>
        <button disabled={loading} className="btn-primary mt-5 w-full">
          {loading ? "Criando pedido..." : "Finalizar pedido"}
        </button>
      </aside>
    </form>
  );
}

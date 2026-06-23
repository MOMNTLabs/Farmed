import { OrderStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { updateOrderStatus } from "@/app/(admin)/admin/actions";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getPharmacySettings } from "@/lib/settings";
import { buildOrderWhatsappMessage, whatsappUrl } from "@/lib/whatsapp";

type AdminOrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        statusHistory: { include: { user: true }, orderBy: { createdAt: "desc" } }
      }
    }),
    getPharmacySettings()
  ]);

  if (!order) notFound();

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className="panel p-5">
        <h1 className="text-3xl font-bold text-ink">Pedido {order.number}</h1>
        <p className="mt-2 text-sm text-slate-600">Criado em {formatDateTime(order.createdAt)}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Info label="Cliente" value={order.customer.name} />
          <Info label="WhatsApp" value={order.customer.whatsapp} />
          <Info label="CPF" value={order.customer.cpf} />
          <Info label="Entrega" value={order.deliveryMethod === "DELIVERY" ? "Entrega" : "Retirada"} />
          <Info label="Endereço" value={`${order.address}, ${order.district}, ${order.city}`} />
          <Info label="Precisa de receita" value={order.needsPrescription ? "Sim" : "Não"} />
        </div>

        <div className="mt-6 divide-y divide-slate-200">
          {order.items.map((item) => (
            <div key={item.id} className="grid gap-2 py-3 text-sm sm:grid-cols-[1fr_80px_120px_120px]">
              <span className="font-medium text-ink">{item.productName}</span>
              <span>{item.quantity} un.</span>
              <span>{formatCurrency(item.unitPrice.toString())}</span>
              <strong>{formatCurrency(item.total.toString())}</strong>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-between text-lg">
          <span>Subtotal</span>
          <strong>{formatCurrency(order.subtotal.toString())}</strong>
        </div>
        {order.notes && <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm text-slate-700">Observações: {order.notes}</p>}
      </section>

      <aside className="space-y-6">
        <form action={updateOrderStatus} className="panel p-5">
          <input type="hidden" name="orderId" value={order.id} />
          <h2 className="font-bold text-ink">Atualizar status</h2>
          <select name="status" defaultValue={order.status} className="field mt-4">
            {Object.values(OrderStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <textarea name="internalNotes" defaultValue={order.internalNotes || ""} placeholder="Observação interna" className="field mt-3 min-h-24" />
          <input name="note" placeholder="Nota para histórico" className="field mt-3" />
          <button className="btn-primary mt-4 w-full">Salvar status</button>
          <a
            href={whatsappUrl(settings.whatsapp, buildOrderWhatsappMessage(order))}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary mt-3 w-full"
          >
            <MessageCircle size={18} />
            Abrir WhatsApp
          </a>
        </form>
        <section className="panel p-5">
          <h2 className="font-bold text-ink">Histórico</h2>
          <div className="mt-4 space-y-3 text-sm">
            {order.statusHistory.map((history) => (
              <div key={history.id} className="border-l-2 border-brand-500 pl-3">
                <p className="font-medium text-ink">{history.to}</p>
                <p className="text-slate-500">{formatDateTime(history.createdAt)}</p>
                {history.note && <p className="text-slate-600">{history.note}</p>}
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

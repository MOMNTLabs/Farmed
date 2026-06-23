import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getPharmacySettings } from "@/lib/settings";
import { buildOrderWhatsappMessage, whatsappUrl } from "@/lib/whatsapp";

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

const statusLabels = {
  NEW: "Novo",
  UNDER_REVIEW: "Em analise",
  WAITING_PRESCRIPTION: "Aguardando receita",
  APPROVED_BY_PHARMACIST: "Aprovado pelo farmaceutico",
  SEPARATING: "Separando",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  COMPLETED: "Concluido",
  CANCELED: "Cancelado"
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: { customer: true, items: true, statusHistory: { orderBy: { createdAt: "desc" } } }
    }),
    getPharmacySettings()
  ]);

  if (!order) notFound();

  const message = buildOrderWhatsappMessage(order);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="panel p-6">
        <Badge tone="green">{statusLabels[order.status]}</Badge>
        <h1 className="mt-4 text-3xl font-bold text-ink">Pedido {order.number}</h1>
        <p className="mt-2 text-sm text-slate-600">Criado em {formatDateTime(order.createdAt)}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="font-bold text-ink">Cliente</h2>
            <p className="mt-2 text-sm text-slate-700">{order.customer.name}</p>
            <p className="text-sm text-slate-700">{order.customer.whatsapp}</p>
          </div>
          <div>
            <h2 className="font-bold text-ink">Endereco</h2>
            <p className="mt-2 text-sm text-slate-700">
              {order.address}, {order.district}, {order.city}
            </p>
          </div>
        </div>

        <div className="mt-6 divide-y divide-slate-200">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-4 py-3 text-sm">
              <span>
                {item.quantity}x {item.productName}
              </span>
              <strong>{formatCurrency(item.total.toString())}</strong>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-between text-lg">
          <span>Subtotal</span>
          <strong>{formatCurrency(order.subtotal.toString())}</strong>
        </div>

        {order.needsPrescription && (
          <p className="mt-5 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            Este pedido contem produto que depende de receita e avaliacao farmaceutica.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a href={whatsappUrl(settings.whatsapp, message)} target="_blank" rel="noreferrer" className="btn-primary">
            <MessageCircle size={18} />
            Enviar pedido pelo WhatsApp
          </a>
          <Link href="/produtos" className="btn-secondary">
            Voltar ao catalogo
          </Link>
        </div>
      </div>
    </div>
  );
}

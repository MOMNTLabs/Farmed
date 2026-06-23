import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [newOrders, reviewOrders, activeProductsList, activeProducts, revenue, latestOrders] = await Promise.all([
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.order.count({ where: { status: { in: ["UNDER_REVIEW", "WAITING_PRESCRIPTION"] } } }),
    prisma.product.findMany({ where: { isActive: true }, select: { stock: true, minimumStock: true } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.aggregate({ _sum: { subtotal: true }, where: { status: { notIn: ["CANCELED"] } } }),
    prisma.order.findMany({ include: { customer: true }, take: 8, orderBy: { createdAt: "desc" } })
  ]);
  const lowStock = activeProductsList.filter((product) => product.stock <= product.minimumStock).length;

  const cards = [
    ["Pedidos novos", newOrders],
    ["Aguardando análise", reviewOrders],
    ["Estoque baixo", lowStock],
    ["Produtos ativos", activeProducts],
    ["Faturamento estimado", formatCurrency(revenue._sum.subtotal?.toString() || 0)]
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value]) => (
          <div key={label} className="panel p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>
      <section className="panel mt-8 overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <h2 className="font-bold text-ink">Ultimos pedidos</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {latestOrders.map((order) => (
            <Link key={order.id} href={`/admin/pedidos/${order.id}`} className="grid gap-2 p-4 text-sm hover:bg-slate-50 md:grid-cols-5">
              <strong>{order.number}</strong>
              <span>{order.customer.name}</span>
              <span>{order.status}</span>
              <span>{formatCurrency(order.subtotal.toString())}</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

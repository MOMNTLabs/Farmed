import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/format";

type OrdersPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const status = params.status as OrderStatus | undefined;
  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: { customer: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Pedidos</h1>
      <form className="panel mt-6 flex flex-col gap-3 p-4 sm:flex-row">
        <select name="status" defaultValue={status || ""} className="field max-w-xs">
          <option value="">Todos os status</option>
          {Object.values(OrderStatus).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button className="btn-primary">Filtrar</button>
      </form>
      <div className="panel mt-6 overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3">Pedido</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Status</th>
              <th className="p-3">Receita</th>
              <th className="p-3">Subtotal</th>
              <th className="p-3">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-brand-700">
                  <Link href={`/admin/pedidos/${order.id}`}>{order.number}</Link>
                </td>
                <td className="p-3">{order.customer.name}</td>
                <td className="p-3">{order.status}</td>
                <td className="p-3">{order.needsPrescription ? "Sim" : "Não"}</td>
                <td className="p-3">{formatCurrency(order.subtotal.toString())}</td>
                <td className="p-3">{formatDateTime(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

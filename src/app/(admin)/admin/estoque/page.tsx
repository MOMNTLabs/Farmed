import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export default async function StockPage() {
  const [allProducts, movements] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ stock: "asc" }, { commercialName: "asc" }]
    }),
    prisma.stockMovement.findMany({
      include: { product: true, order: true },
      take: 30,
      orderBy: { createdAt: "desc" }
    })
  ]);
  const products = allProducts.filter((product) => product.stock <= product.minimumStock);

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Estoque</h1>
      <section className="panel mt-6 p-5">
        <h2 className="font-bold text-ink">Produtos com estoque baixo</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Produto</th>
                <th className="p-3">Estoque</th>
                <th className="p-3">Minimo</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="p-3 font-medium text-ink">{product.commercialName}</td>
                  <td className="p-3">{product.stock}</td>
                  <td className="p-3">{product.minimumStock}</td>
                  <td className="p-3">
                    <Link href={`/admin/produtos/${product.id}/editar`} className="btn-secondary">
                      Ajustar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="mt-4 text-sm text-slate-600">Nenhum produto abaixo do estoque mínimo.</p>}
        </div>
      </section>

      <section className="panel mt-6 p-5">
        <h2 className="font-bold text-ink">Últimas movimentações</h2>
        <div className="mt-4 divide-y divide-slate-200">
          {movements.map((movement) => (
            <div key={movement.id} className="grid gap-2 py-3 text-sm md:grid-cols-5">
              <span className="font-medium text-ink">{movement.product.commercialName}</span>
              <span>{movement.type}</span>
              <span>{movement.quantity}</span>
              <span>{movement.order?.number}</span>
              <span>{formatDateTime(movement.createdAt)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

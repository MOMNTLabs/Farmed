import Link from "next/link";
import { deleteProduct } from "@/app/(admin)/admin/actions";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, brand: true },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-ink">Produtos</h1>
        <Link href="/admin/produtos/novo" className="btn-primary">
          Novo produto
        </Link>
      </div>
      <div className="panel mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3">Produto</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Marca</th>
              <th className="p-3">Preco</th>
              <th className="p-3">Estoque</th>
              <th className="p-3">Online</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="p-3 font-medium text-ink">{product.commercialName}</td>
                <td className="p-3">{product.category?.name}</td>
                <td className="p-3">{product.brand?.name}</td>
                <td className="p-3">{formatCurrency((product.promotionalPrice ?? product.price).toString())}</td>
                <td className="p-3">{product.stock}</td>
                <td className="p-3">{product.allowsOnlineOrder ? "Sim" : "Nao"}</td>
                <td className="flex gap-2 p-3">
                  <Link href={`/admin/produtos/${product.id}/editar`} className="btn-secondary">
                    Editar
                  </Link>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={product.id} />
                    <button className="btn-secondary">Inativar</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

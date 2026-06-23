import Link from "next/link";
import { deleteProduct, importProducts } from "@/app/(admin)/admin/actions";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

type AdminProductsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = await searchParams;
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
      {(params.importados || params.erroImportacao) && (
        <div className={`mt-6 rounded-md p-4 text-sm ${params.erroImportacao ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}>
          {params.importados && <p>{params.importados} produto(s) importado(s) ou atualizado(s).</p>}
          {params.falhas && <p>{params.falhas} linha(s) nao foram importadas.</p>}
          {params.erroImportacao && <p>{params.erroImportacao}</p>}
        </div>
      )}
      <section className="panel mt-6 grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h2 className="text-lg font-bold text-ink">Importar produtos em lote</h2>
          <p className="mt-1 text-sm text-slate-600">
            Preencha uma planilha, exporte como CSV e importe aqui. Produtos com o mesmo slug serao atualizados.
          </p>
          <Link href="/admin/produtos/modelo-importacao" className="mt-3 inline-flex text-sm font-semibold text-brand-700">
            Baixar modelo CSV
          </Link>
        </div>
        <form action={importProducts} className="flex flex-col gap-3 sm:flex-row">
          <input name="file" type="file" accept=".csv,text/csv" required className="field bg-white" />
          <button className="btn-primary whitespace-nowrap">Importar CSV</button>
        </form>
      </section>
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

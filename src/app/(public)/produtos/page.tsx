import { Prisma } from "@prisma/client";
import { ProductCard } from "@/components/public/ProductCard";
import { prisma } from "@/lib/db";
import { getPharmacySettings } from "@/lib/settings";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const q = params.q?.trim();
  const category = params.categoria;
  const brand = params.marca;
  const availability = params.disponibilidade;
  const maxPrice = params.precoMax ? Number(params.precoMax) : undefined;
  const settings = await getPharmacySettings();

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    isPublicVisible: true,
    ...(settings.hideControlledPublic ? { regulatoryType: { not: "CONTROLLED_MEDICINE" } } : {}),
    ...(availability === "disponivel" ? { stock: { gt: 0 } } : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(brand ? { brand: { slug: brand } } : {}),
    ...(maxPrice ? { OR: [{ promotionalPrice: { lte: maxPrice } }, { promotionalPrice: null, price: { lte: maxPrice } }] } : {}),
    ...(q
      ? {
          OR: [
            { commercialName: { contains: q, mode: "insensitive" } },
            { activeIngredient: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { category: { name: { contains: q, mode: "insensitive" } } },
            { brand: { name: { contains: q, mode: "insensitive" } } }
          ]
        }
      : {})
  };

  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true },
      orderBy: [{ isFeatured: "desc" }, { commercialName: "asc" }]
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-ink">Produtos</h1>
          <p className="mt-2 text-slate-600">Busque por nome, principio ativo, categoria, marca ou descricao.</p>
        </div>
      </div>

      <form className="panel mt-6 grid gap-4 p-4 md:grid-cols-5">
        <input name="q" defaultValue={q} placeholder="Buscar" className="field md:col-span-2" />
        <select name="categoria" defaultValue={category || ""} className="field">
          <option value="">Categoria</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <select name="marca" defaultValue={brand || ""} className="field">
          <option value="">Marca</option>
          {brands.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <select name="disponibilidade" defaultValue={availability || ""} className="field">
          <option value="">Disponibilidade</option>
          <option value="disponivel">Disponivel</option>
        </select>
        <input name="precoMax" type="number" step="0.01" defaultValue={params.precoMax || ""} placeholder="Preco maximo" className="field" />
        <button className="btn-primary md:col-span-4">Aplicar filtros</button>
      </form>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {products.length === 0 && <p className="mt-8 text-sm text-slate-600">Nenhum produto encontrado.</p>}
    </div>
  );
}

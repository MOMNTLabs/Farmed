import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/db";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-ink">Novo produto</h1>
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}

import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/db";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } })
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-ink">Editar produto</h1>
      <ProductForm product={product} categories={categories} brands={brands} />
    </div>
  );
}

import Link from "next/link";
import type { Brand, Category, Product } from "@prisma/client";
import { ProductImage } from "@/components/public/ProductImage";
import { AddToCartButton } from "@/components/public/AddToCartButton";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/format";
import { canOrderOnline, regulatoryNotice } from "@/lib/regulatory";

type ProductCardProps = {
  product: Product & {
    category: Category | null;
    brand: Brand | null;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const price = product.promotionalPrice ?? product.price;
  const canOrder = canOrderOnline(product);

  return (
    <article className="panel flex h-full flex-col overflow-hidden">
      <Link href={`/produtos/${product.slug}`}>
        <ProductImage src={product.imageUrl} alt={product.imageAlt || product.commercialName} className="aspect-square" />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge tone={product.stock > 0 ? "green" : "red"}>{product.stock > 0 ? "Disponivel" : "Indisponivel"}</Badge>
          {product.category && <span className="text-xs text-slate-500">{product.category.name}</span>}
        </div>
        <Link href={`/produtos/${product.slug}`} className="mt-3 text-base font-bold text-ink hover:text-brand-700">
          {product.commercialName}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{product.description}</p>
        {regulatoryNotice(product) && <p className="mt-3 text-xs text-amber-700">{regulatoryNotice(product)}</p>}
        <div className="mt-auto pt-4">
          <p className="text-lg font-bold text-brand-700">{formatCurrency(price.toString())}</p>
          <div className="mt-3">
            {canOrder ? (
              <AddToCartButton
                line={{
                  productId: product.id,
                  name: product.commercialName,
                  slug: product.slug,
                  price: Number(price),
                  imageUrl: product.imageUrl,
                  imageAlt: product.imageAlt,
                  allowsOnlineOrder: product.allowsOnlineOrder,
                  stock: product.stock
                }}
              />
            ) : (
              <Link href={`/produtos/${product.slug}`} className="btn-secondary w-full">
                Consultar
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

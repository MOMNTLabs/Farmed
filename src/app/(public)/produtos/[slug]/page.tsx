import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/public/AddToCartButton";
import { ProductImage } from "@/components/public/ProductImage";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { canOrderOnline, regulatoryLabels, regulatoryNotice } from "@/lib/regulatory";
import { getPharmacySettings } from "@/lib/settings";
import { whatsappUrl } from "@/lib/whatsapp";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    prisma.product.findFirst({
      where: {
        slug,
        isActive: true,
        isPublicVisible: true
      },
      include: { category: true, brand: true }
    }),
    getPharmacySettings()
  ]);

  if (!product) notFound();
  if (settings.hideControlledPublic && product.regulatoryType === "CONTROLLED_MEDICINE") notFound();

  const price = product.promotionalPrice ?? product.price;
  const canOrder = canOrderOnline(product);
  const notice = regulatoryNotice(product);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <ProductImage src={product.imageUrl} alt={product.imageAlt || product.commercialName} className="aspect-square" />
      <section>
        <div className="flex flex-wrap gap-2">
          {product.category && <Badge>{product.category.name}</Badge>}
          <Badge tone={product.stock > 0 ? "positive" : "red"}>{product.stock > 0 ? "Disponível" : "Indisponível"}</Badge>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-ink">{product.commercialName}</h1>
        {product.brand && <p className="mt-2 text-sm text-slate-500">Marca/Fabricante: {product.brand.name}</p>}
        <p className="mt-5 whitespace-pre-line text-slate-700">{product.description}</p>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          {product.activeIngredient && <Info label="Principio ativo" value={product.activeIngredient} />}
          {product.presentation && <Info label="Apresentação" value={product.presentation} />}
          {product.anvisaRegistration && <Info label="Registro Anvisa" value={product.anvisaRegistration} />}
          <Info label="Tipo regulatório" value={regulatoryLabels[product.regulatoryType]} />
        </dl>

        {notice && <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{notice}</div>}

        <div className="mt-8 panel p-5">
          <p className="text-3xl font-bold text-brand-700">{formatCurrency(price.toString())}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
              <a
                href={whatsappUrl(settings.whatsapp, `Olá, gostaria de consultar o produto ${product.commercialName}.`)}
                className="btn-primary"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} />
                Consultar no WhatsApp
              </a>
            )}
            <Link href="/produtos" className="btn-secondary">
              Continuar vendo produtos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-ink">{value}</dd>
    </div>
  );
}

import Link from "next/link";
import { Bath, Boxes, HeartPulse, MessageCircle, Pill, ShieldCheck, Sparkles, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ProductCard } from "@/components/public/ProductCard";
import { prisma } from "@/lib/db";
import { getPharmacySettings } from "@/lib/settings";
import { whatsappUrl } from "@/lib/whatsapp";

export default async function HomePage() {
  const settings = await getPharmacySettings();
  const [categories, featured] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, take: 6, orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        isActive: true,
        isPublicVisible: true,
        isFeatured: true,
        ...(settings.hideControlledPublic ? { regulatoryType: { not: "CONTROLLED_MEDICINE" } } : {})
      },
      include: { category: true, brand: true },
      take: 8,
      orderBy: { updatedAt: "desc" }
    })
  ]);

  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Farmácia brasileira online</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Compre ou reserve produtos da farmácia pelo WhatsApp.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600">
              Catálogo atualizado, regras sanitárias claras e atendimento direto da equipe da {settings.tradeName}.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/produtos" className="btn-primary">
                Ver produtos
              </Link>
              <a
                href={whatsappUrl(settings.whatsapp, settings.whatsappDefaultText || "Olá, gostaria de atendimento.")}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                <MessageCircle size={18} />
                Falar no WhatsApp
              </a>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="panel p-5">
              <ShieldCheck className="text-brand-600" />
              <h2 className="mt-4 font-bold text-ink">Orientação responsável</h2>
              <p className="mt-2 text-sm text-slate-600">Avisos de receita e produtos controlados aparecem antes do pedido.</p>
            </div>
            <div className="panel p-5">
              <Truck className="text-brand-600" />
              <h2 className="mt-4 font-bold text-ink">Entrega ou retirada</h2>
              <p className="mt-2 text-sm text-slate-600">O pedido chega para a farmácia com endereço, itens e observações.</p>
            </div>
            <div className="panel p-5 sm:col-span-2">
              <h2 className="font-bold text-ink">{settings.tradeName}</h2>
              <p className="mt-2 text-sm text-slate-600">{settings.institutionalText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-ink">Categorias principais</h2>
          <Link href="/produtos" className="text-sm font-semibold text-brand-700">
            Ver catálogo
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/produtos?categoria=${category.slug}`}
              className="panel flex min-h-16 items-center gap-3 p-4 font-semibold text-ink transition hover:border-brand-200 hover:bg-brand-50"
            >
              <CategoryIcon name={category.name} />
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-ink">Produtos em destaque</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {featured.length === 0 && <p className="text-sm text-slate-600">Cadastre produtos em destaque no painel administrativo.</p>}
        </div>
      </section>
    </div>
  );
}

function CategoryIcon({ name }: { name: string }) {
  const Icon = getCategoryIcon(name);

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand-900">
      <Icon size={19} strokeWidth={1.8} />
    </span>
  );
}

function getCategoryIcon(name: string): LucideIcon {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("medic")) return Pill;
  if (normalized.includes("dermo") || normalized.includes("cosmet")) return Sparkles;
  if (normalized.includes("higiene")) return Bath;
  if (normalized.includes("vitamina") || normalized.includes("suplement")) return HeartPulse;
  return Boxes;
}

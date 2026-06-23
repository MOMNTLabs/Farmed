import Link from "next/link";
import { ShoppingCart, Search, MessageCircle } from "lucide-react";
import { BrandLogo } from "@/components/public/BrandLogo";
import { getPharmacySettings } from "@/lib/settings";
import { whatsappUrl } from "@/lib/whatsapp";

export async function PublicHeader() {
  const settings = await getPharmacySettings();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo />
          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-700 md:flex">
            <Link href="/produtos">Produtos</Link>
            <Link href="/sobre">Sobre</Link>
            <Link href="/contato">Contato</Link>
            <Link href="/admin">Admin</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/carrinho" className="btn-secondary px-3" aria-label="Abrir carrinho">
              <ShoppingCart size={18} />
            </Link>
            <a
              href={whatsappUrl(settings.whatsapp, settings.whatsappDefaultText || "Ola, gostaria de atendimento.")}
              className="btn-primary hidden sm:inline-flex"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          </div>
        </div>
        <form action="/produtos" className="flex rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <Search size={18} className="mt-0.5 text-slate-400" />
          <input
            name="q"
            placeholder="Buscar por produto, principio ativo, marca ou categoria"
            className="w-full bg-transparent px-3 text-sm outline-none"
          />
        </form>
      </div>
    </header>
  );
}

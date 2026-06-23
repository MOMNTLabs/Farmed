import Link from "next/link";
import { Box, ClipboardList, LayoutDashboard, LogOut, Package, Settings, Tags } from "lucide-react";
import { BrandLogo } from "@/components/public/BrandLogo";
import { logoutAdmin } from "@/app/(admin)/admin/actions";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/marcas", label: "Marcas", icon: Box },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/estoque", label: "Estoque", icon: Package },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-slate-200 bg-white p-4">
        <div className="mb-6">
          <BrandLogo href="/admin" />
        </div>
        <nav className="grid gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700">
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <form action={logoutAdmin} className="mt-6">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-700">
            <LogOut size={18} />
            Sair
          </button>
        </form>
      </aside>
      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}

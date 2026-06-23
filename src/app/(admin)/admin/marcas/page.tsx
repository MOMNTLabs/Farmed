import { saveBrand } from "@/app/(admin)/admin/actions";
import { prisma } from "@/lib/db";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Marcas</h1>
      <form action={saveBrand} className="panel mt-6 grid gap-4 p-5 md:grid-cols-4">
        <input name="name" required placeholder="Nome" className="field" />
        <input name="slug" placeholder="Slug opcional" className="field" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked />
          Ativa
        </label>
        <button className="btn-primary md:col-span-4">Criar marca</button>
      </form>

      <div className="mt-6 grid gap-3">
        {brands.map((brand) => (
          <form key={brand.id} action={saveBrand} className="panel grid gap-3 p-4 md:grid-cols-4">
            <input type="hidden" name="id" value={brand.id} />
            <input name="name" defaultValue={brand.name} className="field" />
            <input name="slug" defaultValue={brand.slug} className="field" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={brand.isActive} />
              Ativa
            </label>
            <button className="btn-secondary">Salvar</button>
          </form>
        ))}
      </div>
    </div>
  );
}

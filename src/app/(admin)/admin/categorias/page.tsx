import { saveCategory } from "@/app/(admin)/admin/actions";
import { prisma } from "@/lib/db";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Categorias</h1>
      <form action={saveCategory} className="panel mt-6 grid gap-4 p-5 md:grid-cols-4">
        <input name="name" required placeholder="Nome" className="field" />
        <input name="slug" placeholder="Slug opcional" className="field" />
        <input name="description" placeholder="Descricao opcional" className="field" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked />
          Ativa
        </label>
        <button className="btn-primary md:col-span-4">Criar categoria</button>
      </form>

      <div className="mt-6 grid gap-3">
        {categories.map((category) => (
          <form key={category.id} action={saveCategory} className="panel grid gap-3 p-4 md:grid-cols-5">
            <input type="hidden" name="id" value={category.id} />
            <input name="name" defaultValue={category.name} className="field" />
            <input name="slug" defaultValue={category.slug} className="field" />
            <input name="description" defaultValue={category.description || ""} className="field md:col-span-2" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={category.isActive} />
              Ativa
            </label>
            <button className="btn-secondary md:col-span-5">Salvar</button>
          </form>
        ))}
      </div>
    </div>
  );
}

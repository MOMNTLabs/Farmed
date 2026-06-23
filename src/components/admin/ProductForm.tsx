import type { Brand, Category, Product } from "@prisma/client";
import { RegulatoryType } from "@prisma/client";
import { saveProduct } from "@/app/(admin)/admin/actions";

type ProductFormProps = {
  product?: Product | null;
  categories: Category[];
  brands: Brand[];
};

export function ProductForm({ product, categories, brands }: ProductFormProps) {
  return (
    <form action={saveProduct} className="panel grid gap-5 p-5 md:grid-cols-2">
      {product && <input type="hidden" name="id" value={product.id} />}
      <Field label="Nome comercial" name="commercialName" defaultValue={product?.commercialName} required />
      <Field label="Slug" name="slug" defaultValue={product?.slug} />
      <div className="md:col-span-2">
        <label className="label">Descricao</label>
        <textarea name="description" required defaultValue={product?.description} className="field mt-1 min-h-28" />
      </div>
      <Select label="Categoria" name="categoryId" defaultValue={product?.categoryId || ""}>
        <option value="">Sem categoria</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <Select label="Marca/fabricante" name="brandId" defaultValue={product?.brandId || ""}>
        <option value="">Sem marca</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </Select>
      <Field label="Principio ativo" name="activeIngredient" defaultValue={product?.activeIngredient || ""} />
      <Field label="Apresentacao/concentracao" name="presentation" defaultValue={product?.presentation || ""} />
      <Field label="Registro Anvisa" name="anvisaRegistration" defaultValue={product?.anvisaRegistration || ""} />
      <Field label="SKU/codigo interno" name="sku" defaultValue={product?.sku || ""} />
      <Field label="Codigo de barras/EAN" name="barcode" defaultValue={product?.barcode || ""} />
      <Select label="Tipo regulatorio" name="regulatoryType" defaultValue={product?.regulatoryType || "COMMON_PRODUCT"}>
        {Object.values(RegulatoryType).map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </Select>
      <Field label="Preco" name="price" type="number" step="0.01" defaultValue={product?.price?.toString() || "0"} required />
      <Field label="Preco promocional" name="promotionalPrice" type="number" step="0.01" defaultValue={product?.promotionalPrice?.toString() || ""} />
      <Field label="Estoque atual" name="stock" type="number" defaultValue={String(product?.stock ?? 0)} />
      <Field label="Estoque minimo" name="minimumStock" type="number" defaultValue={String(product?.minimumStock ?? 0)} />
      <Field label="URL da imagem principal" name="imageUrl" defaultValue={product?.imageUrl || ""} />
      <Field label="Texto alternativo da imagem" name="imageAlt" defaultValue={product?.imageAlt || ""} />
      <div className="md:col-span-2">
        <label className="label">Observacoes internas</label>
        <textarea name="internalNotes" defaultValue={product?.internalNotes || ""} className="field mt-1 min-h-24" />
      </div>
      <div className="grid gap-3 md:col-span-2 sm:grid-cols-2 lg:grid-cols-4">
        <Check name="requiresPrescription" label="Exige receita" defaultChecked={product?.requiresPrescription} />
        <Check name="isControlled" label="Controlado" defaultChecked={product?.isControlled} />
        <Check name="allowsOnlineOrder" label="Permite pedido online" defaultChecked={product?.allowsOnlineOrder ?? true} />
        <Check name="isPublicVisible" label="Visivel na loja" defaultChecked={product?.isPublicVisible ?? true} />
        <Check name="isActive" label="Ativo" defaultChecked={product?.isActive ?? true} />
        <Check name="isFeatured" label="Destaque" defaultChecked={product?.isFeatured} />
      </div>
      <div className="md:col-span-2">
        <button className="btn-primary">Salvar produto</button>
      </div>
    </form>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const { label, ...inputProps } = props;
  return (
    <div>
      <label className="label">{label}</label>
      <input {...inputProps} className="field mt-1" />
    </div>
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; name: string }) {
  const { label, children, ...selectProps } = props;
  return (
    <div>
      <label className="label">{label}</label>
      <select {...selectProps} className="field mt-1">
        {children}
      </select>
    </div>
  );
}

function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4" />
      {label}
    </label>
  );
}

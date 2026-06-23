"use server";

import { OrderStatus, RegulatoryType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, requireAdmin } from "@/lib/auth";
import { debitOrderStock } from "@/lib/checkout";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function nullable(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();
  return value || null;
}

function money(formData: FormData, key: string) {
  return String(formData.get(key) || "0").replace(",", ".");
}

function parseMoney(value: string | undefined, fallback = "0") {
  const normalized = (value || fallback).trim();
  if (normalized.includes(",")) {
    return normalized.replace(/\./g, "").replace(",", ".");
  }
  return normalized;
}

function parseNumber(value: string | undefined, fallback = 0) {
  const parsed = Number((value || "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value: string | undefined, fallback = false) {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "sim", "s", "yes", "y"].includes(normalized)) return true;
  if (["0", "false", "nao", "não", "n", "no"].includes(normalized)) return false;
  return fallback;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && (char === "," || char === ";")) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeHeader(value: string) {
  return value.replace(/^\uFEFF/, "").trim();
}

function getRowValue(row: Record<string, string>, key: string) {
  return row[key]?.trim();
}

function redirectImportError(message: string): never {
  const params = new URLSearchParams({ erroImportacao: message });
  redirect(`/admin/produtos?${params.toString()}`);
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = nullable(formData, "id");
  const commercialName = String(formData.get("commercialName") || "").trim();
  const regulatoryType = String(formData.get("regulatoryType") || "COMMON_PRODUCT") as RegulatoryType;
  const isControlled = bool(formData, "isControlled") || regulatoryType === "CONTROLLED_MEDICINE";
  const requiresPrescription =
    bool(formData, "requiresPrescription") ||
    regulatoryType === "PRESCRIPTION_MEDICINE" ||
    regulatoryType === "CONTROLLED_MEDICINE";

  const data = {
    commercialName,
    slug: slugify(String(formData.get("slug") || commercialName)),
    description: String(formData.get("description") || "").trim(),
    categoryId: nullable(formData, "categoryId"),
    brandId: nullable(formData, "brandId"),
    activeIngredient: nullable(formData, "activeIngredient"),
    presentation: nullable(formData, "presentation"),
    anvisaRegistration: nullable(formData, "anvisaRegistration"),
    sku: nullable(formData, "sku"),
    barcode: nullable(formData, "barcode"),
    regulatoryType,
    requiresPrescription,
    isControlled,
    allowsOnlineOrder: bool(formData, "allowsOnlineOrder") && !isControlled,
    isPublicVisible: bool(formData, "isPublicVisible"),
    price: money(formData, "price"),
    promotionalPrice: nullable(formData, "promotionalPrice") ? money(formData, "promotionalPrice") : null,
    stock: Number(formData.get("stock") || 0),
    minimumStock: Number(formData.get("minimumStock") || 0),
    imageUrl: nullable(formData, "imageUrl"),
    imageAlt: nullable(formData, "imageAlt"),
    internalNotes: nullable(formData, "internalNotes"),
    isActive: bool(formData, "isActive"),
    isFeatured: bool(formData, "isFeatured")
  };

  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    await prisma.product.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/produtos");
  redirect("/admin/produtos");
}

export async function importProducts(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    redirectImportError("Selecione um arquivo CSV.");
  }

  if (file.size > 2 * 1024 * 1024) {
    redirectImportError("O arquivo deve ter até 2MB.");
  }

  const rows = parseCsv(await file.text());
  const [headers, ...dataRows] = rows;

  if (!headers?.length || dataRows.length === 0) {
    redirectImportError("O CSV precisa ter cabeçalho e pelo menos um produto.");
  }

  const normalizedHeaders = headers.map(normalizeHeader);
  const requiredHeaders = ["commercialName", "description", "price"];
  const missingHeaders = requiredHeaders.filter((header) => !normalizedHeaders.includes(header));

  if (missingHeaders.length > 0) {
    redirectImportError(`Colunas obrigatorias ausentes: ${missingHeaders.join(", ")}.`);
  }

  let imported = 0;
  const errors: string[] = [];

  for (const [index, values] of dataRows.entries()) {
    const rowNumber = index + 2;
    const row = Object.fromEntries(normalizedHeaders.map((header, headerIndex) => [header, values[headerIndex] || ""]));
    const commercialName = getRowValue(row, "commercialName");
    const description = getRowValue(row, "description");
    const price = getRowValue(row, "price");

    if (!commercialName || !description || !price) {
      errors.push(`Linha ${rowNumber}: nome, descrição e preço são obrigatórios.`);
      continue;
    }

    const regulatoryTypeValue = getRowValue(row, "regulatoryType") || "COMMON_PRODUCT";
    const regulatoryType = Object.values(RegulatoryType).includes(regulatoryTypeValue as RegulatoryType)
      ? (regulatoryTypeValue as RegulatoryType)
      : RegulatoryType.COMMON_PRODUCT;
    const isControlled = parseBoolean(getRowValue(row, "isControlled"), false) || regulatoryType === "CONTROLLED_MEDICINE";
    const requiresPrescription =
      parseBoolean(getRowValue(row, "requiresPrescription"), false) ||
      regulatoryType === "PRESCRIPTION_MEDICINE" ||
      regulatoryType === "CONTROLLED_MEDICINE";
    const slug = slugify(getRowValue(row, "slug") || commercialName);
    const categoryName = getRowValue(row, "category");
    const brandName = getRowValue(row, "brand");

    try {
      const category = categoryName
        ? await prisma.category.upsert({
            where: { slug: slugify(categoryName) },
            update: { name: categoryName, isActive: true },
            create: { name: categoryName, slug: slugify(categoryName), isActive: true }
          })
        : null;
      const brand = brandName
        ? await prisma.brand.upsert({
            where: { slug: slugify(brandName) },
            update: { name: brandName, isActive: true },
            create: { name: brandName, slug: slugify(brandName), isActive: true }
          })
        : null;

      await prisma.product.upsert({
        where: { slug },
        update: {
          commercialName,
          description,
          categoryId: category?.id ?? null,
          brandId: brand?.id ?? null,
          activeIngredient: getRowValue(row, "activeIngredient") || null,
          presentation: getRowValue(row, "presentation") || null,
          anvisaRegistration: getRowValue(row, "anvisaRegistration") || null,
          sku: getRowValue(row, "sku") || null,
          barcode: getRowValue(row, "barcode") || null,
          regulatoryType,
          requiresPrescription,
          isControlled,
          allowsOnlineOrder: parseBoolean(getRowValue(row, "allowsOnlineOrder"), true) && !isControlled,
          isPublicVisible: parseBoolean(getRowValue(row, "isPublicVisible"), true),
          price: parseMoney(price),
          promotionalPrice: getRowValue(row, "promotionalPrice") ? parseMoney(getRowValue(row, "promotionalPrice")) : null,
          stock: parseNumber(getRowValue(row, "stock")),
          minimumStock: parseNumber(getRowValue(row, "minimumStock")),
          imageUrl: getRowValue(row, "imageUrl") || null,
          imageAlt: getRowValue(row, "imageAlt") || null,
          internalNotes: getRowValue(row, "internalNotes") || null,
          isActive: parseBoolean(getRowValue(row, "isActive"), true),
          isFeatured: parseBoolean(getRowValue(row, "isFeatured"), false)
        },
        create: {
          commercialName,
          slug,
          description,
          categoryId: category?.id ?? null,
          brandId: brand?.id ?? null,
          activeIngredient: getRowValue(row, "activeIngredient") || null,
          presentation: getRowValue(row, "presentation") || null,
          anvisaRegistration: getRowValue(row, "anvisaRegistration") || null,
          sku: getRowValue(row, "sku") || null,
          barcode: getRowValue(row, "barcode") || null,
          regulatoryType,
          requiresPrescription,
          isControlled,
          allowsOnlineOrder: parseBoolean(getRowValue(row, "allowsOnlineOrder"), true) && !isControlled,
          isPublicVisible: parseBoolean(getRowValue(row, "isPublicVisible"), true),
          price: parseMoney(price),
          promotionalPrice: getRowValue(row, "promotionalPrice") ? parseMoney(getRowValue(row, "promotionalPrice")) : null,
          stock: parseNumber(getRowValue(row, "stock")),
          minimumStock: parseNumber(getRowValue(row, "minimumStock")),
          imageUrl: getRowValue(row, "imageUrl") || null,
          imageAlt: getRowValue(row, "imageAlt") || null,
          internalNotes: getRowValue(row, "internalNotes") || null,
          isActive: parseBoolean(getRowValue(row, "isActive"), true),
          isFeatured: parseBoolean(getRowValue(row, "isFeatured"), false)
        }
      });
      imported += 1;
    } catch (error) {
      errors.push(`Linha ${rowNumber}: ${error instanceof Error ? error.message : "erro ao importar produto"}.`);
    }
  }

  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath("/admin/produtos");

  const params = new URLSearchParams({ importados: String(imported) });
  if (errors.length > 0) {
    params.set("falhas", String(errors.length));
    params.set("erroImportacao", errors.slice(0, 3).join(" "));
  }

  redirect(`/admin/produtos?${params.toString()}`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  await prisma.product.update({
    where: { id: String(formData.get("id")) },
    data: { isActive: false, isPublicVisible: false }
  });
  revalidatePath("/admin/produtos");
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = nullable(formData, "id");
  const name = String(formData.get("name") || "").trim();
  const data = {
    name,
    slug: slugify(String(formData.get("slug") || name)),
    description: nullable(formData, "description"),
    isActive: bool(formData, "isActive")
  };

  if (id) {
    await prisma.category.update({ where: { id }, data });
  } else {
    await prisma.category.create({ data });
  }
  revalidatePath("/admin/categorias");
}

export async function saveBrand(formData: FormData) {
  await requireAdmin();
  const id = nullable(formData, "id");
  const name = String(formData.get("name") || "").trim();
  const data = {
    name,
    slug: slugify(String(formData.get("slug") || name)),
    isActive: bool(formData, "isActive")
  };

  if (id) {
    await prisma.brand.update({ where: { id }, data });
  } else {
    await prisma.brand.create({ data });
  }
  revalidatePath("/admin/marcas");
}

export async function saveSettings(formData: FormData) {
  await requireAdmin();
  const existing = await prisma.pharmacySettings.findFirst();
  const data = {
    tradeName: String(formData.get("tradeName") || "Farmed").trim(),
    legalName: nullable(formData, "legalName"),
    cnpj: nullable(formData, "cnpj"),
    address: nullable(formData, "address"),
    city: nullable(formData, "city"),
    state: nullable(formData, "state"),
    phone: nullable(formData, "phone"),
    whatsapp: nullable(formData, "whatsapp"),
    email: nullable(formData, "email"),
    openingHours: nullable(formData, "openingHours"),
    pharmacistName: nullable(formData, "pharmacistName"),
    pharmacistCrf: nullable(formData, "pharmacistCrf"),
    sanitaryLicense: nullable(formData, "sanitaryLicense"),
    afe: nullable(formData, "afe"),
    instagram: nullable(formData, "instagram"),
    facebook: nullable(formData, "facebook"),
    institutionalText: nullable(formData, "institutionalText"),
    whatsappDefaultText: nullable(formData, "whatsappDefaultText"),
    sanitaryNotice: nullable(formData, "sanitaryNotice"),
    hideControlledPublic: bool(formData, "hideControlledPublic")
  };

  if (existing) {
    await prisma.pharmacySettings.update({ where: { id: existing.id }, data });
  } else {
    await prisma.pharmacySettings.create({ data });
  }
  revalidatePath("/");
  revalidatePath("/admin/configuracoes");
}

export async function updateOrderStatus(formData: FormData) {
  const user = await requireAdmin();
  const orderId = String(formData.get("orderId"));
  const nextStatus = String(formData.get("status")) as OrderStatus;
  const note = nullable(formData, "note");
  const current = await prisma.order.findUnique({ where: { id: orderId } });
  if (!current) return;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: nextStatus,
      internalNotes: nullable(formData, "internalNotes"),
      statusHistory: {
        create: {
          from: current.status,
          to: nextStatus,
          note,
          userId: user.id
        }
      }
    }
  });

  if (nextStatus === "APPROVED_BY_PHARMACIST" || nextStatus === "COMPLETED") {
    await debitOrderStock(orderId);
  }

  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/estoque");
}

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

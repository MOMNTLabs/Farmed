import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const headers = [
  "commercialName",
  "slug",
  "description",
  "category",
  "brand",
  "activeIngredient",
  "presentation",
  "anvisaRegistration",
  "sku",
  "barcode",
  "regulatoryType",
  "requiresPrescription",
  "isControlled",
  "allowsOnlineOrder",
  "isPublicVisible",
  "price",
  "promotionalPrice",
  "stock",
  "minimumStock",
  "imageUrl",
  "imageAlt",
  "internalNotes",
  "isActive",
  "isFeatured"
];

const example = [
  "Protetor Solar FPS 50",
  "protetor-solar-fps-50",
  "Protetor solar facial para uso diário.",
  "Dermocosmeticos",
  "Farmed",
  "",
  "FPS 50 com 120ml",
  "",
  "SKU-001",
  "7890000000000",
  "COMMON_PRODUCT",
  "não",
  "não",
  "sim",
  "sim",
  "59,90",
  "",
  "25",
  "5",
  "",
  "Protetor Solar FPS 50",
  "",
  "sim",
  "sim"
];

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET() {
  await requireAdmin();
  const csv = [headers, example].map((row) => row.map(csvEscape).join(";")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="modelo-importacao-produtos.csv"'
    }
  });
}

import type { Product, RegulatoryType } from "@prisma/client";

export const regulatoryLabels: Record<RegulatoryType, string> = {
  COMMON_PRODUCT: "Produto comum",
  OTC_MEDICINE: "Medicamento isento de prescrição",
  PRESCRIPTION_MEDICINE: "Medicamento com prescrição",
  CONTROLLED_MEDICINE: "Medicamento controlado"
};

export function regulatoryNotice(product: Pick<Product, "regulatoryType" | "requiresPrescription" | "isControlled">) {
  if (product.regulatoryType === "CONTROLLED_MEDICINE" || product.isControlled) {
    return "Produto controlado. Consulte a farmácia para orientação e disponibilidade.";
  }

  if (product.regulatoryType === "PRESCRIPTION_MEDICINE" || product.requiresPrescription) {
    return "A dispensação depende da apresentação e avaliação da receita pelo farmacêutico.";
  }

  if (product.regulatoryType === "OTC_MEDICINE") {
    return "Use medicamentos com responsabilidade. Em caso de dúvida, fale com o farmacêutico.";
  }

  return null;
}

export function canOrderOnline(
  product: Pick<Product, "isActive" | "isPublicVisible" | "allowsOnlineOrder" | "isControlled" | "regulatoryType" | "stock">
) {
  return (
    product.isActive &&
    product.isPublicVisible &&
    product.allowsOnlineOrder &&
    !product.isControlled &&
    product.regulatoryType !== "CONTROLLED_MEDICINE" &&
    product.stock > 0
  );
}

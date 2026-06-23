import type { Product, RegulatoryType } from "@prisma/client";

export const regulatoryLabels: Record<RegulatoryType, string> = {
  COMMON_PRODUCT: "Produto comum",
  OTC_MEDICINE: "Medicamento isento de prescricao",
  PRESCRIPTION_MEDICINE: "Medicamento com prescricao",
  CONTROLLED_MEDICINE: "Medicamento controlado"
};

export function regulatoryNotice(product: Pick<Product, "regulatoryType" | "requiresPrescription" | "isControlled">) {
  if (product.regulatoryType === "CONTROLLED_MEDICINE" || product.isControlled) {
    return "Produto controlado. Consulte a farmacia para orientacao e disponibilidade.";
  }

  if (product.regulatoryType === "PRESCRIPTION_MEDICINE" || product.requiresPrescription) {
    return "A dispensacao depende da apresentacao e avaliacao da receita pelo farmaceutico.";
  }

  if (product.regulatoryType === "OTC_MEDICINE") {
    return "Use medicamentos com responsabilidade. Em caso de duvida, fale com o farmaceutico.";
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

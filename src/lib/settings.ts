import { prisma } from "@/lib/db";

export async function getPharmacySettings() {
  const existing = await prisma.pharmacySettings.findFirst();

  if (existing) {
    return existing;
  }

  return prisma.pharmacySettings.create({
    data: {
      tradeName: "Farmed",
      whatsapp: process.env.PHARMACY_WHATSAPP,
      institutionalText:
        "Farmácia brasileira com atendimento próximo, catálogo online e suporte farmacêutico para orientar sua compra com segurança.",
      sanitaryNotice:
        "Medicamentos devem ser usados com orientação adequada. A dispensação de produtos sujeitos a prescrição depende da avaliação do farmacêutico."
    }
  });
}

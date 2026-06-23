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
        "Farmacia brasileira com atendimento proximo, catalogo online e suporte farmaceutico para orientar sua compra com seguranca.",
      sanitaryNotice:
        "Medicamentos devem ser usados com orientacao adequada. A dispensacao de produtos sujeitos a prescricao depende da avaliacao do farmaceutico."
    }
  });
}

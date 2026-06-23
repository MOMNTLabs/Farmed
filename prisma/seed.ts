import { hash } from "bcryptjs";
import { PrismaClient, RegulatoryType } from "@prisma/client";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@farmed.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash: await hash(adminPassword, 12)
    }
  });

  await prisma.pharmacySettings.upsert({
    where: { id: "default-settings" },
    update: {},
    create: {
      id: "default-settings",
      tradeName: "Farmed",
      legalName: "Farmed Farmacia Ltda.",
      cnpj: "00.000.000/0001-00",
      address: "Rua Principal, 100",
      city: "Sao Paulo",
      state: "SP",
      phone: "(11) 3000-0000",
      whatsapp: process.env.PHARMACY_WHATSAPP || "5511999999999",
      email: "contato@farmed.local",
      openingHours: "Segunda a sexta, 8h as 19h. Sabado, 8h as 13h.",
      pharmacistName: "Responsavel Tecnico",
      pharmacistCrf: "CRF-SP 00000",
      institutionalText:
        "A Farmed atende a comunidade com produtos de saude, higiene, beleza e medicamentos, combinando atendimento presencial com pedidos online via WhatsApp.",
      whatsappDefaultText: "Ola, gostaria de atendimento da Farmed.",
      sanitaryNotice:
        "Medicamentos sujeitos a prescricao so serao dispensados apos apresentacao e avaliacao da receita pelo farmaceutico."
    }
  });

  const categoryNames = ["Medicamentos", "Higiene", "Dermocosmeticos", "Vitaminas"];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { name, slug: slugify(name), isActive: true }
      })
    )
  );

  const brand = await prisma.brand.upsert({
    where: { slug: "farmed" },
    update: {},
    create: { name: "Farmed", slug: "farmed", isActive: true }
  });

  const products = [
    {
      commercialName: "Protetor Solar FPS 50",
      description: "Protetor solar facial para uso diario.",
      categoryId: categories[2].id,
      regulatoryType: RegulatoryType.COMMON_PRODUCT,
      price: "59.90",
      stock: 24,
      minimumStock: 5,
      isFeatured: true
    },
    {
      commercialName: "Paracetamol 750mg",
      description: "Medicamento isento de prescricao para alivio de dor e febre, conforme orientacao de bula.",
      categoryId: categories[0].id,
      regulatoryType: RegulatoryType.OTC_MEDICINE,
      activeIngredient: "Paracetamol",
      presentation: "750mg com 20 comprimidos",
      price: "18.50",
      stock: 32,
      minimumStock: 8,
      isFeatured: true
    },
    {
      commercialName: "Medicamento com prescricao exemplo",
      description: "Produto demonstrativo sujeito a prescricao e avaliacao farmaceutica.",
      categoryId: categories[0].id,
      regulatoryType: RegulatoryType.PRESCRIPTION_MEDICINE,
      requiresPrescription: true,
      activeIngredient: "Principio ativo exemplo",
      price: "42.90",
      stock: 10,
      minimumStock: 3,
      isFeatured: false
    },
    {
      commercialName: "Medicamento controlado exemplo",
      description: "Produto demonstrativo controlado, sem compra direta pelo site.",
      categoryId: categories[0].id,
      regulatoryType: RegulatoryType.CONTROLLED_MEDICINE,
      requiresPrescription: true,
      isControlled: true,
      allowsOnlineOrder: false,
      price: "0.00",
      stock: 0,
      minimumStock: 0,
      isFeatured: false
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: slugify(product.commercialName) },
      update: {},
      create: {
        ...product,
        slug: slugify(product.commercialName),
        brandId: brand.id,
        imageAlt: product.commercialName,
        isActive: true,
        isPublicVisible: true
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

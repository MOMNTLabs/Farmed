import { hash } from "bcryptjs";
import { PrismaClient, RegulatoryType } from "@prisma/client";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@farmed.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { isActive: true },
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash: await hash(adminPassword, 12)
    }
  });

  const existingSettings = await prisma.pharmacySettings.findUnique({
    where: { id: "default-settings" }
  });

  if (!existingSettings) {
    await prisma.pharmacySettings.create({
      data: {
        id: "default-settings",
        tradeName: "Farmed",
        legalName: "Farmed Farmácia Ltda.",
        cnpj: "00.000.000/0001-00",
        address: "Rua Principal, 100",
        city: "São Paulo",
        state: "SP",
        phone: "(11) 3000-0000",
        whatsapp: process.env.PHARMACY_WHATSAPP || "5511999999999",
        email: "contato@farmed.local",
        openingHours: "Segunda a sexta, 8h às 19h. Sábado, 8h às 13h.",
        pharmacistName: "Responsável Técnico",
        pharmacistCrf: "CRF-SP 00000",
        institutionalText:
          "A Farmed atende a comunidade com produtos de saúde, higiene, beleza e medicamentos, combinando atendimento presencial com pedidos online via WhatsApp.",
        whatsappDefaultText: "Olá, gostaria de atendimento da Farmed.",
        sanitaryNotice:
          "Medicamentos sujeitos a prescrição só serão dispensados após apresentação e avaliação da receita pelo farmacêutico."
      }
    });
  }

  const categoryNames = ["Medicamentos", "Higiene", "Dermocosméticos", "Vitaminas"];
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
      description: "Protetor solar facial para uso diário.",
      categoryId: categories[2].id,
      regulatoryType: RegulatoryType.COMMON_PRODUCT,
      price: "59.90",
      stock: 24,
      minimumStock: 5,
      isFeatured: true
    },
    {
      commercialName: "Paracetamol 750mg",
      description: "Medicamento isento de prescrição para alívio de dor e febre, conforme orientação de bula.",
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
      commercialName: "Medicamento com prescrição exemplo",
      description: "Produto demonstrativo sujeito a prescrição e avaliação farmacêutica.",
      categoryId: categories[0].id,
      regulatoryType: RegulatoryType.PRESCRIPTION_MEDICINE,
      requiresPrescription: true,
      activeIngredient: "Princípio ativo exemplo",
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
    const productData = {
      ...product,
      brandId: brand.id,
      imageAlt: product.commercialName,
      isActive: true,
      isPublicVisible: true
    };

    await prisma.product.upsert({
      where: { slug: slugify(product.commercialName) },
      update: {},
      create: {
        ...productData,
        slug: slugify(product.commercialName)
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

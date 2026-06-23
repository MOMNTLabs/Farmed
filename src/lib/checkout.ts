import { DeliveryMethod, OrderStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { canOrderOnline } from "@/lib/regulatory";

export const checkoutSchema = z.object({
  customerName: z.string().min(3, "Informe o nome completo."),
  whatsapp: z.string().min(10, "Informe um WhatsApp válido."),
  cpf: z.string().optional(),
  address: z.string().min(5, "Informe o endereço."),
  district: z.string().min(2, "Informe o bairro."),
  city: z.string().min(2, "Informe a cidade."),
  deliveryMethod: z.nativeEnum(DeliveryMethod),
  notes: z.string().optional(),
  prescriptionWillBeSent: z.boolean().default(false),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().positive()
      })
    )
    .min(1, "O carrinho está vazio.")
});

export async function createCheckoutOrder(input: z.infer<typeof checkoutSchema>) {
  const data = checkoutSchema.parse(input);
  const ids = data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: ids
      }
    }
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  const orderItems = data.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error("Produto indisponível.");
    }

    if (!canOrderOnline(product)) {
      throw new Error(`${product.commercialName} não permite pedido online.`);
    }

    if (item.quantity > product.stock) {
      throw new Error(`Estoque insuficiente para ${product.commercialName}.`);
    }

    const unitPrice = product.promotionalPrice ?? product.price;
    return {
      product,
      quantity: item.quantity,
      unitPrice,
      total: unitPrice.mul(item.quantity)
    };
  });

  const needsPrescription = orderItems.some(
    ({ product }) =>
      product.requiresPrescription || product.regulatoryType === "PRESCRIPTION_MEDICINE"
  );
  const subtotal = orderItems.reduce((total, item) => total.add(item.total), orderItems[0].total.mul(0));
  const number = `PED-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: {
        name: data.customerName,
        whatsapp: data.whatsapp,
        cpf: data.cpf || null,
        address: data.address,
        district: data.district,
        city: data.city
      }
    });

    const order = await tx.order.create({
      data: {
        number,
        customerId: customer.id,
        status: needsPrescription ? OrderStatus.WAITING_PRESCRIPTION : OrderStatus.NEW,
        deliveryMethod: data.deliveryMethod,
        address: data.address,
        district: data.district,
        city: data.city,
        notes: data.notes || null,
        needsPrescription,
        prescriptionWillBeSent: data.prescriptionWillBeSent,
        subtotal,
        items: {
          create: orderItems.map(({ product, quantity, unitPrice, total }) => ({
            productId: product.id,
            productName: product.commercialName,
            sku: product.sku,
            quantity,
            unitPrice,
            total
          }))
        },
        statusHistory: {
          create: {
            to: needsPrescription ? OrderStatus.WAITING_PRESCRIPTION : OrderStatus.NEW,
            note: "Pedido criado no checkout."
          }
        }
      }
    });

    return order;
  });
}

export async function debitOrderStock(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order || order.stockDebitedAt) return order;

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          orderId: order.id,
          type: "ORDER_APPROVAL",
          quantity: -item.quantity,
          note: `Baixa automática do pedido ${order.number}`
        }
      });
    }

    return tx.order.update({
      where: { id: order.id },
      data: {
        stockDebitedAt: new Date()
      }
    });
  });
}

import type { Order, OrderItem, Customer } from "@prisma/client";
import { formatCurrency, onlyDigits } from "@/lib/format";

type OrderWithDetails = Order & {
  customer: Customer;
  items: OrderItem[];
};

export function whatsappUrl(phone: string | null | undefined, message: string) {
  const digits = onlyDigits(phone ?? "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildOrderWhatsappMessage(order: OrderWithDetails) {
  const lines = [
    `Pedido ${order.number}`,
    "",
    `Cliente: ${order.customer.name}`,
    `WhatsApp: ${order.customer.whatsapp}`,
    order.customer.cpf ? `CPF: ${order.customer.cpf}` : null,
    `Entrega: ${order.deliveryMethod === "DELIVERY" ? "Entrega" : "Retirada"}`,
    `Endereco: ${order.address}, ${order.district}, ${order.city}`,
    "",
    "Itens:",
    ...order.items.map(
      (item) =>
        `- ${item.quantity}x ${item.productName} - ${formatCurrency(item.unitPrice.toString())} = ${formatCurrency(
          item.total.toString()
        )}`
    ),
    "",
    `Subtotal: ${formatCurrency(order.subtotal.toString())}`,
    order.prescriptionWillBeSent ? "Cliente informou que enviara receita." : null,
    order.notes ? `Observacoes: ${order.notes}` : null
  ].filter(Boolean);

  return lines.join("\n");
}

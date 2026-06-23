import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createCheckoutOrder } from "@/lib/checkout";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order = await createCheckoutOrder(body);
    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Dados inválidos." }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao criar pedido." }, { status: 400 });
  }
}

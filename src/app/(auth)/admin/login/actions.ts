"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { createAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    redirect("/admin/login?erro=1");
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    redirect("/admin/login?erro=1");
  }

  await createAdminSession(user.id);
  redirect("/admin");
}

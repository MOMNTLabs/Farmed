import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "farmed_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8;

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error("NEXTAUTH_SECRET deve ter pelo menos 24 caracteres.");
  }
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function encodeSession(userId: string) {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      expiresAt: Date.now() + MAX_AGE_SECONDS * 1000
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function decodeSession(value?: string) {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    userId: string;
    expiresAt: number;
  };

  if (!session.userId || session.expiresAt < Date.now()) {
    return null;
  }

  return session;
}

export async function createAdminSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
    path: "/"
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminUser() {
  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(COOKIE_NAME)?.value);
  if (!session) return null;

  return prisma.user.findFirst({
    where: {
      id: session.userId,
      isActive: true
    }
  });
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}

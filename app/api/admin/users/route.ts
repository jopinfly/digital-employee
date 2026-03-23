import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

function requireAdmin(role?: string) {
  return role !== "ADMIN";
}

// GET /api/admin/users
export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || requireAdmin(role)) return new Response("Forbidden", { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
  });
  return Response.json(users);
}

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(50),
  password: z.string().min(8).max(100),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});

// POST /api/admin/users — create user
export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || requireAdmin(role)) return new Response("Forbidden", { status: 403 });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return new Response(parsed.error.message, { status: 422 });

  const { email, name, password, role: newRole } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return Response.json({ error: "该邮箱已被注册" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, password: hashed, role: newRole },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
  });

  return Response.json(user, { status: 201 });
}

const updateSchema = z.object({
  id: z.string(),
  isActive: z.boolean().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  name: z.string().min(1).max(50).optional(),
});

// PATCH /api/admin/users — update user
export async function PATCH(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || requireAdmin(role)) return new Response("Forbidden", { status: 403 });

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return new Response(parsed.error.message, { status: 422 });

  const { id, ...updates } = parsed.data;

  // Prevent admin from disabling themselves
  if (id === (session.user.id as string) && updates.isActive === false) {
    return Response.json({ error: "不能禁用自己的账号" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: updates,
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
  });

  return Response.json(user);
}

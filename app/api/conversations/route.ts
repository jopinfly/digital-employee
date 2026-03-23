import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id as string },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: { id: true, title: true, model: true, updatedAt: true },
  });

  return Response.json(conversations);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { id } = await req.json();
  if (!id) return new Response("Bad Request", { status: 400 });

  const conv = await prisma.conversation.findUnique({ where: { id } });
  if (!conv || conv.userId !== (session.user.id as string)) {
    return new Response("Not Found", { status: 404 });
  }

  await prisma.conversation.delete({ where: { id } });
  return Response.json({ ok: true });
}

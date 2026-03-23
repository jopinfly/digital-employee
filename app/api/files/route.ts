import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/blob";
import { NextRequest } from "next/server";

// GET /api/files - list user files
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const files = await prisma.file.findMany({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(files);
}

// POST /api/files - upload file
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const userId = session.user.id as string;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return new Response("No file provided", { status: 400 });

  // Limit file size to 10MB
  if (file.size > 10 * 1024 * 1024) {
    return new Response("File too large (max 10MB)", { status: 413 });
  }

  const uploaded = await uploadFile(file, userId);

  const saved = await prisma.file.create({
    data: {
      userId,
      name: uploaded.name,
      url: uploaded.url,
      size: uploaded.size,
      mimeType: uploaded.mimeType,
    },
  });

  return Response.json(saved, { status: 201 });
}

// DELETE /api/files
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { id } = await req.json();
  const file = await prisma.file.findUnique({ where: { id } });
  if (!file || file.userId !== (session.user.id as string)) {
    return new Response("Not Found", { status: 404 });
  }

  await prisma.file.delete({ where: { id } });
  return Response.json({ ok: true });
}

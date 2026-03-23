import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { streamAgentResponse } from "@/lib/ai/agent";
import { NextRequest } from "next/server";
import { z } from "zod";

const chatSchema = z.object({
  message: z.string().min(1).max(32000),
  model: z.string().min(1),
  conversationId: z.string().optional(),
  useAgent: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id as string;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(parsed.error.message, { status: 422 });
  }

  const { message, model, conversationId, useAgent } = parsed.data;

  // Resolve or create conversation
  let convId = conversationId;
  if (!convId) {
    const conv = await prisma.conversation.create({
      data: {
        userId,
        model,
        title: message.slice(0, 60),
      },
    });
    convId = conv.id;
  } else {
    // Verify ownership
    const conv = await prisma.conversation.findUnique({ where: { id: convId } });
    if (!conv || conv.userId !== userId) {
      return new Response("Not Found", { status: 404 });
    }
    // Update model if changed
    if (conv.model !== model) {
      await prisma.conversation.update({ where: { id: convId }, data: { model } });
    }
  }

  // Save user message
  await prisma.message.create({
    data: { conversationId: convId, role: "user", content: message },
  });

  // Load history (last 20 messages)
  const history = await prisma.message.findMany({
    where: { conversationId: convId, role: { in: ["user", "assistant"] } },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  // Build history excluding the message we just saved (it's the latest)
  const historyPayload = history
    .slice(0, -1) // exclude the just-saved user message
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  // Stream response
  const encoder = new TextEncoder();
  let fullResponse = "";

  const stream = new ReadableStream({
    async start(controller) {
      // Send conversation ID first so client can navigate
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ conversationId: convId, type: "meta" })}\n\n`)
      );

      try {
        for await (const chunk of streamAgentResponse(model, historyPayload, message, useAgent)) {
          fullResponse += chunk;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: chunk, type: "chunk" })}\n\n`)
          );
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "未知错误";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: errMsg, type: "error" })}\n\n`)
        );
      } finally {
        // Save assistant message
        if (fullResponse) {
          await prisma.message.create({
            data: { conversationId: convId, role: "assistant", content: fullResponse },
          });
          // Update conversation updatedAt
          await prisma.conversation.update({
            where: { id: convId },
            data: { updatedAt: new Date() },
          });
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

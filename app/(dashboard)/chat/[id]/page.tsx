import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { SUPPORTED_MODELS, DEFAULT_MODEL } from "@/lib/ai/models";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ agent?: string; model?: string }>;
}

export default async function ChatPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const sp = await searchParams;

  // "new" → create a blank conversation client-side; real ID → load from DB
  let initialMessages: { id: string; role: string; content: string; createdAt: Date }[] = [];
  let initialModel = sp.model ?? DEFAULT_MODEL;
  let conversationId: string | null = null;

  if (id !== "new") {
    const conversation = await prisma.conversation.findUnique({
      where: { id, userId: session.user.id as string },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!conversation) redirect("/");

    initialMessages = conversation.messages;
    initialModel = conversation.model;
    conversationId = conversation.id;
  }

  return (
    <ChatInterface
      userId={session.user.id as string}
      conversationId={conversationId}
      initialMessages={initialMessages}
      initialModel={initialModel}
      supportedModels={SUPPORTED_MODELS}
      defaultUseAgent={sp.agent === "search"}
    />
  );
}

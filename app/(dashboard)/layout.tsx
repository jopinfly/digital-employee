import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { prisma } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id as string },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, title: true, model: true, updatedAt: true },
  });

  return (
    <div className="flex h-screen bg-[#09090b] overflow-hidden">
      <AppSidebar
        user={{
          id: session.user.id as string,
          email: session.user.email ?? "",
          name: session.user.name ?? null,
          role: (session.user as { role?: string }).role as "USER" | "ADMIN" ?? "USER",
        }}
        conversations={conversations}
      />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

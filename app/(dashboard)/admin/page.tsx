import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { UserManagement } from "@/components/admin/UserManagement";

export default async function AdminPage() {
  const session = await auth();
  const userRole = (session?.user as { role?: string })?.role;
  if (!session?.user || userRole !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">用户管理</h1>
          <p className="text-zinc-500 text-sm mt-1">管理平台用户账号，新增或禁用账号</p>
        </div>
        <UserManagement initialUsers={users} />
      </div>
    </div>
  );
}

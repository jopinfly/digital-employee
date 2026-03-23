import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@company.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123456";
  const adminName = process.env.ADMIN_NAME ?? "Administrator";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log("Admin account already exists:", adminEmail);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin account created:", adminEmail);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

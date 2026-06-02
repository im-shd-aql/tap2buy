import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const phone = "0766489119";

  let user = await prisma.user.findUnique({ where: { phone } });

  if (user) {
    user = await prisma.user.update({
      where: { phone },
      data: { role: "superadmin" },
    });
    console.log(`✓ Promoted existing user "${user.name || user.phone}" to superadmin`);
  } else {
    user = await prisma.user.create({
      data: {
        phone,
        name: "Super Admin",
        role: "superadmin",
      },
    });
    console.log(`✓ Created new superadmin user with phone ${phone}`);
  }

  console.log(`  ID: ${user.id}`);
  console.log(`  Phone: ${user.phone}`);
  console.log(`  Role: ${user.role}`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

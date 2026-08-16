import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding LinkHub clean database...');

  // 1. Create Default Base Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@linkhub.com' },
    update: {},
    create: {
      email: 'admin@linkhub.com',
      name: 'Administrador LinkHub',
      passwordHash,
      phone: '+504 9999-8888',
    },
  });

  // 2. Create Base Company
  const company = await prisma.company.upsert({
    where: { inviteCode: 'LINK-SAFE1' },
    update: {},
    create: {
      name: 'LinkHub Soluciones Tecnológicas',
      taxId: '08011995123456',
      phone: '+504 2233-4455',
      email: 'contacto@linkhub.com',
      address: 'Barrio El Centro, Calle Principal #102',
      inviteCode: 'LINK-SAFE1',
    },
  });

  // Assign membership
  await prisma.companyMember.upsert({
    where: { userId_companyId: { userId: adminUser.id, companyId: company.id } },
    update: { role: 'OWNER' },
    create: {
      userId: adminUser.id,
      companyId: company.id,
      role: 'OWNER',
    },
  });

  // Clear demo operational data (Clients, WorkOrders, Reports, Products)
  await prisma.reportMaterial.deleteMany({});
  await prisma.workReport.deleteMany({});
  await prisma.inspectionDiagnostic.deleteMany({});
  await prisma.workOrder.deleteMany({});
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.client.deleteMany({});

  console.log('Clean seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const coLeaderPassword = await bcrypt.hash('password123', 10);
  const leaderPassword = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      email: 'coleader@example.com',
      password: coLeaderPassword,
      role: 'co_leader',
    },
  });

  await prisma.user.create({
    data: {
      email: 'leader@example.com',
      password: leaderPassword,
      role: 'leader',
    },
  });

  // Create sample projects from requirements
  await prisma.project.createMany({
    data: [
      {
        project_name: 'fredtodd04',
        project_id: 'FO214A4D4E7C4',
        profile: 'leadsbridge',
        notes: 'Final handover',
        deadline: new Date(new Date().getFullYear(), 2, 31), // March 31
        client_status: 'Active',
        last_seen_info: '17 hours ago',
        last_update: 'Final delivery',
      },
      {
        project_name: 'julienmts',
        project_id: 'FO528F4552DC7',
        profile: 'leadsbridge',
        notes: 'Last milestone',
        deadline: new Date(new Date().getFullYear(), 2, 31), // March 31
        client_status: 'Inactive',
        last_seen_info: 'last seen earlier',
        last_update: 'Backend done',
      },
    ],
  });

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

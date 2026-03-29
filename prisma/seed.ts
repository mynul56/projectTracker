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

  // Helper to create date from current year
  const getYearDate = (month: number, day: number) => new Date(2026, month - 1, day);

  // Create sample projects from user request
  await prisma.project.createMany({
    data: [
      {
        project_name: 'fredtodd04',
        project_id: 'FO214A4D4E7C4',
        profile: 'leadsbridge',
        last_update: 'March 26',
        deadline: getYearDate(3, 31),
        client_status: 'Active',
        last_seen_info: '17 hours ago',
        notes: 'Final delivery and handover',
      },
      {
        project_name: 'talmichael530',
        project_id: 'FO6302071F9C8',
        profile: 'leadsbridge',
        last_update: '26 March',
        deadline: getYearDate(3, 31),
        client_status: 'Active',
        last_seen_info: '39 min ago',
        notes: 'Changes in UI',
      },
      {
        project_name: 'basione',
        project_id: 'FO22276D7E188',
        profile: 'leadbridge',
        last_update: '26 March',
        deadline: getYearDate(4, 15),
        client_status: 'Active',
        last_seen_info: '17 hours ago',
        notes: '2nd milestone',
      },
      {
        project_name: 'julienmts',
        project_id: 'FO528F4552DC7',
        profile: 'leadsbridge',
        last_update: '26 March',
        deadline: getYearDate(3, 31),
        client_status: 'Inactive',
        last_seen_info: '19 tarik active chilo',
        notes: 'Last milestone backend',
      },
      {
        project_name: 'sabledreams',
        project_id: 'FO71B8227A181',
        profile: 'leadsbridge',
        last_update: '27 March follow up',
        deadline: getYearDate(12, 31), // "Not started" - setting far future
        client_status: 'Active',
        last_seen_info: '20 hours ago',
        notes: 'Project is in initial stage',
      },
      {
        project_name: 'princem111',
        project_id: 'FO821D8F23882',
        profile: 'leadsbridge',
        last_update: 'March 26',
        deadline: getYearDate(5, 30),
        client_status: 'Active',
        last_seen_info: '7 hours ago',
        notes: 'Ad on running keep in first priority',
      },
      {
        project_name: 'mimi956',
        project_id: 'FO1DCD6BCF43',
        profile: 'leadsbridge',
        last_update: 'Cancelled',
        deadline: getYearDate(12, 31),
        client_status: 'Cancelled',
        last_seen_info: '',
        notes: '',
      },
      {
        project_name: 'James Green',
        project_id: '42619794',
        profile: 'upwork',
        last_update: '',
        deadline: getYearDate(12, 31),
        client_status: 'Active',
        last_seen_info: '',
        notes: '',
      },
      {
        project_name: 'luckyteeguarden',
        project_id: 'FO214AF65B2C4',
        profile: 'pro_sphere',
        last_update: '27 March',
        deadline: getYearDate(4, 8),
        client_status: 'Inactive',
        last_seen_info: '3 days ago',
        notes: 'Modification list needed client is sick',
      },
      {
        project_name: 'whatsrealeasy',
        project_id: 'FO5292F54BCC7',
        profile: 'dhaka_express',
        last_update: '27 March',
        deadline: getYearDate(4, 10),
        client_status: 'Active',
        last_seen_info: '10 hours ago',
        notes: 'In progress ekta rivision ekta',
      },
      {
        project_name: 'dominicember555',
        project_id: 'FO71B9D769781',
        profile: 'dot_slice',
        last_update: 'March 26',
        deadline: getYearDate(5, 25),
        client_status: 'Active',
        last_seen_info: '13 hours ago',
        notes: 'Full project',
      },
      {
        project_name: 'caringhandsinc',
        project_id: 'FO42194FEE606',
        profile: 'Dev verse',
        last_update: 'March 27',
        deadline: getYearDate(4, 1),
        client_status: 'Active',
        last_seen_info: '20 hours ago',
        notes: 'In revision in progress',
      },
      {
        project_name: 'muddpuddles001',
        project_id: 'FO63030A8FD48',
        profile: 'teamcodex',
        last_update: '24 March',
        deadline: getYearDate(3, 31),
        client_status: 'Inactive',
        last_seen_info: '4 days ago',
        notes: 'N8n project',
      },
      {
        project_name: 'akash6280',
        project_id: 'FO3DC89B5141',
        profile: 'xpeed_studio',
        last_update: 'March 27',
        deadline: getYearDate(3, 30),
        client_status: 'Active',
        last_seen_info: '3 hours ago',
        notes: 'N8n project',
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

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 10);
   await prisma.usuario.upsert({
    where: { email: 'admin@systemsafety.com' },
    update: {},
    create: {
      nombre: 'Superadministrador',
      email: 'admin@systemsafety.com',
      passwordHash,
      rol: 'SUPERADMIN',
    },
  });
  console.log('Superadmin listo');
}

main().finally(() => prisma.$disconnect());
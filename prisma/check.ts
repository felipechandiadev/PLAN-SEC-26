import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma-client/client.ts';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const dbUrl = new URL(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: dbUrl.hostname,
    port: Number(dbUrl.port),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace(/^\//, ''),
    ssl: { rejectUnauthorized: false },
    connectTimeout: 30000,
    acquireTimeout: 30000,
  }),
});

async function main() {
  const count = await prisma.activity.count();
  console.log('activity count', count);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
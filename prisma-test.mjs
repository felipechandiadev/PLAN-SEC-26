import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log('Conectando a Prisma...');

  const nuevo = await prisma.activity.create({
    data: {
      name: 'Rondas Fiscalización Sectores Residenciales',
      institution: 'dspm',
      type: 'operativo_autonomo',
      date: new Date('2026-01-01'),
      justification: 'Aumento presencia inspectores en zonas residenciales.',
      start_time: '08:00',
      end_time: '10:00',
      responsible: 'dspm',
      other_institutions: ['dspm','carabineros','gendarmeria','oln','pdi','sag','seguridad_retiro','senda','slep'],
      category: 'Operativos de Patrullaje y Vigilancia',
      subtype: 'operativo_autonomo',
      status: 'planificado',
      frequency: 'diaria',
      meta: 'N/A'
    }
  });

  console.log('Registro creado:', nuevo);

  const tasks = await prisma.activity.findMany();
  console.log('Total Activities:', tasks.length);
  console.log(tasks);
}

main()
  .catch((e) => {
    console.error('Error Prisma:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

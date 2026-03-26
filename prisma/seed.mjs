import { PrismaClient } from '../src/generated/prisma-client/client.ts';
import fs from 'fs/promises';

const prisma = new PrismaClient();

const activityTypeToCategory = {
  operativo_intersectorial: 'Operativos de Patrullaje y Vigilancia',
  operativo_autonomo: 'Operativos de Patrullaje y Vigilancia',
  operativo_especializado: 'Operativos de Patrullaje y Vigilancia',
  operativo_coordinado: 'Operativos de Control y Fiscalización',
  gestion_comunitaria: 'Gestión Comunitaria y Preventiva',
  mesa_territorial: 'Gestión Comunitaria y Preventiva',
  jornada_formativa: 'Gestión Comunitaria y Preventiva',
  operativo_tematico: 'Operativos Estacionales o Temáticos',
  otra: 'Operativos Estacionales o Temáticos',
};

function normalizeAct(act) {
  const dateString = act.fecha || (act.fechas && act.fechas[0]) || '2026-01-01';
  const date = new Date(dateString);
  const tipo = act.tipo || act.subtipo || 'operativo_autonomo';
  return {
    name: act.nombre || 'Sin nombre',
    institution: act.institucion || act.responsable || 'dspm',
    type: tipo,
    date: isNaN(date.getTime()) ? new Date('2026-01-01') : date,
    justification: act.justificacion || act.justification || '',
    start_time: act.hora_inicio || act.start_time || '08:00',
    end_time: act.hora_fin || act.end_time || '10:00',
    responsible: act.responsable || act.institucion || 'dspm',
    other_institutions: act.otras_instituciones || act.other_institutions || [act.institucion || act.responsable || 'dspm'],
    category: act.categoria || activityTypeToCategory[tipo] || 'Operativos de Patrullaje y Vigilancia',
    subtype: act.subtipo || tipo,
    status: act.estado || act.status || 'planificado',
    frequency: act.frecuencia || act.frequency || 'diaria',
    meta: act.meta || 'N/A',
  };
}

async function main() {
  console.log('Seed: borrando activities existentes...');
  await prisma.activity.deleteMany();

  console.log('Seed: cargando plan-calendario-diario.json...');
  const payload = JSON.parse(await fs.readFile('./plan-calendario-diario.json', 'utf-8'));

  const insertData = [];

  for (const mes of payload.meses || []) {
    for (const dia of mes.dias || []) {
      for (const act of dia.actividades || []) {
        insertData.push(normalizeAct(act));
      }
    }
  }

  console.log(`Seed: insertando ${insertData.length} actividades...`);
  for (const act of insertData) {
    await prisma.activity.create({ data: act });
  }

  const count = await prisma.activity.count();
  console.log(`Seed completo: ${count} actividades creadas.`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

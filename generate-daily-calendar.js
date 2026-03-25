#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer el JSON original
const planData = JSON.parse(fs.readFileSync(path.join(__dirname, 'plan.json'), 'utf8'));

// Obtener datos del calendario original
const { calendario } = planData.planificacion_anual;

// Crear estructura de salida
const output = {
  proyecto: "Parral Seguro 2026",
  comuna: "Parral",
  direccion: "Dirección de Seguridad Pública (DSPM)",
  ano: 2026,
  meses: []
};

// Procesar cada mes
calendario.forEach((mes, monthIndex) => {
  const diasEnMes = new Date(2026, monthIndex + 1, 0).getDate();
  const mesObj = {
    numero_mes: mes.numero_mes,
    nombre: mes.mes,
    programa_mensual: mes.programa_mensual,
    contexto: mes.contexto,
    dias: []
  };

  // Crear estructura para cada día del mes
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fechaStr = `2026-${String(monthIndex + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const diaObj = {
      dia: dia,
      fecha: fechaStr,
      actividades: []
    };

    // Buscar todas las actividades que aplican a este día
    mes.actividades.forEach(actividad => {
      let aplicaAEsteDia = false;

      // Verificar si es un rango de fechas
      if (actividad.fecha_rango) {
        const rango = actividad.fecha_rango.split('-');
        const inicio = parseInt(rango[0]) || 1;
        const fin = parseInt(rango[1]) || diasEnMes;
        if (dia >= inicio && dia <= fin) {
          aplicaAEsteDia = true;
        }
      }
      // Verificar si es en fechas específicas
      else if (actividad.fechas && Array.isArray(actividad.fechas)) {
        if (actividad.fechas.includes(fechaStr)) {
          aplicaAEsteDia = true;
        }
      }

      // Si aplica, agregar a las actividades del día
      if (aplicaAEsteDia) {
        diaObj.actividades.push({
          id: actividad.id,
          nombre: actividad.nombre,
          institucion: actividad.institucion,
          tipo: actividad.tipo || "operativo_general",
          fecha: fechaStr,
          justificacion: actividad.justificacion || ""
        });
      }
    });

    mesObj.dias.push(diaObj);
  }

  output.meses.push(mesObj);
});

// Escribir el archivo de salida
fs.writeFileSync(path.join(__dirname, 'plan-calendario-diario.json'), JSON.stringify(output, null, 2));
console.log('✅ plan-calendario-diario.json generado exitosamente');
console.log(`   Meses procesados: ${output.meses.length}`);

let totalDias = 0;
let totalActividades = 0;
output.meses.forEach(mes => {
  totalDias += mes.dias.length;
  mes.dias.forEach(dia => {
    totalActividades += dia.actividades.length;
  });
});

console.log(`   Total de días: ${totalDias}`);
console.log(`   Total de actividades mapeadas: ${totalActividades}`);

# Mejoras Propuestas al JSON - Transparencia en Ejecución de Actividades

## Diagnóstico Actual

El JSON actual tiene **dos capas de actividades**:

### 1. **Operativos Recurrentes (DSPM Solo)**
- `patrullajes_mixtos` → DSPM ejecuta diariamente
- `control_acceso` → DSPM con Carabineros  
- `comercio_informal` → Inspectores Municipales con DSPM
- `rondas_alto_impacto` → DSPM coordina

### 2. **Hitos Institucionales (Intersectoriales)**
- SENDA → Mesas, charlas
- SAG → Abigeato
- SLEP → Coordinación escolar
- PDI → Extranjería, delitos
- OLN/Niñez → Intervenciones

**Problema:** No queda claro en la matriz que:
- Los operativos recurrentes son ejecutados por DSPM
- Los hitos son coordinados por DSPM pero con otras instituciones

## Solución Propuesta

Mejorar el JSON agregando campos explícitos:

```json
{
  "mes": "Enero",
  "programa": "Ruta Segura",
  
  // OPERATIVOS QUE EJECUTA DSPM SOLA:
  "operativos_dspm": {
    "patrullajes_mixtos": {
      "frecuencia": "Diarios (1 al 31)",
      "ejecutor": "DSPM",
      "tipo": "operativo_interno"
    },
    "rondas_alto_impacto": {
      "fechas": ["2026-01-10", "2026-01-24"],
      "ejecutor": "DSPM",
      "tipo": "operativo_interno"
    }
  },
  
  // ACTIVIDADES COORDINADAS (DSPM coordina con otras instituciones):
  "actividades_coordinadas": [
    {
      "institucion_lider": "SENDA",
      "coordinador_local": "DSPM",
      "fecha": "2026-01-15",
      "descripcion": "Mesa Territorial N°1: Coordinación anti-drogas",
      "tipo": "intersectorial",
      "instituciones_participantes": ["DSPM", "SENDA", "Salud"]
    },
    {
      "institucion_lider": "SAG",
      "coordinador_local": "DSPM",
      "fecha": "2026-01-10",
      "descripcion": "Operativo Abigeato N°1",
      "tipo": "intersectorial",
      "instituciones_participantes": ["DSPM", "SAG", "Carabineros"]
    }
  ]
}
```

## Cambios en la Matriz Gantt

Con esta estructura mejorada, la matriz mostrará:

| Operativo | Ene | Feb | Mar | ... |
|-----------|-----|-----|-----|-----|
| **DSPM - Patrullaje Mixto** | ✓ Diario | ✓ Diario | ✓ Diario |
| **DSPM - Rondas Alto Impacto** | 10,24 | 07,21 | 06,20 |
| **[COORDINADO] SENDA - Mesa Territorial** | — | 12 | 18 |
| **[COORDINADO] SAG - Abigeato** | 10 | — | — |

Las actividades coordinadas mostrarán un icono 🔗 o etiqueta para indicar que es intersectorial.

## Implementación

1. ✅ Actualizar plan.json con nueva estructura
2. ✅ Actualizar dataLoader.js para procesar ambas secciones
3. ✅ Actualizar MatrizGanttView.js para mostrar "(Coordinado)" en actividades intersectoriales
4. ✅ Actualizar colores en Leyenda si es necesario

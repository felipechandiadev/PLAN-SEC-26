/**
 * Transformar datos del plan-calendario-diario.json a formato Gantt
 * Nueva estructura: Mes → Día → Actividades (estructura diaria)
 * AGRUPAMIENTO: DSPM SOLO → DSPM CONJUNTA → Otras Instituciones
 */
export async function loadPlanData() {
    try {
        const response = await fetch('/plan-calendario-diario.json');
        const plan = await response.json();
        return transformPlanToGantt(plan);
    } catch (error) {
        console.error('Error cargando plan-calendario-diario.json:', error);
        return { meses: [], operativos: [], propositos: {} };
    }
}

function transformPlanToGantt(plan) {
    // Referencia de instituciones (desde plan.json original)
    const instituciones = {
        dspm: { nombre: "Dirección de Seguridad Pública", color_clase: "bg-blue-600", abreviacion: "DSPM" },
        carabineros: { nombre: "Carabineros de Chile", color_clase: "bg-green-500", abreviacion: "CARAB" },
        senda: { nombre: "SENDA", color_clase: "bg-amber-500", abreviacion: "SENDA" },
        sag: { nombre: "SAG", color_clase: "bg-red-600", abreviacion: "SAG" },
        slep: { nombre: "SLEP", color_clase: "bg-purple-600", abreviacion: "SLEP" },
        pdi: { nombre: "PDI", color_clase: "bg-indigo-600", abreviacion: "PDI" },
        gendarmeria: { nombre: "Gendarmería de Chile", color_clase: "bg-gray-700", abreviacion: "GEND" },
        oln: { nombre: "OLN (Niñez)", color_clase: "bg-pink-500", abreviacion: "OLN" },
        seguridad_retiro: { nombre: "Seguridad Comuna Retiro", color_clase: "bg-orange-600", abreviacion: "RETIRO" }
    };
    
    const mapeoPropositos = {
        "0.0": "Coordinación Transversal",
        "1.1": "Rondas Fiscalización Residencial",
        "1.3": "Rondas Alto Impacto Sectores Identificados",
        "1.4": "Control de Acceso / Identidad en Zonas Críticas",
        "2.1": "Mesas Territoriales SENDA (8 anuales)",
        "2.2": "Levantamiento Factores Riesgo / Caracterización",
        "2.3": "Charlas Prevención Drogas (12 anuales)",
        "3.1": "Fiscalización Comercio Informal",
        "3.2": "Recuperación Áreas Críticas",
        "3.3": "Rondas Nocturnas Patrullas Mixtas (Diarias)",
        "3.4": "Operativos Abigeato (6 anuales)"
    };
    
    // Extraer meses del nuevo formato
    const meses = plan.meses.map((mes) => ({
        id: getMonthShortName(mes.numero_mes - 1),
        nombre: mes.nombre,
        numero: mes.numero_mes,
        programa: mes.programa_mensual,
        contexto: mes.contexto
    }));
    
    // Mapeo de colores por institución
    const colorMap = {};
    Object.entries(instituciones).forEach(([key, inst]) => {
        colorMap[key] = inst.color_clase || "bg-slate-600";
    });
    
    // NUEVA ESTRUCTURA: Agrupar actividades por institución y mes
    const institucionesMap = new Map();
    
    // PASO 1: Crear fila para DSPM SOLO (inicialmente vacía)
    institucionesMap.set('dspm_solo', {
        key: 'dspm_solo',
        nombre: 'DSPM',
        abreviacion: 'DSPM',
        color: colorMap['dspm'] || "bg-slate-600",
        isDspmRow: true,
        ejecucion: 'SOLO',
        actividades: Array(12).fill([])
    });
    
    // PASO 2: Procesar meses y días para recolectar actividades
    plan.meses.forEach((mes, mesIndex) => {
        if (!mes.dias || !Array.isArray(mes.dias)) return;
        
        // Recolectar actividades únicas por institución en este mes
        // IMPORTANTE: Agrupar múltiples instancias de la misma actividad por ID para recolectar TODOS los días
        const actividadesPorInstitucion = new Map();
        
        mes.dias.forEach((dia) => {
            if (!dia.actividades || !Array.isArray(dia.actividades)) return;
            
            dia.actividades.forEach((actividad) => {
                const instKey = actividad.institucion || "sin_definir";
                
                // Evitar duplicados: usar ID de actividad como clave única
                if (!actividadesPorInstitucion.has(instKey)) {
                    actividadesPorInstitucion.set(instKey, new Map());
                }
                
                const mapActividades = actividadesPorInstitucion.get(instKey);
                if (!mapActividades.has(actividad.id)) {
                    // Primera instancia: crear con array de fechas
                    mapActividades.set(actividad.id, {
                        ...actividad,
                        _fechas_recolectadas: [actividad.fecha]
                    });
                } else {
                    // Actividad ya existe en este mes: agregar la fecha a la lista
                    const actExistente = mapActividades.get(actividad.id);
                    if (actividad.fecha && !actExistente._fechas_recolectadas.includes(actividad.fecha)) {
                        actExistente._fechas_recolectadas.push(actividad.fecha);
                    }
                }
            });
        });
        
        // Procesar actividades únicas por institución
        actividadesPorInstitucion.forEach((mapActividades, instKey) => {
            mapActividades.forEach((actividad) => {
                // Para DSPM, asumir SOLO ya que el nuevo JSON no diferencia CONJUNTA
                // (La coordinación está implícita en la institución de la actividad)
                if (instKey === 'dspm') {
                    const actividadTransformada = transformActividad(actividad, mapeoPropositos);
                    const institucion = institucionesMap.get('dspm_solo');
                    institucion.actividades[mesIndex] = [...(institucion.actividades[mesIndex] || []), actividadTransformada];
                } else {
                    // Otras instituciones
                    if (!institucionesMap.has(instKey)) {
                        institucionesMap.set(instKey, {
                            key: instKey,
                            nombre: instituciones[instKey]?.nombre || instKey,
                            abreviacion: instituciones[instKey]?.abreviacion || instKey.toUpperCase(),
                            color: colorMap[instKey] || "bg-slate-600",
                            isDspmRow: false,
                            actividades: Array(12).fill([])
                        });
                    }
                    
                    const actividadTransformada = transformActividad(actividad, mapeoPropositos);
                    const institucion = institucionesMap.get(instKey);
                    institucion.actividades[mesIndex] = [...(institucion.actividades[mesIndex] || []), actividadTransformada];
                }
            });
        });
    });
    
    // PASO 3: Convertir map a array con orden: DSPM SOLO, luego todas las demás instituciones ordenadas
    const operativos = [];
    
    // Agregar DSPM SOLO primero
    if (institucionesMap.has('dspm_solo')) {
        operativos.push(institucionesMap.get('dspm_solo'));
    }
    
    // Agregar todas las demás instituciones ordenadas alfabéticamente
    Array.from(institucionesMap.entries())
        .filter(([key]) => key !== 'dspm_solo')
        .sort((a, b) => a[1].nombre.localeCompare(b[1].nombre))
        .forEach(([, inst]) => operativos.push(inst));
    
    return { meses, operativos, propositos: mapeoPropositos };
}

function transformActividad(actividad, mapeoPropositos) {
    // Recolectar todas las fechas donde se ejecuta la actividad
    // (puede tener múltiples instancias en diferentes días del mismo mes)
    const fechasRecolectadas = actividad._fechas_recolectadas || (actividad.fecha ? [actividad.fecha] : []);
    
    // Ordenar fechas y extraer días para mostrar
    const diasUnicos = [...new Set(
        fechasRecolectadas
            .map(f => new Date(f).getDate())
            .filter(d => !isNaN(d))
    )].sort((a, b) => a - b);
    
    // Manejo del fecha_rango: si es diario (todos los días disponibles), mostrar rango
    let fechaRango = "01-31"; // por defecto, todo el mes si no hay información
    
    if (diasUnicos.length > 0) {
        const minDia = diasUnicos[0];
        const maxDia = diasUnicos[diasUnicos.length - 1];
        fechaRango = `${minDia}-${maxDia}`;
    }
    
    return {
        id: actividad.id,
        nombre: actividad.nombre,
        tipo: actividad.tipo || "operativo",
        proposito: "0.0", // Sin información en el nuevo JSON
        proposito_nombre: "Actividad Programada",
        ejecucion: "SOLO", // Asumimos SOLO por defecto en el nuevo JSON
        frecuencia: "puntual", // Sin información específica en el nuevo JSON
        fecha_rango: fechaRango,
        horario: "",
        fechas: fechasRecolectadas, // Array de TODAS las fechas donde se ejecuta
        diasUnicos: diasUnicos, // Array de días únicos (para renderizado de cuadraditos)
        coordinacion_con: [],
        meta: "N/A",
        justificacion: actividad.justificacion || ""
    };
}

function getMonthShortName(index) {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months[index];
}

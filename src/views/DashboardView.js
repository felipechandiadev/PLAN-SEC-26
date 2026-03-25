/**
 * Vista Dashboard Ejecutivo - Análisis de Actividades 2026
 * Basado en actividades categorizadas, no en operativos
 */

export async function createDashboardView() {
    const container = document.createElement('div');
    container.className = 'space-y-6';
    
    try {
        // Cargar plan JSON directamente para extraer actividades
        const response = await fetch('/plan-calendario-diario.json');
        const plan = await response.json();
        
        if (!plan || !plan.meses) {
            throw new Error('No se pudieron cargar los datos del plan');
        }
        
        // Extraer y analizar actividades
        const actividadesAnalisis = extractAndAnalyzeActivities(plan);
        
        // Panel de resumen de actividades
        const summaryPanel = createActivitySummary(actividadesAnalisis);
        container.appendChild(summaryPanel);
        
        // Actividades por categoría/tipo
        const categoryPanel = createCategoryPanel(actividadesAnalisis);
        container.appendChild(categoryPanel);
        
        // Actividades detalladas con justificación
        const detailPanel = createDetailedActivitiesPanel(actividadesAnalisis);
        container.appendChild(detailPanel);
        
        // Distribución por institución ejecutora
        const institutionPanel = createInstitutionExecutorPanel(actividadesAnalisis);
        container.appendChild(institutionPanel);
        
        // Panel informativo
        const infoPanel = createInfoPanel(actividadesAnalisis);
        container.appendChild(infoPanel);
        
        return container;
    } catch (error) {
        console.error('Error en Dashboard:', error);
        container.innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                <h4 class="text-lg font-bold text-red-900 mb-2">Error cargando Dashboard</h4>
                <p class="text-red-800 text-sm">${error.message}</p>
            </div>
        `;
        return container;
    }
}

/**
 * Extrae y analiza actividades únicas del plan
 */
function extractAndAnalyzeActivities(plan) {
    const actividadesMap = new Map(); // Clave: nombre_actividad, Valor: { actividad, count, instituciones, meses }
    
    // Iterar todos los días de todos los meses
    plan.meses.forEach((mes, mesIndex) => {
        const mesNombre = mes.nombre;
        
        if (!mes.dias || !Array.isArray(mes.dias)) return;
        
        mes.dias.forEach(dia => {
            if (!dia.actividades || !Array.isArray(dia.actividades)) return;
            
            dia.actividades.forEach(actividad => {
                const clave = actividad.nombre; // Agrupar por nombre de actividad
                
                if (!actividadesMap.has(clave)) {
                    actividadesMap.set(clave, {
                        nombre: actividad.nombre,
                        tipo: actividad.tipo || 'sin_categorizar',
                        justificacion: actividad.justificacion || '',
                        instituciones: new Set(),
                        meses: new Set(),
                        ejecutiones: 0,
                        fechas: []
                    });
                }
                
                const dato = actividadesMap.get(clave);
                dato.instituciones.add(actividad.institucion || 'Sin institución');
                dato.meses.add(mesNombre);
                dato.ejecutiones++;
                dato.fechas.push({
                    mes: mesNombre,
                    dia: dia.dia,
                    fecha: dia.fecha
                });
            });
        });
    });
    
    // Categorías de tipos
    const categoriasPorTipo = {};
    const categoriasPorInstitucion = {};
    let totalActividadesUnicas = 0;
    
    actividadesMap.forEach((dato, nombre) => {
        totalActividadesUnicas++;
        
        // Contar por tipo
        if (!categoriasPorTipo[dato.tipo]) {
            categoriasPorTipo[dato.tipo] = 0;
        }
        categoriasPorTipo[dato.tipo]++;
        
        // Contar por institución
        dato.instituciones.forEach(inst => {
            if (!categoriasPorInstitucion[inst]) {
                categoriasPorInstitucion[inst] = 0;
            }
            categoriasPorInstitucion[inst]++;
        });
    });
    
    // Contar ejecuciones por mes
    const ejecucionesPorMes = {};
    plan.meses.forEach(mes => {
        ejecucionesPorMes[mes.nombre] = 0;
    });
    
    actividadesMap.forEach(dato => {
        dato.meses.forEach(mes => {
            ejecucionesPorMes[mes]++;
        });
    });
    
    return {
        actividadesUnicas: actividadesMap,
        totalActividades: totalActividadesUnicas,
        totalEjecuciones: Array.from(actividadesMap.values()).reduce((sum, d) => sum + d.ejecutiones, 0),
        categoriasPorTipo,
        categoriasPorInstitucion,
        ejecucionesPorMes,
        meses: plan.meses
    };
}

/**
 * Panel de resumen de actividades
 */
function createActivitySummary(analisis) {
    const panel = document.createElement('div');
    panel.className = 'grid grid-cols-1 md:grid-cols-4 gap-4';
    
    const cards = [
        {
            label: 'Actividades Únicas',
            value: analisis.totalActividades,
            gradient: 'from-blue-500 to-blue-600',
            icon: '📋'
        },
        {
            label: 'Total Ejecuciones',
            value: analisis.totalEjecuciones,
            gradient: 'from-green-500 to-green-600',
            icon: '✅'
        },
        {
            label: 'Categorías',
            value: Object.keys(analisis.categoriasPorTipo).length,
            gradient: 'from-purple-500 to-purple-600',
            icon: '🏷️'
        },
        {
            label: 'Instituciones',
            value: Object.keys(analisis.categoriasPorInstitucion).length,
            gradient: 'from-amber-500 to-amber-600',
            icon: '🏛️'
        }
    ];
    
    cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = `bg-gradient-to-br ${card.gradient} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer`;
        cardEl.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <div class="text-3xl font-bold">${card.value}</div>
                    <div class="text-sm opacity-90 mt-2">${card.label}</div>
                </div>
                <span class="text-3xl">${card.icon}</span>
            </div>
        `;
        panel.appendChild(cardEl);
    });
    
    return panel;
}

/**
 * Panel de categorías/tipos de actividades
 */
function createCategoryPanel(analisis) {
    const panel = document.createElement('div');
    panel.className = 'bg-white rounded-xl shadow-lg border border-slate-200 p-6';
    
    const title = document.createElement('h3');
    title.className = 'text-xl font-bold text-slate-800 mb-4';
    title.textContent = '🏷️ Actividades por Categoría de Tipo';
    panel.appendChild(title);
    
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    
    // Ordenar categorías por cantidad
    const sorted = Object.entries(analisis.categoriasPorTipo)
        .sort((a, b) => b[1] - a[1]);
    
    const maxCount = Math.max(...sorted.map(s => s[1]));
    
    sorted.forEach(([tipo, count]) => {
        // Obtener todas las actividades de este tipo
        const actividadesDelTipo = Array.from(analisis.actividadesUnicas.entries())
            .filter(([_, data]) => data.tipo === tipo)
            .sort((a, b) => b[1].ejecutiones - a[1].ejecutiones);
        
        const percentage = Math.round((count / maxCount) * 100);
        
        const tipoPretty = tipo
            .replace(/_/g, ' ')
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
        
        // Construir HTML del popup con actividades
        let popupHTML = '<div class="space-y-2 max-h-64 overflow-y-auto">';
        if (actividadesDelTipo.length > 0) {
            actividadesDelTipo.forEach(([nombre, data]) => {
                popupHTML += `
                    <div class="text-xs bg-slate-50 p-2 rounded border-l-2 border-blue-400">
                        <div class="font-bold text-slate-800">${nombre}</div>
                        <div class="text-slate-600 text-xs mt-1">${data.ejecutiones} ejecuciones</div>
                    </div>
                `;
            });
        } else {
            popupHTML += `<div class="text-xs text-slate-600 italic">Sin actividades registradas</div>`;
        }
        popupHTML += '</div>';
        
        const card = document.createElement('div');
        card.className = 'border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-blue-50 hover:to-blue-100 transition cursor-pointer relative group';
        card.innerHTML = `
            <div class="font-bold text-slate-800">${tipoPretty}</div>
            <div class="text-3xl font-bold text-blue-600 mt-2">${count}</div>
            <div class="mt-3 bg-slate-300 rounded-full h-2 overflow-hidden">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-full" style="width: ${percentage}%"></div>
            </div>
            <div class="text-xs text-slate-600 mt-2">${percentage}% del total</div>
            
            <!-- Popup de actividades -->
            <div class="absolute left-0 top-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg p-4 w-80 z-50 hidden group-hover:block">
                <div class="text-sm font-bold text-slate-800 mb-3">Actividades en esta categoría:</div>
                ${popupHTML}
            </div>
        `;
        grid.appendChild(card);
    });
    
    panel.appendChild(grid);
    return panel;
}

/**
 * Panel de actividades detalladas con justificación
 */
function createDetailedActivitiesPanel(analisis) {
    const panel = document.createElement('div');
    panel.className = 'bg-white rounded-xl shadow-lg border border-slate-200 p-6';
    
    const title = document.createElement('h3');
    title.className = 'text-xl font-bold text-slate-800 mb-4';
    title.textContent = '📝 Actividades Detalladas';
    panel.appendChild(title);
    
    const list = document.createElement('div');
    list.className = 'space-y-3 max-h-96 overflow-y-auto';
    
    // Ordenar por ejecuciones (frecuencia)
    const sorted = Array.from(analisis.actividadesUnicas.entries())
        .sort((a, b) => b[1].ejecutiones - a[1].ejecutiones)
        .slice(0, 15); // Mostrar top 15
    
    sorted.forEach(([nombre, dato]) => {
        const item = document.createElement('div');
        item.className = 'border-l-4 border-blue-400 bg-blue-50 p-4 rounded hover:bg-blue-100 transition';
        
        const instituciones = Array.from(dato.instituciones).join(', ');
        const meses = Array.from(dato.meses).length;
        
        item.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="font-bold text-slate-800">${nombre}</div>
                    <div class="text-xs text-slate-600 mt-1">
                        <strong>Ejecutada por:</strong> ${instituciones}
                    </div>
                    <div class="text-xs text-slate-700 mt-2 italic bg-white bg-opacity-50 p-2 rounded">
                        "${dato.justificacion}"
                    </div>
                </div>
                <div class="ml-4 text-right">
                    <div class="text-2xl font-bold text-blue-600">${dato.ejecutiones}</div>
                    <div class="text-xs text-slate-600">veces</div>
                    <div class="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">${meses} meses</div>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
    
    panel.appendChild(list);
    return panel;
}

/**
 * Mapa de colores de instituciones (según dataLoader.js)
 */
const INSTITUTION_COLORS = {
    'dspm': { nombre: 'DSPM', color: 'bg-blue-600', colorText: 'text-blue-600', colorBorder: 'border-blue-400', bgLight: 'from-blue-50 to-blue-100' },
    'carabineros': { nombre: 'Carabineros', color: 'bg-green-500', colorText: 'text-green-600', colorBorder: 'border-green-400', bgLight: 'from-green-50 to-green-100' },
    'senda': { nombre: 'SENDA', color: 'bg-amber-500', colorText: 'text-amber-600', colorBorder: 'border-amber-400', bgLight: 'from-amber-50 to-amber-100' },
    'sag': { nombre: 'SAG', color: 'bg-red-600', colorText: 'text-red-600', colorBorder: 'border-red-400', bgLight: 'from-red-50 to-red-100' },
    'slep': { nombre: 'SLEP', color: 'bg-purple-600', colorText: 'text-purple-600', colorBorder: 'border-purple-400', bgLight: 'from-purple-50 to-purple-100' },
    'pdi': { nombre: 'PDI', color: 'bg-indigo-600', colorText: 'text-indigo-600', colorBorder: 'border-indigo-400', bgLight: 'from-indigo-50 to-indigo-100' },
    'gendarmeria': { nombre: 'Gendarmería', color: 'bg-gray-700', colorText: 'text-gray-700', colorBorder: 'border-gray-400', bgLight: 'from-gray-50 to-gray-100' },
    'oln': { nombre: 'OLN', color: 'bg-pink-500', colorText: 'text-pink-600', colorBorder: 'border-pink-400', bgLight: 'from-pink-50 to-pink-100' },
    'seguridad_retiro': { nombre: 'Seguridad Retiro', color: 'bg-orange-600', colorText: 'text-orange-600', colorBorder: 'border-orange-400', bgLight: 'from-orange-50 to-orange-100' }
};

/**
 * Obtener clave de institución normalizada
 */
function getNormalizedInstKey(institutionName) {
    const normalized = institutionName.toLowerCase().replace(/\s+/g, '_');
    // Buscar coincidencia en el mapa
    for (const key of Object.keys(INSTITUTION_COLORS)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return key;
        }
    }
    return null;
}

/**
 * Panel de instituciones ejecutoras
 */
function createInstitutionExecutorPanel(analisis) {
    const panel = document.createElement('div');
    panel.className = 'bg-white rounded-xl shadow-lg border border-slate-200 p-6';
    
    const title = document.createElement('h3');
    title.className = 'text-xl font-bold text-slate-800 mb-4';
    title.textContent = '🏛️ Instituciones Ejecutoras';
    panel.appendChild(title);
    
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    
    // Ordenar instituciones por cantidad de actividades
    const sorted = Object.entries(analisis.categoriasPorInstitucion)
        .sort((a, b) => b[1] - a[1]);
    
    const maxCount = Math.max(...sorted.map(s => s[1]));
    
    sorted.forEach(([institucion, count]) => {
        const card = document.createElement('div');
        const percentage = Math.round((count / maxCount) * 100);
        
        // Obtener datos de color
        const instKey = getNormalizedInstKey(institucion);
        const colorData = instKey ? INSTITUTION_COLORS[instKey] : null;
        
        const institutionPretty = colorData 
            ? colorData.nombre 
            : institucion.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        const borderColor = colorData ? colorData.colorBorder : 'border-slate-200';
        const bgGradient = colorData ? colorData.bgLight : 'from-slate-50 to-slate-100';
        const progressColor = colorData ? colorData.color : 'bg-slate-400';
        const textColor = colorData ? colorData.colorText : 'text-slate-600';
        
        card.className = `border-l-4 ${borderColor} rounded-lg p-4 bg-gradient-to-br ${bgGradient} hover:shadow-md transition cursor-pointer`;
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="font-bold text-slate-800 truncate">${institutionPretty}</div>
                    <div class="text-3xl font-bold ${textColor} mt-2">${count}</div>
                </div>
                <div class="h-12 w-3 rounded ${progressColor} opacity-80"></div>
            </div>
            <div class="mt-3 bg-slate-300 rounded-full h-2.5 overflow-hidden">
                <div class="${progressColor} h-full transition-all" style="width: ${percentage}%"></div>
            </div>
        `;
        grid.appendChild(card);
    });
    
    panel.appendChild(grid);
    return panel;
}

/**
 * Panel informativo
 */
function createInfoPanel(analisis) {
    const panel = document.createElement('div');
    panel.className = 'bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6';
    panel.innerHTML = `
        <h4 class="text-lg font-bold text-blue-900 mb-2">📋 Análisis de Actividades 2026</h4>
        <p class="text-blue-800 text-sm leading-relaxed">
            El plan anual de seguridad pública de Parral comprende <strong>${analisis.totalActividades}</strong> actividades diferenciadas,
            ejecutadas un total de <strong>${analisis.totalEjecuciones}</strong> veces durante el año.
            Estas actividades se distribuyen en <strong>${Object.keys(analisis.categoriasPorTipo).length}</strong> categorías de tipo operativo,
            coordinadas por <strong>${Object.keys(analisis.categoriasPorInstitucion).length}</strong> instituciones.
            La fundamentación situacional considera el análisis histórico de incivilidades y patrones de población en la comuna.
        </p>
    `;
    return panel;
}


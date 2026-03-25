/**
 * Vista Calendario Mensual - Actualizada v4
 * Estructura: Calendario por mes con todas las actividades organizadas por institución
 */
import { loadPlanData } from '../utils/dataLoader.js';

export async function createCalendarioMesView() {
    const container = document.createElement('div');
    container.className = 'w-full';
    
    // Cargar datos
    const { meses: mesesData, operativos } = await loadPlanData();
    
    // Barra de selección de mes
    const selectorBar = document.createElement('div');
    selectorBar.className = 'bg-white rounded-xl shadow-lg p-4 mb-6 border-l-4 border-blue-600';
    
    let selectorHTML = `
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <label class="text-sm font-bold text-slate-700 uppercase">Selecciona un mes:</label>
            <select id="mes-selector" class="px-4 py-2 border-2 border-blue-600 rounded-lg font-bold text-slate-800 cursor-pointer hover:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
    `;
    
    mesesData.forEach((mes, index) => {
        selectorHTML += `<option value="${index}">${mes.nombre}</option>`;
    });
    
    selectorHTML += `
            </select>
        </div>
    `;
    
    selectorBar.innerHTML = selectorHTML;
    container.appendChild(selectorBar);
    
    // Contenedor del calendario
    const calendarContainer = document.createElement('div');
    calendarContainer.id = 'calendar-container';
    calendarContainer.className = 'bg-white rounded-xl shadow-xl border border-slate-200 p-6';
    container.appendChild(calendarContainer);
    
    // Función para renderizar el calendario
    function renderCalendar(mesIndex) {
        const mesData = mesesData[mesIndex];
        const mesNum = mesIndex + 1;
        
        // Obtener el primer día del mes y cantidad de días
        const primerDia = new Date(2026, mesNum - 1, 1).getDay();
        const diasEnMes = new Date(2026, mesNum, 0).getDate();
        
        let HTML = `
            <div class="mb-6">
                <h2 class="text-3xl font-black text-slate-800 mb-2">${mesData.nombre} 2026</h2>
                <p class="text-slate-500 text-sm"><span class="font-bold text-blue-600">Programa:</span> ${mesData.programa || 'N/A'}</p>
                <p class="text-slate-500 text-xs mt-1"><span class="font-bold">Contexto:</span> ${mesData.contexto || 'N/A'}</p>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full border-collapse bg-white">
                    <thead class="bg-slate-900 text-white">
                        <tr>
                            <th class="p-4 text-center font-bold text-sm border-2 border-slate-800">LUNES</th>
                            <th class="p-4 text-center font-bold text-sm border-2 border-slate-800">MARTES</th>
                            <th class="p-4 text-center font-bold text-sm border-2 border-slate-800">MIÉRCOLES</th>
                            <th class="p-4 text-center font-bold text-sm border-2 border-slate-800">JUEVES</th>
                            <th class="p-4 text-center font-bold text-sm border-2 border-slate-800">VIERNES</th>
                            <th class="p-4 text-center font-bold text-sm border-2 border-slate-800">SÁBADO</th>
                            <th class="p-4 text-center font-bold text-sm border-2 border-slate-800">DOMINGO</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let diaActual = 1;
        // Convertir de 0=domingo a 0=lunes: si es domingo (0), convertir a 6; si es lunes (1), convertir a 0, etc.
        let celdasPrimeraSemana = (primerDia + 6) % 7;
        
        // Primera semana con días vacíos
        HTML += '<tr>';
        for (let i = 0; i < 7; i++) {
            if (i < celdasPrimeraSemana) {
                HTML += '<td class="p-3 h-48 bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-slate-300"></td>';
            } else {
                const dia = diaActual;
                const actividadesDelDia = getActividadesDelDia(operativos, mesIndex, dia);
                HTML += renderDiaDelMes(dia, actividadesDelDia);
                diaActual++;
            }
        }
        HTML += '</tr>';
        
        // Resto de semanas
        while (diaActual <= diasEnMes) {
            HTML += '<tr>';
            for (let i = 0; i < 7; i++) {
                if (diaActual <= diasEnMes) {
                    const dia = diaActual;
                    const actividadesDelDia = getActividadesDelDia(operativos, mesIndex, dia);
                    HTML += renderDiaDelMes(dia, actividadesDelDia);
                    diaActual++;
                } else {
                    HTML += '<td class="p-3 h-48 bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-slate-300"></td>';
                }
            }
            HTML += '</tr>';
        }
        
        HTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        calendarContainer.innerHTML = HTML;
    }
    
    // Función para obtener actividades de un día específico
    function getActividadesDelDia(operativos, mesIndex, dia) {
        const actividadesDelDia = [];
        
        operativos.forEach(institucion => {
            if (institucion.actividades[mesIndex]) {
                institucion.actividades[mesIndex].forEach(actividad => {
                    let tieneEseDay = false;
                    
                    // Verificar si es rango de fechas
                    if (actividad.fecha_rango) {
                        const rango = actividad.fecha_rango.split('-');
                        const inicio = parseInt(rango[0]) || 1;
                        const fin = parseInt(rango[1]) || 31;
                        tieneEseDay = dia >= inicio && dia <= fin;
                    }
                    // Verificar si es en fechas específicas
                    else if (actividad.fechas && Array.isArray(actividad.fechas)) {
                        actividad.fechas.forEach(fechaStr => {
                            const fecha = new Date(fechaStr);
                            if (fecha.getDate() === dia) {
                                tieneEseDay = true;
                            }
                        });
                    }
                    
                    if (tieneEseDay) {
                        actividadesDelDia.push({
                            nombre: actividad.nombre,
                            institucion: institucion.nombre,
                            abreviacion: institucion.abreviacion,
                            color: institucion.color,
                            frecuencia: actividad.frecuencia
                        });
                    }
                });
            }
        });
        
        return actividadesDelDia;
    }
    
    // Función para renderizar una celda de día
    function renderDiaDelMes(dia, actividades) {
        let contenido = `<div class="font-bold text-lg text-slate-500 mb-3 pb-2 border-b-2 border-slate-300">${dia}</div>`;
        
        if (actividades.length > 0) {
            contenido += `<div class="space-y-2">`;
            actividades.forEach(act => {
                contenido += `
                    <div class="rounded p-2 text-white text-[8px] leading-relaxed cursor-pointer transition-all hover:shadow-md ${act.color}" 
                         title="${act.nombre}&#10;${act.institucion}">
                        <div class="font-bold uppercase whitespace-normal break-words mb-1">${act.nombre}</div>
                        <div class="text-[7px] opacity-90 font-semibold whitespace-normal break-words">${act.abreviacion}</div>
                    </div>
                `;
            });
            contenido += `</div>`;
        } else {
            contenido += `<div class="text-[10px] text-slate-300 italic">—</div>`;
        }
        
        return `
            <td class="p-3 min-h-64 border-2 border-slate-300 bg-white hover:bg-slate-50 transition-colors align-top overflow-y-auto">
                ${contenido}
            </td>
        `;
    }
    
    // Event listener para selector de mes
    const selector = container.querySelector('#mes-selector');
    selector.addEventListener('change', (e) => {
        renderCalendar(parseInt(e.target.value));
    });
    
    // Renderizar mes inicial (enero)
    renderCalendar(0);
    
    return container;
}

/**
 * Vista Matriz Gantt - Gantt Chart operativo anual
 * Estructura v4: DSPM SOLO → DSPM CONJUNTA → Otras Instituciones
 * Con funcionalidad de impresión: 2 meses por página
 */
import { loadPlanData } from '../utils/dataLoader.js';

/**
 * Función para generar HTML de impresión con 2 meses por página
 * Optimizada para mostrar más información en vertical
 */
function generatePrintHTML(meses, operativos) {
    let printHTML = `
        <div id="print-container" style="display: none;">
            <style media="print">
                @page {
                    size: A4 landscape;
                    margin: 5mm;
                    padding: 0;
                }
                
                html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                }
                
                #print-container {
                    display: block !important;
                    margin: 0;
                    padding: 0;
                }
                
                .print-page {
                    page-break-after: always;
                    margin: 0;
                    padding: 0;
                    width: 100%;
                }
                
                .print-page:last-child {
                    page-break-after: avoid;
                }
                
                .print-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 6.5pt;
                    margin: 0;
                    padding: 0;
                    line-height: 1.1;
                    font-family: Arial, sans-serif;
                }
                
                .print-table th, .print-table td {
                    border: 0.5pt solid #333;
                    padding: 2px 3px;
                    text-align: left;
                    vertical-align: top;
                    line-height: 1.15;
                }
                
                .print-table th {
                    background-color: #1e293b;
                    color: white;
                    font-weight: bold;
                    font-size: 6pt;
                }
                
                .print-table td {
                    background-color: white;
                }
                
                .print-header {
                    font-weight: bold;
                    padding: 3px 0;
                    font-size: 9pt;
                    margin: 2px 0;
                }
                
                .print-institucion-name {
                    width: 140px;
                    min-width: 140px;
                    font-weight: bold;
                    background-color: #f1f5f9;
                    font-size: 6pt;
                    padding: 2px;
                }
                
                .print-month-col {
                    width: auto;
                    word-wrap: break-word;
                    overflow: visible;
                }
                
                .print-activity {
                    margin: 1px 0;
                    padding: 1.5px 2px;
                    border: 0.5pt solid #ddd;
                    background-color: #fafafa;
                    font-size: 6pt;
                    line-height: 1.1;
                    page-break-inside: avoid;
                }
                
                .print-activity-name {
                    font-weight: bold;
                    margin-bottom: 1px;
                    color: #1e293b;
                    font-size: 6pt;
                }
                
                .print-activity-dates {
                    font-size: 5.5pt;
                    color: #666;
                    margin-bottom: 0.5px;
                }
                
                .print-activity-justificacion {
                    font-size: 5pt;
                    color: #777;
                    line-height: 1;
                }
                
                .dspm-solo {
                    background-color: #eff6ff;
                }
                
                .dspm-conjunta {
                    background-color: #faf5ff;
                }
            </style>
    `;
    
    // Dividir meses en grupos de 2
    const mesGroups = [];
    for (let i = 0; i < meses.length; i += 2) {
        mesGroups.push(meses.slice(i, i + 2));
    }
    
    // Generar página por cada grupo de 2 meses
    mesGroups.forEach((mesGroup, pageIndex) => {
        printHTML += `
            <div class="print-page">
                <div class="print-header">Matriz Gantt - Meses: ${mesGroup.map(m => m.id).join(' y ')}</div>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th class="print-month-col" style="width: 180px;">Institución</th>
        `;
        
        // Headers de meses
        mesGroup.forEach(mes => {
            printHTML += `
                            <th class="print-month-col">
                                <div style="font-weight: bold; font-size: 6pt;">${mes.id}</div>
                                <div style="font-size: 5pt; color: #666;">${mes.programa}</div>
                            </th>
            `;
        });
        
        printHTML += `
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Filas de instituciones
        operativos.forEach(institucion => {
            let rowClass = 'print-row';
            if (institucion.isDspmRow) {
                rowClass += institucion.ejecucion === 'SOLO' ? ' dspm-solo' : ' dspm-conjunta';
            }
            
            printHTML += `<tr class="${rowClass}">
                            <td class="print-institucion-name">${institucion.nombre}</td>
            `;
            
            // Celdas de actividades para cada mes del grupo
            mesGroup.forEach((mes, mesIndexInGroup) => {
                const mesIndexInFull = (pageIndex * 2) + mesIndexInGroup;
                const actividadesDelMes = institucion.actividades[mesIndexInFull] || [];
                
                printHTML += `<td class="print-month-col">`;
                
                if (actividadesDelMes && actividadesDelMes.length > 0) {
                    actividadesDelMes.forEach(actividad => {
                        printHTML += `
                            <div class="print-activity">
                                <div class="print-activity-name">${actividad.nombre}</div>
                        `;
                        
                        if (actividad.diasUnicos && actividad.diasUnicos.length > 0) {
                            printHTML += `<div class="print-activity-dates">Días: ${actividad.diasUnicos.join(', ')}</div>`;
                        } else if (actividad.fecha_rango) {
                            printHTML += `<div class="print-activity-dates">Período: ${actividad.fecha_rango}</div>`;
                        }
                        
                        if (actividad.justificacion) {
                            printHTML += `<div class="print-activity-justificacion">${actividad.justificacion}</div>`;
                        }
                        
                        printHTML += `</div>`;
                    });
                }
                
                printHTML += `</td>`;
            });
            
            printHTML += `</tr>`;
        });
        
        printHTML += `
                    </tbody>
                </table>
            </div>
        `;
    });
    
    printHTML += `</div>`;
    return printHTML;
}

/**
 * Función para manejar la impresión
 */
function handlePrint(meses, operativos) {
    // Remover contenedor anterior si existe
    const existingPrint = document.getElementById('print-container');
    if (existingPrint) {
        existingPrint.remove();
    }
    
    // Generar HTML de impresión
    const printHTML = generatePrintHTML(meses, operativos);
    
    // Agregar al DOM
    const temp = document.createElement('div');
    temp.innerHTML = printHTML;
    document.body.appendChild(temp.firstElementChild);
    
    // Esperar a que se renderice
    setTimeout(() => {
        window.print();
    }, 100);
}

function createMobileGanttView(meses, operativos) {
    const container = document.createElement('div');
    container.id = 'gantt-mobile-view';
    container.className = 'bg-white rounded-xl shadow-xl border border-slate-200 p-4';

    const title = document.createElement('div');
    title.className = 'mb-4';
    title.innerHTML = '<h2 class="text-lg font-bold text-slate-900">Matriz Gantt (Mobile)</h2><p class="text-xs text-slate-500">Vista optimizada para pantalla pequeña.</p>';
    container.appendChild(title);

    meses.forEach((mes, mesIndex) => {
        const monthCard = document.createElement('div');
        monthCard.className = 'mobile-month-card mb-4 p-3 border border-slate-200 rounded-lg bg-slate-50';

        monthCard.innerHTML = `
            <div class="text-sm font-extrabold text-slate-800 mb-2">${mes.id} <span class="text-[10px] font-medium text-slate-500">${mes.programa || ''}</span></div>
        `;

        operativos.forEach((institucion, institucionIndex) => {
            const actividadesDelMes = institucion.actividades?.[mesIndex] || [];
            if (!actividadesDelMes.length) return;

            const instBlock = document.createElement('div');
            instBlock.className = 'mobile-institution mb-3';

            const instLabel = document.createElement('div');
            instLabel.className = 'text-xs font-bold text-slate-700 mb-1';
            instLabel.textContent = `${institucion.nombre} ${institucion.isDspmRow ? '(' + institucion.ejecucion + ')' : ''}`;
            instBlock.appendChild(instLabel);

            actividadesDelMes.forEach((actividad) => {
                const actItem = document.createElement('div');
                actItem.className = 'mobile-activity mb-2 p-2 rounded border border-slate-200 bg-white';

                // Color de institución (DSPM o institución específica)
                const getInstitutionColor = () => {
                    if (institucion.isDspmRow) {
                        return institucion.ejecucion === 'SOLO' ? '#1d4ed8' : '#7c3aed';
                    }

                    const institutionName = (institucion.nombre || '').toLowerCase();
                    const nameColorMap = {
                        'sag': '#0e7490',
                        'senda': '#16a34a',
                        'pdi': '#9333ea',
                        'carabineros': '#2563eb',
                        'gendarmeria': '#ea580c',
                        'dspm': '#1d4ed8',
                        'mtt': '#f59e0b',
                        'regional': '#0f172a',
                        'oln': '#14b8a6',
                        'ccsp': '#7c3aed'
                    };

                    for (const key in nameColorMap) {
                        if (institutionName.includes(key)) {
                            return nameColorMap[key];
                        }
                    }

                    if (institucion.color) {
                        const colorMapping = {
                            'bg-blue-500': '#2563eb',
                            'bg-purple-500': '#8b5cf6',
                            'bg-green-500': '#22c55e',
                            'bg-orange-500': '#f97316',
                            'bg-slate-600': '#475569',
                        };
                        if (colorMapping[institucion.color]) {
                            return colorMapping[institucion.color];
                        }
                    }

                    const palette = ['#0284c7', '#9333ea', '#14b8a6', '#f97316', '#22c55e', '#0f172a', '#b91c1c', '#0ea5e9'];
                    return palette[institucionIndex % palette.length];
                };

                const institutionColor = getInstitutionColor();
                actItem.style.borderLeft = `4px solid ${institutionColor}`;
                actItem.style.backgroundColor = '#fcfcfd';

                const actName = document.createElement('div');
                actName.className = 'text-xs font-semibold text-slate-800 mb-1';
                actName.textContent = actividad.nombre || 'Actividad sin nombre';
                actItem.appendChild(actName);

                const actMeta = document.createElement('div');
                actMeta.className = 'text-[11px] text-slate-600 leading-tight';
                const fecha = actividad.fecha_rango || (actividad.diasUnicos ? `Días: ${actividad.diasUnicos.join(', ')}` : 'Fecha: Pendiente');
                const freq = actividad.frecuencia ? ` • ${actividad.frecuencia}` : '';
                actMeta.textContent = `${fecha}${freq}`;
                actItem.appendChild(actMeta);

                if (actividad.justificacion) {
                    const just = document.createElement('div');
                    just.className = 'text-[10px] text-slate-600 mt-1 line-clamp-3';
                    just.textContent = actividad.justificacion;
                    actItem.appendChild(just);
                }

                instBlock.appendChild(actItem);
            });

            monthCard.appendChild(instBlock);
        });

        container.appendChild(monthCard);
    });

    return container;
}

export async function createMatrizGanttView() {
    const container = document.createElement('div');
    container.id = 'gantt-view';
    container.className = 'bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden';
    
    // Cargar datos desde plan.json
    const { meses, operativos, propositos } = await loadPlanData();
    
    // Si no hay datos, mostrar error
    if (!meses || meses.length === 0) {
        container.innerHTML = '<div class="p-6 text-center text-red-600">Error cargando datos del plan</div>';
        return container;
    }

    // Modo true mobile (<= 768px)
    if (window.innerWidth <= 768) {
        const mobileView = createMobileGanttView(meses, operativos);
        return mobileView;
    }

    // Función auxiliar para formatear nombres de coordinadores
    const formatCoordinadores = (coordinadores) => {
        if (!coordinadores || coordinadores.length === 0) return '';
        
        const abreviaturas = {
            'dspm': 'DSPM',
            'carabineros': 'Carabineros',
            'senda': 'SENDA',
            'sag': 'SAG',
            'slep': 'SLEP',
            'pdi': 'PDI',
            'gendarmeria': 'Gendarmería',
            'oln': 'OLN',
            'ccsp': 'CCSP',
            'mtt': 'MTT',
            'regional': 'Regional'
        };
        
        return coordinadores
            .map(coord => abreviaturas[coord] || coord)
            .join(' + ');
    };
    
    // Crear header con botón de imprimir
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50';
    header.innerHTML = `
        <h2 class="text-xl font-bold text-slate-900">Matriz Gantt - Operativo Anual</h2>
        <button id="print-btn" class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>Imprimir</span>
        </button>
    `;
    container.appendChild(header);
    
    // Agregar listener al botón de imprimir
    const printBtn = header.querySelector('#print-btn');
    printBtn.addEventListener('click', () => handlePrint(meses, operativos));
    
    const ganttContainer = document.createElement('div');
    ganttContainer.className = 'gantt-container overflow-x-auto';
    
    const table = document.createElement('table');
    table.className = 'w-full text-left border-collapse text-xs';
    
    // THEAD
    const thead = document.createElement('thead');
    thead.className = 'bg-slate-900 text-white sticky top-0';
    
    const headerRow = document.createElement('tr');
    headerRow.id = 'header-months';
    
    // Primera celda: Título
    const headerCell = document.createElement('th');
    headerCell.className = 'p-4 font-bold w-56 sticky left-0 z-20 bg-slate-900 border-r-2 border-slate-700 text-sm';
    headerCell.textContent = 'Institución / Tipo';
    headerRow.appendChild(headerCell);
    
    // Celdas de meses
    meses.forEach(mes => {
        const th = document.createElement('th');
        th.className = 'p-3 month-col text-center font-black uppercase tracking-tight border-l border-slate-700 bg-slate-800 min-w-56';
        th.innerHTML = `
            <div class="font-black text-white text-xs">${mes.id}</div>
            <div class="text-[10px] text-slate-300 font-normal italic mt-0.5">${mes.programa}</div>
        `;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // TBODY
    const tbody = document.createElement('tbody');
    tbody.className = 'text-xs divide-y-2 divide-slate-300';
    tbody.id = 'gantt-body';
    
    // Generar filas de actividades por institución
    operativos.forEach((institucion, rowIndex) => {
        const row = document.createElement('tr');
        row.className = 'activity-row hover:bg-slate-50 transition-colors';
        
        // Si es fila de DSPM, aplicar fondos especiales
        if (institucion.isDspmRow) {
            if (institucion.ejecucion === 'SOLO') {
                row.className += ' bg-blue-50 border-l-4 border-blue-600';
            } else {
                row.className += ' bg-purple-50 border-l-4 border-purple-600';
            }
        }
        
        // Columna sticky (nombre de institución + tipo)
        const nameCell = document.createElement('td');
        nameCell.className = 'p-3 sticky left-0 z-10 border-r-2 border-slate-300 font-semibold text-slate-800';
        
        if (institucion.isDspmRow) {
            if (institucion.ejecucion === 'SOLO') {
                nameCell.style.backgroundColor = '#eff6ff';
                nameCell.innerHTML = `
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded-full bg-blue-600 flex-shrink-0"></div>
                        <div class="font-black text-sm text-blue-900">${institucion.nombre}</div>
                    </div>
                `;
            } else {
                nameCell.style.backgroundColor = '#faf5ff';
                nameCell.innerHTML = `
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded-full bg-purple-600 flex-shrink-0"></div>
                        <div class="font-black text-sm text-purple-900">${institucion.nombre}</div>
                    </div>
                `;
            }
        } else {
            nameCell.style.backgroundColor = '#f8f9fa';
            nameCell.innerHTML = `
                <div class="flex items-center gap-2">
                    <div class="${institucion.color} w-3 h-3 rounded-full flex-shrink-0"></div>
                    <div class="font-bold text-sm">${institucion.nombre}</div>
                </div>
            `;
        }
        
        row.appendChild(nameCell);
        
        // Celdas de meses con actividades de esta institución
        institucion.actividades.forEach((actividadesDelMes, mesIndex) => {
            const cell = document.createElement('td');
            cell.className = 'p-3 month-col border-r border-slate-200 min-w-56 max-h-96 overflow-y-auto';
            
            if (institucion.isDspmRow && institucion.ejecucion === 'SOLO') {
                cell.style.backgroundColor = '#f0f9ff';
            } else if (institucion.isDspmRow && institucion.ejecucion === 'CONJUNTA') {
                cell.style.backgroundColor = '#faf5ff';
            }
            
            if (!actividadesDelMes || actividadesDelMes.length === 0) {
                // Sin actividades en este mes
                cell.className += ' bg-opacity-50';
            } else {
                // Mostrar todas las actividades de esta institución en el mes
                let content = '<div class="space-y-2">';
                
                actividadesDelMes.forEach((actividad, idx) => {
                    // Para DSPM SOLO, siempre azul. Para DSPM CONJUNTA, siempre púrpura
                    // Para otras instituciones, basarse en su ejecución
                    let esBadgeColor = 'bg-slate-600 text-white';
                    
                    if (institucion.isDspmRow) {
                        if (institucion.ejecucion === 'SOLO') {
                            esBadgeColor = 'bg-blue-600 text-white';
                        } else {
                            esBadgeColor = 'bg-purple-600 text-white';
                        }
                    } else {
                        // Otras instituciones
                        esBadgeColor = actividad.ejecucion === 'SOLO' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-purple-500 text-white';
                    }
                    
                    // Mostrar frecuencia solo si NO es semanal ni quincenal
                    const frecuenciaMap = {
                        'diaria': '📅 Diario',
                        'mensual': '📍 Mensual',
                        'trimestral': '📊 Trimestral',
                        'semestral': '📈 Semestral',
                        'anual': '🎯 Anual',
                        'puntual': '⚡ Puntual'
                    };
                    const frecuenciaLabel = frecuenciaMap[actividad.frecuencia] || '';
                    
                    if (actividad.diasUnicos && actividad.diasUnicos.length > 0) {
                        // Mostrar todos los días como cuadraditos separados
                        const diasHTML = actividad.diasUnicos.map(dia => {
                            return `<span class="inline-block ${institucion.color} text-white text-[8px] px-2 py-1 rounded font-bold">${dia}</span>`;
                        }).join(' ');
                        
                        content += `
                            <div class="bg-white border border-slate-200 rounded p-2 hover:border-slate-400 transition-colors">
                                <div class="font-bold text-slate-800 text-[11px] line-clamp-2 mb-1">${actividad.nombre}</div>
                                <div class="flex gap-1 flex-wrap mb-2">${diasHTML}</div>
                                ${actividad.justificacion ? `<div class="text-slate-600 text-[8px] line-clamp-2">${actividad.justificacion}</div>` : ''}
                            </div>
                        `;
                    } else if (actividad.fecha_rango) {
                        // Rango de fechas (Diario - todo el mes)
                        const rangoFechas = actividad.fecha_rango.split('-');
                        const fechaInicio = rangoFechas[0] || '01';
                        const fechaFin = rangoFechas[1] || '31';
                        content += `
                            <div class="bg-white border border-slate-200 rounded p-2 hover:border-slate-400 transition-colors">
                                <div class="font-bold text-slate-800 text-[11px] line-clamp-2 mb-2">${actividad.nombre}</div>
                                <div class="inline-block ${institucion.color} text-white text-[8px] px-2 py-1 rounded font-bold mb-2">
                                    ${fechaInicio} → ${fechaFin}
                                </div>
                                ${actividad.justificacion ? `<div class="text-slate-600 text-[8px] line-clamp-2">${actividad.justificacion}</div>` : ''}
                            </div>
                        `;
                    } else if (actividad.fechas && Array.isArray(actividad.fechas) && actividad.fechas.length > 0) {
                        // Fechas específicas (fallback)
                        const fechasHTML = actividad.fechas.map(fechaStr => {
                            const fecha = new Date(fechaStr);
                            const dia = fecha.getDate();
                            return `<span class="inline-block ${institucion.color} text-white text-[8px] px-1.5 py-0.5 rounded font-bold">${dia}</span>`;
                        }).join(' ');
                        
                        content += `
                            <div class="bg-white border border-slate-200 rounded p-2 hover:border-slate-400 transition-colors">
                                <div class="font-bold text-slate-800 text-[11px] line-clamp-2 mb-1">${actividad.nombre}</div>
                                <div class="flex gap-1 flex-wrap text-[8px] mb-2">${fechasHTML}</div>
                                ${actividad.justificacion ? `<div class="text-slate-600 text-[8px] line-clamp-2">${actividad.justificacion}</div>` : ''}
                            </div>
                        `;
                    }
                });
                
                content += '</div>';
                cell.innerHTML = content;
            }
            
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    ganttContainer.appendChild(table);
    container.appendChild(ganttContainer);
    
    return container;
}

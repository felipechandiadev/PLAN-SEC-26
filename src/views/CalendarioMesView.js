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

    // Mapa para ubicar actividad editable por key
    const actividadMap = new Map();

    const categoriaTiposMap = {
        'Operativos de Patrullaje y Vigilancia': [
            'Patrullas Mixtas',
            'Rondas sectores residenciales',
            'Rondas de Impacto',
            'Vigilancia por Cámaras (VMS)',
            'Patrullaje Preventivo Rural'
        ],
        'Operativos de Control y Fiscalización': [
            'Control de Acceso e Identidad',
            'Fiscalización al Comercio Formal',
            'Fiscalización al Comercio Informal',
            'Fiscalización para Prevenir el Abigeato',
            'Control de Ley de Alcoholes',
            'Fiscalización de Tránsito y Transporte'
        ],
        'Gestión Comunitaria y Preventiva': [
            'Red de Autocuidado Vecinal',
            'Mesa Territoriales',
            'Mesa Técnicas',
            'Charla preventivas',
            'Levantamiento de Factores de Riesgo',
            'Operativos de Prevención SENDA'
        ],
        'Operativos Estacionales o Temáticos': [
            'Seguridad Escolar',
            'Retorno Escolar',
            'Operativos Rurales',
            'Ruta Segura',
            'Seguridad Fiestas Patrias / Navidad'
        ]
    };

    // Modal de edición (hidden initially)
    const editModal = createEditModal();
    container.appendChild(editModal);

    // Delegate click en íconos de edición + botón agregar actividad
    calendarContainer.addEventListener('click', (event) => {
        const addBtn = event.target.closest('.day-add-btn');
        if (addBtn) {
            event.stopPropagation();
            const mesIndex = parseInt(addBtn.getAttribute('data-mes'), 10);
            const dia = parseInt(addBtn.getAttribute('data-dia'), 10);
            const data = {
                actividad: {
                    nombre: '',
                    justificacion: '',
                    hora_inicio: '08:00',
                    hora_fin: '10:00',
                    responsable: 'dspm',
                    otras_instituciones: [],
                    tipo: 'otra',
                    frecuencia: 'diaria',
                    estado: 'planificado'
                },
                institucion: {
                    nombre: 'dspm',
                    abreviacion: 'DSPM',
                    color: 'bg-blue-500'
                },
                mesIndex,
                dia
            };
            openEditModal(data);
            return;
        }

        const btn = event.target.closest('.actividad-edit-btn');
        if (!btn) return;
        event.stopPropagation();
        const key = btn.getAttribute('data-act-key');
        const data = actividadMap.get(key);
        if (data) {
            openEditModal(data);
        }
    });

    // Función para renderizar el calendario
    function renderCalendar(mesIndex) {
        const mesData = mesesData[mesIndex];
        const mesNum = mesIndex + 1;
        
        // Obtener el primer día del mes y cantidad de días
        const primerDia = new Date(2026, mesNum - 1, 1).getDay();
        const diasEnMes = new Date(2026, mesNum, 0).getDate();
        actividadMap.clear();

        
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
                HTML += renderDiaDelMes(dia, actividadesDelDia, mesIndex);
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
                    HTML += renderDiaDelMes(dia, actividadesDelDia, mesIndex);
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
                    // Verificar si tiene fecha simple
                    else if (actividad.fecha) {
                        const fecha = new Date(actividad.fecha);
                        if (fecha.getDate() === dia) {
                            tieneEseDay = true;
                        }
                    }
                    
                    if (tieneEseDay) {
                        actividad.tipo = actividad.tipo || inferTipoActividad(actividad);
                        actividad.categoria = actividad.categoria || inferCategoriaActividad(actividad);
                        const key = `${mesIndex}-${dia}-${institucion.nombre}-${actividad.nombre}`;
                        actividadesDelDia.push({
                            key,
                            actividad,
                            institucion,
                            nombre: actividad.nombre,
                            institucionTexto: institucion.nombre,
                            abreviacion: institucion.abreviacion,
                            color: institucion.color,
                            frecuencia: actividad.frecuencia,
                            justificacion: actividad.justificacion || ''
                        });
                        actividadMap.set(key, { actividad, institucion, mesIndex, dia });
                    }
                });
            }
        });
        
        return actividadesDelDia;
    }

    function inferTipoActividad(actividad) {
        const nombre = (actividad.nombre || '').toLowerCase();
        const justificacion = (actividad.justificacion || '').toLowerCase();

        if (/rondas mixtas|rondas nocturnas|vigilancia|patrulla/.test(nombre) || /rondas mixtas|rondas nocturnas|vigilancia|patrulla/.test(justificacion)) {
            return 'operativo_intersectorial';
        }
        if (/rondas de fiscalización|sectores residenciales|vehículos de seguridad/.test(nombre) || /rondas de fiscalización|sectores residenciales|vehículos de seguridad/.test(justificacion)) {
            return 'operativo_autonomo';
        }
        if (/alto impacto|priorizados|estratégico/.test(nombre) || /alto impacto|priorizados|estratégico/.test(justificacion)) {
            return 'operativo_especializado';
        }
        if (/control de acceso|identidad|fiscalización vehicular|mtt/.test(nombre) || /control de acceso|identidad|fiscalización vehicular|mtt/.test(justificacion)) {
            return 'operativo_intersectorial';
        }
        if (/comercio formal|comercio informal|abigeato|sag/.test(nombre) || /comercio formal|comercio informal|abigeato|sag/.test(justificacion)) {
            return 'operativo_coordinado';
        }
        if (/red de autocuidado vecinal|whatsapp|comunidad/.test(nombre) || /red de autocuidado vecinal|whatsapp|comunidad/.test(justificacion)) {
            return 'gestion_comunitaria';
        }
        if (/mesa territorial|mesa técnica|senda|slep/.test(nombre) || /mesa territorial|mesa técnica|senda|slep/.test(justificacion)) {
            return 'mesa_territorial';
        }
        if (/charla preventiva|ley de drogas|educativa|apoderados/.test(nombre) || /charla preventiva|ley de drogas|educativa|apoderados/.test(justificacion)) {
            return 'jornada_formativa';
        }
        if (/ruta segura|retorno escolar|seguridad escolar|rurales/.test(nombre) || /ruta segura|retorno escolar|seguridad escolar|rurales/.test(justificacion)) {
            return 'operativo_tematico';
        }
        if (/mesa|territorial/.test(nombre) || /mesa|territorial/.test(justificacion)) {
            return 'mesa_territorial';
        }
        if (/jornada|formativa/.test(nombre) || /jornada|formativa/.test(justificacion)) {
            return 'jornada_formativa';
        }
        return 'otra';
    }

    function inferCategoriaActividad(actividad) {
        const tipo = inferTipoActividad(actividad);
        if (['operativo_intersectorial', 'operativo_autonomo', 'operativo_especializado'].includes(tipo)) {
            return 'Operativos de Patrullaje y Vigilancia';
        }
        if (['operativo_coordinado', 'control_acceso', 'fiscalizacion'] .includes(tipo)) {
            return 'Operativos de Control y Fiscalización';
        }
        if (['gestion_comunitaria', 'mesa_territorial', 'jornada_formativa', 'otra'].includes(tipo)) {
            return 'Gestión Comunitaria y Preventiva';
        }
        return 'Operativos Estacionales o Temáticos';
    }
    
    // Función para renderizar una celda de día
    function renderDiaDelMes(dia, actividades, mesIndex) {
        let contenido = `<div class="font-bold text-lg text-slate-500 mb-3 pb-2 border-b-2 border-slate-300">${dia}</div>`;
        
        const fechaActividad = new Date(2026, mesIndex, dia);
        const fechaFormatted = fechaActividad.toLocaleDateString('es-CL', { day: '2-digit', month: 'long' });

        if (actividades.length > 0) {
            contenido += `<div class="space-y-2">`;
            actividades.forEach(act => {
                contenido += `
                    <div class="group relative rounded p-2 text-white text-[8px] leading-relaxed transition-all hover:shadow-md ${act.color} flex flex-col gap-1" title="${act.nombre}&#10;${act.institucionTexto}">
                        <button type="button" class="actividad-edit-btn absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-slate-300 text-[9px] text-slate-700 font-bold opacity-90 hover:opacity-100 transition" data-act-key="${act.key}" aria-label="Editar actividad">✎</button>
                        <div class="flex-1">
                            <div class="font-bold uppercase whitespace-normal break-words text-[8px]">${act.nombre}</div>
                            <div class="text-[7px] opacity-90 font-semibold whitespace-normal break-words">${fechaFormatted}</div>
                            <div class="text-[7px] opacity-90 font-semibold whitespace-normal break-words">${act.abreviacion}</div>
                        </div>
                    </div>
                `;
            });
            contenido += `</div>`;
        } else {
            contenido += `<div class="text-[10px] text-slate-300 italic mb-2">Sin actividades</div>`;
            contenido += `<button type="button" class="day-add-btn mt-1 px-2 py-1 text-[10px] border border-blue-500 text-blue-500 rounded hover:bg-blue-50" data-mes="${mesIndex}" data-dia="${dia}" aria-label="Agregar actividad">+ Agregar</button>`;
        }
        
        return `
            <td class="p-3 min-h-64 border-2 border-slate-300 bg-white hover:bg-slate-50 transition-colors align-top overflow-y-auto">
                ${contenido}
            </td>
        `;
    }

    function createEditModal() {
        const modal = document.createElement('div');
        modal.id = 'edit-actividad-modal';
        modal.style.position = 'fixed';
        modal.style.inset = '0';
        modal.style.display = 'none';
        modal.style.alignItems = 'flex-start';
        modal.style.justifyContent = 'center';
        modal.style.paddingTop = '5%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
            <div class="bg-white rounded-xl border border-slate-300 shadow-2xl w-11/12 max-w-md p-4 relative" style="max-height: 85vh; overflow-y: auto;">
                <button id="edit-modal-close" class="absolute right-2 top-2 text-slate-500 hover:text-slate-900 font-bold">✕</button>
                <h3 class="text-lg font-bold text-slate-800 mb-3">Editar Actividad</h3>
                <form id="edit-actividad-form" class="space-y-3">
                    <label class="block text-xs font-semibold text-slate-600">Nombre</label>
                    <input id="edit-actividad-nombre" type="text" class="w-full border border-slate-300 rounded px-2 py-1 text-sm" required />

                    <label class="block text-xs font-semibold text-slate-600">Fecha</label>
                    <input id="edit-actividad-fecha" type="date" class="w-full border border-slate-300 rounded px-2 py-1 text-sm" />

                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block text-xs font-semibold text-slate-600">Hora inicio</label>
                            <input id="edit-actividad-hora-inicio" type="time" class="w-full border border-slate-300 rounded px-2 py-1 text-sm" required />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-600">Hora fin</label>
                            <input id="edit-actividad-hora-fin" type="time" class="w-full border border-slate-300 rounded px-2 py-1 text-sm" required />
                        </div>
                    </div>

                    <label class="block text-xs font-semibold text-slate-600">Responsable</label>
                    <select id="edit-actividad-responsable" class="w-full border border-slate-300 rounded px-2 py-1 text-sm" required>
                        <option value="dspm">DSPM</option>
                        <option value="carabineros">Carabineros</option>
                        <option value="senda">SENDA</option>
                        <option value="sag">SAG</option>
                        <option value="slep">SLEP</option>
                        <option value="pdi">PDI</option>
                        <option value="gendarmeria">Gendarmería</option>
                        <option value="oln">OLN</option>
                        <option value="seguridad_retiro">Seguridad Retiro</option>
                    </select>

                    <label class="block text-xs font-semibold text-slate-600">Otras instituciones asociadas</label>
                    <div id="edit-actividad-otras" class="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto border border-slate-300 rounded px-2 py-2">
                        ${operativos.map(inst => `
                            <label class="flex items-center gap-1 text-[11px]">
                                <input type="checkbox" value="${inst.nombre}" class="otras-instituciones-checkbox" />
                                ${inst.nombre}
                            </label>
                        `).join('')}
                    </div>
                    <p class="text-xs text-slate-500">Marca una o más instituciones con checkbox.</p>

                    <label class="block text-xs font-semibold text-slate-600">Justificación</label>
                    <textarea id="edit-actividad-justificacion" rows="3" class="w-full border border-slate-300 rounded px-2 py-1 text-sm"></textarea>

                    <label class="block text-xs font-semibold text-slate-600">Categoría</label>
                    <select id="edit-actividad-categoria" class="w-full border border-slate-300 rounded px-2 py-1 text-sm">
                        <option value="Operativos de Patrullaje y Vigilancia">Operativos de Patrullaje y Vigilancia</option>
                        <option value="Operativos de Control y Fiscalización">Operativos de Control y Fiscalización</option>
                        <option value="Gestión Comunitaria y Preventiva">Gestión Comunitaria y Preventiva</option>
                        <option value="Operativos Estacionales o Temáticos">Operativos Estacionales o Temáticos</option>
                    </select>

                    <label class="block text-xs font-semibold text-slate-600">Tipo de actividad</label>
                    <select id="edit-actividad-tipo" class="w-full border border-slate-300 rounded px-2 py-1 text-sm"></select>

                    <label class="block text-xs font-semibold text-slate-600">Estado</label>
                    <select id="edit-actividad-estado" class="w-full border border-slate-300 rounded px-2 py-1 text-sm">
                        <option value="planificado">planificado</option>
                        <option value="por_ejecutar">por ejecutar</option>
                        <option value="en_ejecucion">en ejecución</option>
                        <option value="ejecutado">ejecutado</option>
                        <option value="cancelado">cancelado</option>
                        <option value="postergado">postergado</option>
                    </select>

                    <div class="flex justify-end gap-2 mt-2">
                        <button type="button" id="edit-modal-cancel" class="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100">Cancelar</button>
                        <button type="submit" class="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">Guardar</button>
                    </div>
                </form>
            </div>
        `;

        const closeModal = () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        };

        modal.querySelector('#edit-modal-close').addEventListener('click', closeModal);
        modal.querySelector('#edit-modal-cancel').addEventListener('click', closeModal);

        const categoriaSelect = modal.querySelector('#edit-actividad-categoria');
        const tipoSelect = modal.querySelector('#edit-actividad-tipo');

        const configurarTipos = (categoria, valorSeleccionado = null) => {
            const opciones = categoriaTiposMap[categoria] || [];
            tipoSelect.innerHTML = opciones
                .map(opt => `<option value="${opt}">${opt}</option>`)
                .join('');
            tipoSelect.innerHTML += `<option value="Otro">Otro</option>`;
            if (valorSeleccionado) {
                tipoSelect.value = valorSeleccionado;
                if (!tipoSelect.value) {
                    tipoSelect.value = 'Otro';
                }
            }
        };

        categoriaSelect.addEventListener('change', () => {
            configurarTipos(categoriaSelect.value);
        });

        // Inicializar tipos para categoria por defecto
        configurarTipos(categoriaSelect.value);

        const form = modal.querySelector('#edit-actividad-form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const nombre = modal.querySelector('#edit-actividad-nombre').value.trim();
            const justificacion = modal.querySelector('#edit-actividad-justificacion').value.trim();
            const horaInicio = modal.querySelector('#edit-actividad-hora-inicio').value;
            const horaFin = modal.querySelector('#edit-actividad-hora-fin').value;
            const responsable = modal.querySelector('#edit-actividad-responsable').value;
            const otras = Array.from(modal.querySelectorAll('#edit-actividad-otras .otras-instituciones-checkbox:checked')).map(chk => chk.value).filter(Boolean);
            const tipo = modal.querySelector('#edit-actividad-tipo').value;
            const estado = modal.querySelector('#edit-actividad-estado').value;
            const key = modal.getAttribute('data-actividad-key');
            const data = actividadMap.get(key);
            const mesIndex = parseInt(modal.getAttribute('data-mes-index'), 10);
            const dia = parseInt(modal.getAttribute('data-dia'), 10);
            const institucionNombre = modal.getAttribute('data-institucion');

            const fecha = modal.querySelector('#edit-actividad-fecha').value;
            const categoria = modal.querySelector('#edit-actividad-categoria').value;
            if (data && data.actividad) {
                data.actividad.nombre = nombre;
                data.actividad.justificacion = justificacion;
                data.actividad.fecha = fecha;
                data.actividad.fechas = fecha ? [fecha] : data.actividad.fechas || [];
                data.actividad.hora_inicio = horaInicio;
                data.actividad.hora_fin = horaFin;
                data.actividad.responsable = responsable;
                data.actividad.otras_instituciones = otras;
                data.actividad.categoria = categoria;
                data.actividad.subtipo = tipo;
                data.actividad.estado = estado;
                data.actividad.frecuencia = 'diaria';
            } else {
                const institucionObj = operativos.find(item => item.nombre.toLowerCase() === institucionNombre?.toLowerCase()) || operativos[0];
                if (institucionObj) {
                    if (!institucionObj.actividades[mesIndex]) {
                        institucionObj.actividades[mesIndex] = [];
                    }
                    institucionObj.actividades[mesIndex].push({
                        nombre,
                        justificacion,
                        fecha,
                        fechas: fecha ? [fecha] : [],
                        hora_inicio: horaInicio,
                        hora_fin: horaFin,
                        responsable,
                        otras_instituciones: otras,
                        categoria,
                        subtipo: tipo,
                        tipo: categoria,
                        estado,
                        frecuencia: 'diaria'
                    });
                }
            }
            closeModal();
            const selected = parseInt(document.querySelector('#mes-selector').value);
            renderCalendar(selected);
        });

        return modal;
    }

    function openEditModal(data) {
        const modal = document.getElementById('edit-actividad-modal');
        document.body.style.overflow = 'hidden';
        modal.style.display = 'flex';
        modal.setAttribute('data-mes-index', data.mesIndex);
        modal.setAttribute('data-dia', data.dia);
        modal.setAttribute('data-institucion', data.institucion?.nombre || 'dspm');
        modal.setAttribute('data-actividad-key', `${data.mesIndex}-${data.dia}-${data.institucion?.nombre || 'dspm'}-${data.actividad.nombre}`);
        modal.querySelector('#edit-actividad-nombre').value = data.actividad.nombre || '';
        modal.querySelector('#edit-actividad-justificacion').value = data.actividad.justificacion || '';
        const fecha = data.actividad.fecha || (Array.isArray(data.actividad.fechas) && data.actividad.fechas[0]) || '';
        modal.querySelector('#edit-actividad-fecha').value = fecha;
        modal.querySelector('#edit-actividad-hora-inicio').value = data.actividad.hora_inicio || '08:00';
        modal.querySelector('#edit-actividad-hora-fin').value = data.actividad.hora_fin || '10:00';
        modal.querySelector('#edit-actividad-responsable').value = data.actividad.responsable || data.institucion.nombre.toLowerCase();
        const otrasSeleccionadas = data.actividad.otras_instituciones || [];
        modal.querySelectorAll('#edit-actividad-otras .otras-instituciones-checkbox').forEach(chk => {
            chk.checked = otrasSeleccionadas.includes(chk.value);
        });

        const categoriaAct = data.actividad.categoria || inferCategoriaActividad(data.actividad);
        const categoriaSelect = modal.querySelector('#edit-actividad-categoria');
        const tipoSelect = modal.querySelector('#edit-actividad-tipo');

        categoriaSelect.value = categoriaAct;
        const tipoOptions = categoriaTiposMap[categoriaAct] || [];
        tipoSelect.innerHTML = tipoOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('') + '<option value="Otro">Otro</option>';

        const subtipo = data.actividad.subtipo || data.actividad.tipo;
        if (subtipo && tipoOptions.includes(subtipo)) {
            tipoSelect.value = subtipo;
        } else {
            tipoSelect.value = 'Otro';
            if (subtipo && subtipo !== 'Otro') {
                const extraOpt = document.createElement('option');
                extraOpt.value = subtipo;
                extraOpt.textContent = subtipo;
                tipoSelect.appendChild(extraOpt);
                tipoSelect.value = subtipo;
            }
        }

        modal.querySelector('#edit-actividad-estado').value = data.actividad.estado || 'planificado';
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

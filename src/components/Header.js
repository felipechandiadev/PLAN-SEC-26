/**
 * Componente Header principal
 */

let headerNavButtons = {};

export function createHeader(onNavigate) {
    const header = document.createElement('div');
    // Altura top bar reducida: padding menor en desktop y móvil
    header.className = 'bg-white rounded-xl shadow-sm p-3 mb-6 border-t-4 border-blue-900';
    header.innerHTML = `
        <div class="flex flex-col gap-3">
            <!-- PRIMERA FILA: Logo + Título a la izquierda | Referencia a la derecha -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <!-- ZONA IZQUIERDA: Logo y Título -->
                <div class="flex items-center gap-4">
                    <img src="/logo.png" alt="PSP Logo" class="h-16 w-auto shadow-lg rounded-lg" id="header-logo">
                    <div>
                        <h1 class="text-xl font-black text-slate-800 uppercase tracking-tight">PLANIFICACIÓN ANUAL</h1>
                        <h2 class="text-sm font-bold text-slate-600 uppercase">Dirección de Seguridad Pública Municipal</h2>
                    </div>
                </div>
            </div>
            
            <!-- SEGUNDA FILA: Botones de Navegación alineados a la derecha -->
            <div id="header-nav" class="flex gap-3 justify-end">
                <button id="nav-dashboard" class="nav-btn px-4 py-2 border-2 border-blue-900 text-blue-900 rounded font-bold text-sm uppercase transition-all hover:scale-105">
                    Dashboard
                </button>
                <button id="nav-gantt" class="nav-btn px-4 py-2 border-2 border-blue-900 text-blue-900 rounded font-bold text-sm uppercase transition-all hover:scale-105 bg-blue-900 text-white">
                    Matriz Gantt
                </button>
                <button id="nav-calendario" class="nav-btn px-4 py-2 border-2 border-blue-900 text-blue-900 rounded font-bold text-sm uppercase transition-all hover:scale-105">
                    Calendario
                </button>
            </div>
        </div>
    `;
    
    // Ajustar tamaño de botones según dispositivo
    const isMobile = window.innerWidth <= 768;
    const navBtnBase = isMobile
        ? 'nav-btn px-2 py-1 border-2 border-blue-900 text-blue-900 rounded font-bold text-[10px] uppercase transition-all hover:scale-105'
        : 'nav-btn px-4 py-2 border-2 border-blue-900 text-blue-900 rounded font-bold text-sm uppercase transition-all hover:scale-105';

    header.querySelectorAll('#header-nav button').forEach(btn => {
        btn.className = navBtnBase;
    });

    // Almacenar referencias de botones globalmente
    headerNavButtons = {
        'dashboard': header.querySelector('#nav-dashboard'),
        'gantt': header.querySelector('#nav-gantt'),
        'calendario': header.querySelector('#nav-calendario')
    };
    
    // Agregar event listeners para navegación
    if (onNavigate) {
        header.querySelector('#nav-dashboard').addEventListener('click', () => {
            updateHeaderActiveButton('dashboard');
            onNavigate('dashboard');
        });
        header.querySelector('#nav-gantt').addEventListener('click', () => {
            updateHeaderActiveButton('gantt');
            onNavigate('gantt');
        });
        header.querySelector('#nav-calendario').addEventListener('click', () => {
            updateHeaderActiveButton('calendario');
            onNavigate('calendario');
        });
    }
    
    return header;
}

/**
 * Función para actualizar el botón activo en el header
 */
export function updateHeaderActiveButton(active) {
    Object.keys(headerNavButtons).forEach(key => {
        const btn = headerNavButtons[key];
        if (key === active) {
            btn.classList.add('bg-blue-900', 'text-white');
        } else {
            btn.classList.remove('bg-blue-900', 'text-white');
        }
    });
}

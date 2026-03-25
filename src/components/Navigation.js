/**
 * Componente Navigation - Barra de navegación entre vistas
 */
export function createNavigation(onNavigate) {
    const nav = document.createElement('div');
    nav.id = 'navigation';
    nav.className = 'bg-blue-900 text-white px-6 py-3 rounded-lg mb-6 flex gap-4 shadow-md';
    nav.innerHTML = `
        <button id="nav-dashboard" class="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded font-bold text-sm uppercase">
            Dashboard
        </button>
        <button id="nav-gantt" class="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded font-bold text-sm uppercase">
            Matriz Gantt
        </button>
        <button id="nav-calendario" class="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded font-bold text-sm uppercase">
            Calendario
        </button>
    `;
    
    nav.querySelector('#nav-dashboard').addEventListener('click', () => onNavigate('dashboard'));
    nav.querySelector('#nav-gantt').addEventListener('click', () => onNavigate('gantt'));
    nav.querySelector('#nav-calendario').addEventListener('click', () => onNavigate('calendario'));
    
    return nav;
}

export function updateNavigationActive(viewName) {
    // Buscar botones que pueden estar en el header o en navigation
    const dashboardBtn = document.querySelector('#nav-dashboard');
    const ganttBtn = document.querySelector('#nav-gantt');
    const calendarioBtn = document.querySelector('#nav-calendario');
    
    const buttons = [dashboardBtn, ganttBtn, calendarioBtn].filter(btn => btn !== null);
    
    // Remover estilo activo de todos
    buttons.forEach(btn => {
        btn.classList.remove('bg-green-600', 'border-green-600');
        btn.classList.remove('text-white');
        btn.classList.add('border-blue-900', 'text-blue-900', 'hover:bg-blue-50');
    });
    
    // Aplicar estilo activo al botón correspondiente
    const activeBtnId = {
        'dashboard': 'nav-dashboard',
        'gantt': 'nav-gantt',
        'calendario': 'nav-calendario'
    }[viewName];
    
    if (activeBtnId) {
        const activeBtn = document.querySelector(`#${activeBtnId}`);
        if (activeBtn) {
            activeBtn.classList.remove('border-blue-900', 'text-blue-900', 'hover:bg-blue-50');
            activeBtn.classList.add('bg-blue-900', 'text-white', 'border-blue-900');
        }
    }
}

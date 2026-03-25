/**
 * Aplicación principal - Orquestación de componentes y vistas
 */
import { createHeader, updateHeaderActiveButton } from './components/Header.js';
import { createLegend } from './components/Legend.js';
import { updateNavigationActive } from './components/Navigation.js';
import { createMatrizGanttView } from './views/MatrizGanttView.js';
import { createCalendarioMesView } from './views/CalendarioMesView.js';
import { createDashboardView } from './views/DashboardView.js';
import { router } from './utils/router.js';

export class App {
    constructor() {
        this.container = document.querySelector('#app');
        this.currentView = 'gantt';
        this.init();
    }

    init() {
        // Limpiar container
        this.container.innerHTML = '';
        
        // Crear estructura
        const mainWrapper = document.createElement('div');
        mainWrapper.className = 'w-full p-4 md:p-6';
        
        // Componentes
        mainWrapper.appendChild(createHeader((viewName) => this.navigate(viewName)));
        
        // Contenedor de vista
        const viewContainer = document.createElement('div');
        viewContainer.id = 'view-container';
        viewContainer.className = 'mb-6';
        mainWrapper.appendChild(viewContainer);
        
        // Footer
        const footer = document.createElement('div');
        footer.className = 'mt-4 p-4 bg-slate-800 text-white rounded-lg shadow-lg';
        footer.innerHTML = `
            <h4 class="text-xs font-bold uppercase text-blue-400 mb-1">Nota de Implementación:</h4>
            <p class="text-[10px] leading-relaxed text-slate-300">Esta matriz integra la programación temporal con la fundamentación situacional. Las fechas han sido seleccionadas tras el análisis histórico de incivilidades y flujos de población en la comuna de Parral durante el ciclo anual 2025.</p>
        `;
        mainWrapper.appendChild(footer);
        
        this.container.appendChild(mainWrapper);
        
        // Registrar vistas
        router.register('dashboard', createDashboardView);
        router.register('gantt', createMatrizGanttView);
        router.register('calendario', createCalendarioMesView);
        
        // Navegar a vista inicial
        this.navigate('dashboard');
    }

    navigate(viewName) {
        this.currentView = viewName;
        updateHeaderActiveButton(viewName);
        updateNavigationActive(viewName);
        
        const viewContainer = document.querySelector('#view-container');
        viewContainer.innerHTML = '';
        
        const viewFunction = router.navigate(viewName);
        if (viewFunction) {
            // Ejecutar la función de vista (puede ser sync o async)
            const viewResult = viewFunction();
            Promise.resolve(viewResult).then(view => {
                if (view) {
                    viewContainer.innerHTML = '';
                    viewContainer.appendChild(view);
                }
            }).catch(error => {
                console.error('Error cargando vista:', error);
                viewContainer.innerHTML = '<div class="p-6 text-center text-red-600">Error cargando vista: ' + error.message + '</div>';
            });
        }
    }
}

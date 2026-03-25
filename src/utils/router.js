/**
 * Sistema simple de routing
 */
class Router {
    constructor() {
        this.views = {};
        this.currentView = 'gantt';
        this.onNavigate = null;
    }

    register(viewName, viewComponent) {
        this.views[viewName] = viewComponent;
    }

    navigate(viewName) {
        if (this.views[viewName]) {
            this.currentView = viewName;
            if (this.onNavigate) {
                this.onNavigate(viewName);
            }
            return this.views[viewName];
        }
        console.warn(`Vista '${viewName}' no registrada`);
        return null;
    }

    getCurrentView() {
        return this.views[this.currentView];
    }
}

export const router = new Router();

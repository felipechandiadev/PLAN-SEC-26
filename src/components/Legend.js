/**
 * Componente Legend - Leyenda de instituciones y colores
 */
export function createLegend() {
    const legend = document.createElement('div');
    legend.className = 'flex flex-wrap gap-3 mb-6 bg-white p-3 rounded-lg shadow-sm border border-slate-200 items-center';
    legend.innerHTML = `
        <span class="text-[10px] font-bold text-slate-400 uppercase mr-2">Instituciones:</span>
        <div class="flex items-center gap-2 px-3 py-1 border-r border-slate-100">
            <span class="w-3 h-3 rounded bg-blue-600"></span>
            <span class="text-[10px] font-bold uppercase text-slate-600">DSPM</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1 border-r border-slate-100">
            <span class="w-3 h-3 rounded bg-green-500"></span>
            <span class="text-[10px] font-bold uppercase text-slate-600">Carabineros</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1 border-r border-slate-100">
            <span class="w-3 h-3 rounded bg-green-500"></span>
            <span class="text-[10px] font-bold uppercase text-slate-600">SENDA</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1 border-r border-slate-100">
            <span class="w-3 h-3 rounded bg-red-600"></span>
            <span class="text-[10px] font-bold uppercase text-slate-600">SAG (Abigeato)</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1 border-r border-slate-100">
            <span class="w-3 h-3 rounded bg-indigo-600"></span>
            <span class="text-[10px] font-bold uppercase text-slate-600">Intersectorial</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1 border-r border-slate-100">
            <span class="w-3 h-3 rounded bg-purple-600"></span>
            <span class="text-[10px] font-bold uppercase text-slate-600">SLEP</span>
        </div>
        <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded bg-pink-500"></span>
            <span class="text-[10px] font-bold uppercase text-slate-600">Niñez/OLN</span>
        </div>
    `;
    return legend;
}

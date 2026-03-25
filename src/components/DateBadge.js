/**
 * Componente DateBadge - Badge de fecha coloreado
 */
export function createDateBadge(date, colorClass) {
    const badge = document.createElement('span');
    badge.className = `date-badge ${colorClass}`;
    badge.textContent = date;
    return badge;
}

export function renderDateBadge(date, colorClass) {
    return `<span class="date-badge ${colorClass}">${date}</span>`;
}

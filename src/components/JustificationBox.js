/**
 * Componente JustificationBox - Caja de justificación técnica
 */
export function createJustificationBox(texto) {
    const box = document.createElement('div');
    box.className = 'justification-box';
    box.innerHTML = texto;
    return box;
}

export function renderJustificationBox(texto) {
    return `
        <div class="justification-box">
            ${texto}
        </div>
    `;
}

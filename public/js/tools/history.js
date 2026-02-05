/**
 * History panel management for Developer Tools
 */

// History storage
let resultHistory = [];
const MAX_HISTORY = 10;

// Add to history
function addToHistory(path, data) {
    resultHistory.unshift({ path, data, timestamp: new Date() });
    if (resultHistory.length > MAX_HISTORY) {
        resultHistory.pop();
    }
    renderHistory();
}

// Render history panel
function renderHistory() {
    const panel = document.getElementById('history-panel');
    const list = document.getElementById('history-list');

    if (resultHistory.length === 0) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    list.innerHTML = '';

    resultHistory.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.onclick = () => {
            navigator.clipboard.writeText(JSON.stringify(item.data, null, 2));
            M.toast({ html: 'Result copied!', classes: 'rounded' });
        };

        const resultPreview = JSON.stringify(item.data).substring(0, 50);
        div.innerHTML = `
            <div class="history-path">${item.path}</div>
            <div class="history-result">${resultPreview}${resultPreview.length >= 50 ? '...' : ''}</div>
        `;
        list.appendChild(div);
    });
}

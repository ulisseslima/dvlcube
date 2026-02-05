/**
 * Snippet management for Developer Tools sandbox
 */

// Save code snippet to localStorage
function saveSnippet(index, language) {
    const textarea = document.querySelector(`#route-${index} textarea[data-param="code"]`);
    if (!textarea || !textarea.value.trim()) {
        M.toast({ html: 'No code to save!', classes: 'rounded orange' });
        return;
    }

    const code = textarea.value;

    // Prompt for tags
    const tagsInput = prompt('Enter tags for this snippet (comma-separated):', '');
    if (tagsInput === null) return; // User cancelled

    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);

    // Get existing snippets
    const snippets = getSnippets(language);

    // Add new snippet with timestamp
    snippets.push({
        id: Date.now(),
        code: code,
        tags: tags,
        timestamp: new Date().toISOString()
    });

    // Save to localStorage
    localStorage.setItem(`sandbox-snippets-${language}`, JSON.stringify(snippets));

    M.toast({ html: `${language} snippet saved with ${tags.length} tag(s)!`, classes: 'rounded green' });

    // Refresh snippets list
    renderSnippetsList(index, language);
}

// Get snippets for a language
function getSnippets(language) {
    const stored = localStorage.getItem(`sandbox-snippets-${language}`);
    return stored ? JSON.parse(stored) : [];
}

// Clear textarea only
function clearTextarea(index) {
    const textarea = document.querySelector(`#route-${index} textarea[data-param="code"]`);
    if (textarea) {
        textarea.value = '';
        M.toast({ html: 'Textarea cleared!', classes: 'rounded' });
    }
}

// Toggle snippets section
function toggleSnippets(index) {
    const list = document.getElementById(`snippets-list-${index}`);
    const icon = document.getElementById(`snippets-toggle-${index}`);

    if (list.style.display === 'none') {
        list.style.display = 'block';
        icon.textContent = 'expand_less';
    } else {
        list.style.display = 'none';
        icon.textContent = 'expand_more';
    }
}

// Render snippets list
function renderSnippetsList(index, language) {
    const listContainer = document.getElementById(`snippets-list-${index}`);
    if (!listContainer) return;

    const snippets = getSnippets(language);

    if (snippets.length === 0) {
        listContainer.innerHTML = '<div style="color: #999; font-style: italic; padding: 10px;">No saved snippets yet</div>';
        return;
    }

    listContainer.innerHTML = '';

    snippets.slice().reverse().forEach((snippet) => {
        const div = document.createElement('div');
        div.className = 'snippet-item';
        div.style.cssText = 'border: 1px solid #e0e0e0; border-radius: 4px; padding: 10px; margin-bottom: 8px; background: white;';

        const date = new Date(snippet.timestamp).toLocaleString();
        const tagsHtml = snippet.tags.length > 0
            ? snippet.tags.map(tag => `<span style="background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 3px; font-size: 0.85em; margin-right: 4px;">${tag}</span>`).join('')
            : '<span style="color: #999; font-style: italic;">no tags</span>';

        const codePreview = snippet.code.substring(0, 60) + (snippet.code.length > 60 ? '...' : '');

        div.innerHTML = `
            <div style="margin-bottom: 5px;">
                ${tagsHtml}
                <span style="float: right; color: #999; font-size: 0.8em;">${date}</span>
            </div>
            <div style="font-family: monospace; font-size: 0.85em; color: #555; margin-bottom: 8px;">${escapeHtml(codePreview)}</div>
            <div>
                <button class="btn-small waves-effect blue" onclick="loadSnippet(${index}, ${snippet.id}, '${language}')" style="margin-right: 5px;">
                    <i class="material-icons left" style="font-size: 16px;">input</i>Load
                </button>
                <button class="btn-small waves-effect red" onclick="deleteSnippet(${index}, ${snippet.id}, '${language}')">
                    <i class="material-icons left" style="font-size: 16px;">delete</i>Delete
                </button>
            </div>
        `;

        listContainer.appendChild(div);
    });
}

// Load a snippet into the textarea
function loadSnippet(index, snippetId, language) {
    const snippets = getSnippets(language);
    const snippet = snippets.find(s => s.id === snippetId);

    if (snippet) {
        const textarea = document.querySelector(`#route-${index} textarea[data-param="code"]`);
        if (textarea) {
            textarea.value = snippet.code;
            M.textareaAutoResize(textarea);
            M.toast({ html: 'Snippet loaded!', classes: 'rounded green' });

            // Auto-collapse the snippets section
            const list = document.getElementById(`snippets-list-${index}`);
            const icon = document.getElementById(`snippets-toggle-${index}`);
            if (list && icon) {
                list.style.display = 'none';
                icon.textContent = 'expand_more';
            }
        }
    }
}

// Delete a snippet
function deleteSnippet(index, snippetId, language) {
    if (!confirm('Are you sure you want to delete this snippet?')) return;

    let snippets = getSnippets(language);
    snippets = snippets.filter(s => s.id !== snippetId);

    localStorage.setItem(`sandbox-snippets-${language}`, JSON.stringify(snippets));
    M.toast({ html: 'Snippet deleted!', classes: 'rounded' });

    renderSnippetsList(index, language);
}

// Clear code snippet from localStorage and textarea
function clearSnippet(index, language) {
    const textarea = document.querySelector(`#route-${index} textarea[data-param="code"]`);
    if (textarea) {
        textarea.value = '';
        localStorage.removeItem(`sandbox-${language}`);
        M.toast({ html: `${language} snippet cleared!`, classes: 'rounded' });
    }
}

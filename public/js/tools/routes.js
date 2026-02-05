/**
 * Route rendering and API calling for Developer Tools
 */

// Render route cards for a category
function renderRoutes(routes) {
    const container = document.getElementById('routes-container');
    container.innerHTML = '';

    routes.forEach((route, index) => {
        const card = document.createElement('div');
        card.className = 'route-card';
        card.id = `route-${index}`;
        card.dataset.method = route.method; // Store HTTP method

        const isSandbox = route.path.startsWith('/sandbox/');
        const language = isSandbox ? route.path.split('/').pop() : null;

        let paramsHtml = '';
        route.params.forEach(param => {
            paramsHtml += renderParamInput(index, param);
        });

        // Add saved snippets section and save/clear buttons for sandbox routes
        const snippetControls = isSandbox ? renderSnippetControls(index, language) : '';

        card.innerHTML = `
            <h5>${route.name}</h5>
            <p class="route-description">${route.description}</p>
            <div class="route-path">${route.method} ${route.path}</div>
            <form onsubmit="callRoute(event, ${index}, '${route.path}', ${isSandbox})">
                ${paramsHtml}
                ${snippetControls}
                <button type="submit" class="btn waves-effect waves-light">
                    <i class="material-icons left">send</i>
                    Execute
                    <div class="preloader-wrapper small loading-spinner" id="spinner-${index}">
                        <div class="spinner-layer spinner-white-only">
                            <div class="circle-clipper left"><div class="circle"></div></div>
                        </div>
                    </div>
                </button>
            </form>
            <div class="result-container" id="result-${index}">
                <div class="result-box" id="result-box-${index}"></div>
                <div class="result-actions">
                    <button class="btn-small waves-effect" onclick="copyResult(${index})">
                        <i class="material-icons left">content_copy</i>Copy
                    </button>
                    <button class="btn-small waves-effect" onclick="useAsInput(${index})">
                        <i class="material-icons left">input</i>Use as Input
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    // Initialize Materialize selects
    M.FormSelect.init(document.querySelectorAll('select'));

    // Load and render snippets for sandbox routes
    routes.forEach((route, index) => {
        const isSandbox = route.path.startsWith('/sandbox/');
        if (isSandbox) {
            const language = route.path.split('/').pop();
            renderSnippetsList(index, language);
        }
    });
}

// Render a single parameter input based on type
function renderParamInput(index, param) {
    if (param.type === 'select') {
        return `
            <div class="input-field">
                <select id="param-${index}-${param.name}" data-param="${param.name}">
                    ${param.options.map(opt => {
                        const value = typeof opt === 'object' ? opt.value : opt;
                        const label = typeof opt === 'object' ? opt.label : opt;
                        const isSelected = value === param.default ? 'selected' : '';
                        return `<option value="${value}" ${isSelected}>${label}</option>`;
                    }).join('')}
                </select>
                <label>${param.name}${param.required ? ' *' : ''}</label>
            </div>
        `;
    } else if (param.type === 'textarea') {
        return `
            <div class="input-field">
                <textarea id="param-${index}-${param.name}" class="materialize-textarea" data-param="${param.name}" placeholder="${param.placeholder || ''}" ${param.required ? 'required' : ''}></textarea>
                <label for="param-${index}-${param.name}">${param.name}${param.required ? ' *' : ''}</label>
            </div>
        `;
    } else if (param.type === 'file') {
        return `
            <div class="file-field input-field">
                <div class="btn">
                    <span>Browse</span>
                    <input type="file" id="param-${index}-${param.name}" data-param="${param.name}" accept="${param.accept || '*'}" ${param.required ? 'required' : ''}>
                </div>
                <div class="file-path-wrapper">
                    <input class="file-path validate" type="text" placeholder="${param.placeholder || 'Upload a file'}">
                </div>
            </div>
        `;
    } else if (param.type === 'checkbox') {
        const checkedAttr = param.default === true ? 'checked' : '';
        return `
            <p>
                <label>
                    <input type="checkbox" id="param-${index}-${param.name}" data-param="${param.name}" ${checkedAttr} />
                    <span>${param.label || param.name}</span>
                </label>
            </p>
        `;
    } else {
        return `
            <div class="input-field">
                <input type="text" id="param-${index}-${param.name}" data-param="${param.name}" placeholder="${param.placeholder || ''}" ${param.required ? 'required' : ''}>
                <label for="param-${index}-${param.name}">${param.name}${param.required ? ' *' : ''}</label>
            </div>
        `;
    }
}

// Render snippet controls for sandbox routes
function renderSnippetControls(index, language) {
    return `
        <div style="margin-bottom: 15px; border: 1px solid #e0e0e0; border-radius: 4px; padding: 10px; background: #fafafa;">
            <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="toggleSnippets(${index})">
                <strong style="color: #666;"><i class="material-icons" style="vertical-align: middle; font-size: 18px;">snippet_folder</i> Saved Snippets</strong>
                <i class="material-icons" id="snippets-toggle-${index}" style="color: #999;">expand_more</i>
            </div>
            <div id="snippets-list-${index}" style="display: none; margin-top: 10px; max-height: 200px; overflow-y: auto;">
                <!-- Snippets will be populated here -->
            </div>
        </div>
        <div style="margin-bottom: 10px;">
            <button type="button" class="btn-small waves-effect grey" onclick="saveSnippet(${index}, '${language}')">
                <i class="material-icons left">save</i>Save Snippet
            </button>
            <button type="button" class="btn-small waves-effect grey" onclick="clearTextarea(${index})">
                <i class="material-icons left">delete</i>Clear
            </button>
        </div>
    `;
}

// Call a route (API request)
async function callRoute(event, index, path, isSandbox = false) {
    event.preventDefault();

    const form = event.target;
    const inputs = form.querySelectorAll('[data-param]');
    const isChart = path.startsWith('/charts/');
    const isPost = form.closest('.route-card').dataset.method === 'POST';

    // Show spinner
    const spinner = document.getElementById(`spinner-${index}`);
    spinner.classList.add('active', 'show');

    try {
        let response, data;

        if (isPost) {
            // Use FormData for POST requests (supports file uploads)
            const formData = new FormData();

            inputs.forEach(input => {
                if (input.type === 'file') {
                    if (input.files && input.files[0]) {
                        formData.append(input.dataset.param, input.files[0]);
                    }
                } else if (input.type === 'checkbox') {
                    if (input.dataset.param === 'mask') {
                        if (input.checked) {
                            formData.append('mask', 'false');
                        }
                    } else {
                        if (input.checked) {
                            formData.append(input.dataset.param, 'true');
                        }
                    }
                } else {
                    const value = input.value.trim();
                    if (value) {
                        formData.append(input.dataset.param, value);
                    }
                }
            });

            response = await fetch(path, {
                method: 'POST',
                body: formData
            });
        } else {
            // Use URLSearchParams for GET requests
            const params = new URLSearchParams();

            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    if (input.dataset.param === 'mask') {
                        if (input.checked) {
                            params.append('mask', 'false');
                        }
                    } else {
                        if (input.checked) {
                            params.append(input.dataset.param, 'true');
                        }
                    }
                } else {
                    const value = input.value.trim();
                    if (value) {
                        params.append(input.dataset.param, value);
                    }
                }
            });

            const url = params.toString() ? `${path}?${params.toString()}` : path;
            response = await fetch(url);
        }

        data = await response.json();

        const resultContainer = document.getElementById(`result-${index}`);
        const resultBox = document.getElementById(`result-box-${index}`);

        // Format output based on route type
        if (isChart && data.success) {
            resultBox.innerHTML = renderChart(data, index);
        } else if (isSandbox) {
            resultBox.innerHTML = formatSandboxOutput(data);
        } else {
            resultBox.textContent = JSON.stringify(data, null, 2);
        }

        resultBox.classList.remove('error');

        if (!response.ok || (isSandbox && !data.success) || (isChart && !data.success)) {
            resultBox.classList.add('error');
        }

        resultContainer.classList.add('show');

        // Add to history
        addToHistory(path, data);

    } catch (error) {
        const resultContainer = document.getElementById(`result-${index}`);
        const resultBox = document.getElementById(`result-box-${index}`);

        resultBox.textContent = `Error: ${error.message}`;
        resultBox.classList.add('error');
        resultContainer.classList.add('show');
    } finally {
        spinner.classList.remove('active', 'show');
    }
}

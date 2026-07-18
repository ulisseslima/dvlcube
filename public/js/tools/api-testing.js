/**
 * API Testing renderer for Developer Tools
 */

// Parse OpenAPI/Swagger definition from JSON or YAML text
function parseApiDefinition(definitionText) {
    const raw = (definitionText || '').trim();
    if (!raw) {
        throw new Error('Definition is required');
    }

    let spec;

    try {
        spec = JSON.parse(raw);
    } catch (jsonError) {
        try {
            spec = jsyaml.load(raw);
        } catch (yamlError) {
            throw new Error('Invalid JSON/YAML definition');
        }
    }

    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
        throw new Error('Definition must be a JSON/YAML object');
    }

    if (!spec.openapi && !spec.swagger) {
        throw new Error('Definition must include "openapi" or "swagger" root field');
    }

    return spec;
}

// Build visual summary and mount Swagger UI
function renderApiTestingResult(spec, index) {
    const rendererId = `api-testing-renderer-${index}`;
    const swaggerMountId = `swagger-ui-${index}`;
    const title = (spec.info && spec.info.title) ? spec.info.title : 'Untitled API';
    const version = (spec.info && spec.info.version) ? spec.info.version : 'N/A';
    const specVersion = spec.openapi || spec.swagger || 'Unknown';

    // Render after HTML is mounted
    setTimeout(() => {
        const mountNode = document.getElementById(swaggerMountId);
        if (!mountNode || typeof SwaggerUIBundle !== 'function') return;

        mountNode.innerHTML = '';
        SwaggerUIBundle({
            spec,
            dom_id: `#${swaggerMountId}`,
            deepLinking: true,
            docExpansion: 'list',
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
            ],
            layout: 'BaseLayout'
        });
    }, 0);

    return `
        <div id="${rendererId}" class="api-testing-renderer">
            <div class="api-testing-summary">
                <strong>${escapeHtml(title)}</strong>
                <span>Spec ${escapeHtml(String(specVersion))}</span>
                <span>Version ${escapeHtml(String(version))}</span>
            </div>
            <div id="${swaggerMountId}" class="swagger-ui-container"></div>
        </div>
    `;
}

// Parse inputs and return a normalized response structure
function handleApiTestingRoute(inputs, index) {
    let definition = '';

    inputs.forEach(input => {
        if (input.dataset.param === 'definition') {
            definition = input.value;
        }
    });

    const spec = parseApiDefinition(definition);
    const title = (spec.info && spec.info.title) ? spec.info.title : 'Untitled API';

    return {
        success: true,
        title,
        specVersion: spec.openapi || spec.swagger || 'Unknown',
        rendererHtml: renderApiTestingResult(spec, index)
    };
}

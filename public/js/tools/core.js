/**
 * Core initialization and category selection for Developer Tools
 * 
 * Dependencies (load in order):
 * 1. utils.js - Utility functions
 * 2. history.js - History management
 * 3. snippets.js - Snippet management (depends on utils.js for escapeHtml)
 * 4. charts.js - Chart rendering
 * 5. sandbox.js - Sandbox output formatting (depends on utils.js for escapeHtml)
 * 6. routes.js - Route rendering and API calls
 * 7. core.js - This file (main initialization)
 */

// Route metadata - will be set by the EJS template
let routeMetadata = {};

// Initialize route metadata from server
function initRouteMetadata(metadata) {
    routeMetadata = metadata;
}

// Select a category
function selectCategory(categoryKey, updateHash = true) {
    const category = routeMetadata[categoryKey];
    if (!category) return;

    // Update sidebar active state
    document.querySelectorAll('.sidebar .collection-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-category="${categoryKey}"]`).classList.add('active');

    // Show tools content
    document.getElementById('welcome-panel').style.display = 'none';
    document.getElementById('tools-content').style.display = 'block';

    // Update header
    document.getElementById('category-icon').textContent = category.icon;
    document.getElementById('category-name').textContent = category.name;
    document.getElementById('category-description').textContent = category.description;

    // Render routes
    renderRoutes(category.routes);

    // Update URL hash
    if (updateHash) {
        window.location.hash = categoryKey;
    }
}

// Load category from URL hash
function loadCategoryFromHash() {
    const hash = window.location.hash.substring(1); // Remove '#'
    if (hash && routeMetadata[hash]) {
        selectCategory(hash, false);
    }
}

// Handle browser back/forward
window.addEventListener('hashchange', () => {
    loadCategoryFromHash();
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
    M.AutoInit();

    // Load category from URL hash if present
    loadCategoryFromHash();
});

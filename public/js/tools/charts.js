/**
 * Chart rendering for Developer Tools
 */

// Store chart instances for cleanup
let chartInstances = {};

// Render chart visualization
function renderChart(response, index) {
    if (!response.success || !response.chartData) {
        return `<div style="color: #f44336;">Error: ${response.error || 'Failed to generate chart'}</div>`;
    }

    const chartData = response.chartData;
    const metadata = response.metadata;

    // Destroy existing chart if any
    const canvasId = `chart-canvas-${index}`;
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const chartTypeLabels = {
        'timeSeries': 'Time Series - Avg Execution Time',
        'executionCount': 'Execution Count by Function',
        'percentiles': 'Performance Percentiles (P50/P95/P99)',
        'avgExecutionTime': 'Execution Time (Min/Avg/Max)',
        'errorRate': 'Error Rate by Function',
        'executionTimeComparison': 'Execution Count Over Time (Stacked)'
    };

    let html = `
        <div style="margin-bottom: 15px; padding: 10px; background: #e8f5e9; border-left: 4px solid #4caf50;">
            <strong>✅ Chart Generated Successfully</strong>
            <div style="font-size: 0.9em; color: #666; margin-top: 5px;">
                📊 Project: ${metadata.projectId || 'N/A'} | 
                📈 Functions: ${metadata.functionCount || 0} | 
                📅 ${metadata.startTime ? new Date(metadata.startTime).toLocaleDateString() : ''} - ${metadata.endTime ? new Date(metadata.endTime).toLocaleDateString() : ''}
            </div>
        </div>
        <div style="position: relative; height: 400px; width: 100%; margin-bottom: 20px;">
            <canvas id="${canvasId}"></canvas>
        </div>
    `;

    // Create chart after DOM update
    setTimeout(() => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const ctx = canvas.getContext('2d');

            // Prepare config based on chart type
            let config;
            if (chartData.type === 'line' && chartData.datasets) {
                config = {
                    type: 'line',
                    data: { datasets: chartData.datasets },
                    options: chartData.options
                };
            } else {
                config = {
                    type: chartData.type,
                    data: chartData.data,
                    options: chartData.options
                };
            }

            chartInstances[canvasId] = new Chart(ctx, config);
        }
    }, 100);

    return html;
}

// Destroy all chart instances (cleanup)
function destroyAllCharts() {
    Object.keys(chartInstances).forEach(canvasId => {
        if (chartInstances[canvasId]) {
            chartInstances[canvasId].destroy();
            delete chartInstances[canvasId];
        }
    });
}

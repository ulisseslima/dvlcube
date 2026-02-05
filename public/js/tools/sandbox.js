/**
 * Sandbox output formatting for Developer Tools
 */

// Format sandbox execution output
function formatSandboxOutput(data) {
    const statusIcon = data.success ? '✅' : '❌';
    const statusText = data.success ? 'Success' : 'Failed';
    const statusColor = data.success ? '#4caf50' : '#f44336';

    let html = `
        <div style="margin-bottom: 15px; padding: 10px; background: ${data.success ? '#e8f5e9' : '#ffebee'}; border-left: 4px solid ${statusColor};">
            <strong>${statusIcon} ${statusText}</strong>
            ${data.timeout ? '<span style="color: #ff9800; margin-left: 10px;">⏱️ Timeout</span>' : ''}
            <span style="float: right; color: #666;">⏱ ${data.executionTime}</span>
        </div>
    `;

    if (data.phase) {
        html += `<div style="margin-bottom: 10px;"><strong>Phase:</strong> ${data.phase}</div>`;
    }

    if (data.stdout && data.stdout.trim()) {
        html += `
            <div style="margin-bottom: 15px;">
                <strong style="color: #2196f3;">📤 Output:</strong>
                <pre style="background: #263238; color: #aed581; padding: 12px; border-radius: 4px; margin-top: 5px; overflow-x: auto;">${escapeHtml(data.stdout)}</pre>
            </div>
        `;
    }

    if (data.stderr && data.stderr.trim()) {
        html += `
            <div style="margin-bottom: 15px;">
                <strong style="color: #f44336;">⚠️ Error Output:</strong>
                <pre style="background: #263238; color: #ef5350; padding: 12px; border-radius: 4px; margin-top: 5px; overflow-x: auto;">${escapeHtml(data.stderr)}</pre>
            </div>
        `;
    }

    if (data.output && !data.stdout && !data.stderr) {
        html += `
            <div style="margin-bottom: 15px;">
                <strong>Output:</strong>
                <pre style="background: #263238; color: #fff; padding: 12px; border-radius: 4px; margin-top: 5px; overflow-x: auto;">${escapeHtml(data.output)}</pre>
            </div>
        `;
    }

    html += `<div style="font-size: 0.85em; color: #666;"><strong>Exit Code:</strong> ${data.exitCode}</div>`;

    return html;
}

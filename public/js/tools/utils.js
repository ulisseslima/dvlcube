/**
 * Utility functions for Developer Tools
 */

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Copy result to clipboard
function copyResult(index) {
    const resultBox = document.getElementById(`result-box-${index}`);
    const text = resultBox.textContent;

    navigator.clipboard.writeText(text).then(() => {
        M.toast({ html: 'Copied to clipboard!', classes: 'rounded' });
    }).catch(err => {
        M.toast({ html: 'Failed to copy', classes: 'rounded red' });
    });
}

// Use result as input in another field
let lastResult = null;
function useAsInput(index) {
    const resultBox = document.getElementById(`result-box-${index}`);
    try {
        lastResult = JSON.parse(resultBox.textContent);

        // Extract the main value from common result keys
        let value = '';
        if (lastResult.encoded) value = lastResult.encoded;
        else if (lastResult.decoded) value = lastResult.decoded;
        else if (lastResult.cpf) value = lastResult.cpf;
        else if (lastResult.cnpj) value = lastResult.cnpj;
        else if (lastResult.title) value = lastResult.title;
        else if (lastResult.valid !== undefined) value = lastResult.valid.toString();
        else value = JSON.stringify(lastResult);

        // Copy to clipboard and show toast
        navigator.clipboard.writeText(value).then(() => {
            M.toast({
                html: `Value "${value.substring(0, 30)}${value.length > 30 ? '...' : ''}" copied! Paste it in any input field.`,
                classes: 'rounded',
                displayLength: 4000
            });
        });

    } catch (e) {
        M.toast({ html: 'Could not parse result', classes: 'rounded red' });
    }
}

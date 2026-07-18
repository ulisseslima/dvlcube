/**
 * Markdown preview and PDF export for Developer Tools
 */

// Render markdown result as a preview with an export button
function renderMarkdownResult(html, index) {
    const previewId = `markdown-preview-${index}`;
    return `
        <div style="margin-bottom: 10px;">
            <button class="btn waves-effect waves-light" style="color: #fff;" onclick="exportMarkdownPdf(${index})">
                <i class="material-icons left">picture_as_pdf</i>Export PDF
            </button>
        </div>
        <div id="${previewId}" class="markdown-preview">${html}</div>
    `;
}

// Export the rendered markdown preview as a PDF
function exportMarkdownPdf(index) {
    const preview = document.getElementById(`markdown-preview-${index}`);
    if (!preview) return;

    // Clone into a detached container so html2canvas renders cleanly
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:absolute;left:0;top:0;z-index:-1;width:794px;background:#fff;color:#212121;padding:24px 32px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;';
    wrapper.innerHTML = preview.innerHTML;
    document.body.appendChild(wrapper);

    const opt = {
        margin: [10, 10, 10, 10],
        filename: 'markdown-export.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0, windowWidth: 794 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(wrapper).save().then(() => {
        document.body.removeChild(wrapper);
    });
}

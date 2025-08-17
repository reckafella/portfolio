function togglePreview(fieldId, event) {
    const textarea = document.getElementById(fieldId);
    const previewDiv = document.getElementById(fieldId + '_preview');
    const toggleBtn = event.target;

    if (previewDiv.style.display === 'none' || previewDiv.style.display === '') {
        // Show preview
        const content = textarea.value;
        if (content.trim()) {
            previewDiv.innerHTML = content;
        } else {
            previewDiv.innerHTML = '<p class="text-muted"><em>No content to preview...</em></p>';
        }
        previewDiv.style.display = 'block';
        toggleBtn.textContent = 'Edit';
        toggleBtn.classList.add('active');
        textarea.style.display = 'none';
    } else {
        // Hide preview
        previewDiv.style.display = 'none';
        toggleBtn.textContent = 'Preview';
        toggleBtn.classList.remove('active');
        textarea.style.display = 'block';
    }
}

// Make function available globally for onclick handlers
window.togglePreview = togglePreview;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { togglePreview };
} else if (typeof window !== 'undefined' && typeof window.define === 'function' && window.define.amd) {
    window.define([], function() { return { togglePreview }; });
}

// Auto-resize textarea as user types
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementsByClassName('content');
    if (!textarea || textarea.length === 0) return;

    [textarea].forEach(function(textarea) {
        // Auto-resize function
        function autoResize() {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }

        // Add event listeners
        textarea.addEventListener('input', autoResize);
        textarea.addEventListener('focus', function() {
            this.classList.add('focused');
        });
        textarea.addEventListener('blur', function() {
            this.classList.remove('focused');
        });
        
        // Initial resize
        autoResize();
    });
});

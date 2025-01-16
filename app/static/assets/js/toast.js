// toast.js
class ToastManager {
    constructor() {
        this.container = document.getElementById('liveToast');
        if (this.container) this.setupCloseButton();
    }

    setupCloseButton() {
        const closeButton = document.querySelector('.btn-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.close());
        }
    }

    show(type, message, errors = null) {
        const toastBody = document.getElementById('toastBody');
        const toastTitle = document.getElementById('toastTitle');
        const toastIcon = document.getElementById('toastIcon');
        const toastElement = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        const toastErrors = document.getElementById('toastErrors');

        // Configure toast appearance
        toastBody.className = `alert toast-body alert-${type} text-bg-${type}`;
        toastElement.className = `toast alert alert-${type} fade show`;

        // Set title and icon based on type
        const config = {
            success: { title: 'Success', icon: 'bi-check-circle-fill' },
            danger: { title: 'Error', icon: 'bi-exclamation-triangle-fill' },
            warning: { title: 'Warning', icon: 'bi-exclamation-triangle-fill' },
            info: { title: 'Info', icon: 'bi-info-circle-fill' }
        };

        const { title = '', icon = '' } = config[type] || {};
        toastTitle.innerText = title;
        toastIcon.className = `bi ${icon}`;

        // Set main message
        toastMessage.textContent = message;

        // Handle errors if present
        toastErrors.innerHTML = '';
        if (errors) {
            if (typeof errors === 'string') {
                toastErrors.innerHTML = `<li>${errors}</li>`;
            } else if (Array.isArray(errors)) {
                toastErrors.innerHTML = errors.map(error => `<li>${error}</li>`).join('');
            } else if (typeof errors === 'object') {
                const errorsList = Object.entries(errors).map(([field, messages]) => {
                    const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
                    const messageText = Array.isArray(messages) ? messages.join(', ') : messages;
                    return `<li><strong>${fieldName}:</strong> ${messageText}</li>`;
                });
                toastErrors.innerHTML = errorsList.join('');
            }
        }

        // Update time and display
        document.getElementById('alert-time').textContent = new Date().toLocaleTimeString();
        this.container.style.display = 'grid';
        toastElement.style.display = 'grid';

        // Show toast
        const toast = new bootstrap.Toast(toastElement, { autohide: false });
        toast.show();
    }

    close() {
        this.container.style.display = 'none';
    }
}

export const toastManager = new ToastManager();

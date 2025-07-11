// share-links.js
import { toastManager } from './toast.js';

export default class ShareManager {
    constructor() {
        this.modal = document.getElementById('shareModal');
        this.copyBtn = this.modal?.querySelector('#copyLinkBtn');
        this.setupEventListeners();
    }

    setupShareModal(url, title) {
        if (!this.modal) return;

        // Set up copy button
        if (this.copyBtn) {
            this.copyBtn.setAttribute('data-url', url);
        }

        // Set up share links
        const fbLink = this.modal.querySelector('.share-facebook');
        if (fbLink) {
            fbLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        }

        const twitterLink = this.modal.querySelector('.share-twitter');
        if (twitterLink) {
            twitterLink.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        }

        const whatsappLink = this.modal.querySelector('.share-whatsapp');
        if (whatsappLink) {
            whatsappLink.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(title)}%20${encodeURIComponent(url)}`;
        }

        // Update modal title
        const modalTitle = this.modal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.innerHTML = `<span class="fw-bold">Share</span> ${title}`;
        }
    }

    copyToClipboard(text) {
        if (!text) {
            toastManager.show('danger', 'Error: No link to copy!');
            this.updateCopyButton('error');
            return;
        }

        if (!navigator.clipboard) {
            toastManager.show('danger', 'Clipboard API not available');
            return;
        }

        navigator.clipboard.writeText(text)
            .then(() => {
                toastManager.show('success', 'Link copied to clipboard!');
                this.updateCopyButton('success');
            })
            .catch((err) => {
                toastManager.show('danger', `Failed to copy link: ${err}`);
                this.updateCopyButton('error');
            });
    }

    updateCopyButton(state) {
        if (!this.copyBtn) return;

        const states = {
            success: {
                html: '<i class="bi bi-check"></i> <span>Link Copied!</span>'
            },
            error: {
                html: '<i class="bi bi-exclamation-circle text-danger"></i> <span>Error!</span>'
            },
            default: {
                html: '<i class="bi bi-link"></i> <span>Copy link</span>'
            }
        };

        const newState = states[state] || states.default;
        this.copyBtn.innerHTML = newState.html;

        // Reset button state after delay if success or error
        if (state === 'success' || state === 'error') {
            setTimeout(() => {
                this.copyBtn.innerHTML = states.default.html;
            }, 2000);
        }
    }

    setupEventListeners() {
        // Add click listeners to all share links
        document.querySelectorAll('.share-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const url = window.location.origin + link.dataset.shareUrl;
                const title = link.dataset.shareTitle;
                this.setupShareModal(url, title);
            });
        });

        // Add click listener to copy button
        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', (e) => {
                const url = this.copyBtn.getAttribute('data-url');
                this.copyToClipboard(url);
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ShareManager();
    const shareButtons = document.querySelectorAll('.share-btn');

    // Add event listeners for hover effects
    shareButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            // prevent default action for anchor tags
            event.preventDefault();
            this.classList.add('special-btn');
        });
        button.addEventListener('mouseleave', function() {
            this.classList.remove('special-btn');
        });
    });
});

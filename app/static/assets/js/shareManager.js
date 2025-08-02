// share-links.js
import { ToastManager } from './toast.js';

export default class ShareManager {
    constructor() {
        this.modal = document.getElementById('shareModal');
        this.copyBtn = this.modal?.querySelector('#copyLinkBtn');
        this.setupEventListeners();
        this.toastManager = new ToastManager();
    }

    setupShareModal(url, title, imageUrl = null, description = null) {
        if (!this.modal) return;

        // Set up copy button
        if (this.copyBtn) {
            this.copyBtn.setAttribute('data-url', url);
        }

        // Set up share links
        const fbLink = this.modal.querySelector('.share-facebook');
        if (fbLink) {
            // Facebook allows sharing image through Open Graph meta tags
            fbLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        }

        const twitterXLink = this.modal.querySelector('.share-twitter-x');
        if (twitterXLink) {
            // X (Twitter) doesn't directly support image in share URL
            twitterXLink.href = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        }

        const whatsappLink = this.modal.querySelector('.share-whatsapp');
        if (whatsappLink) {
            whatsappLink.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(title)}%20${encodeURIComponent(url)}`;
        }
        
        // Show image preview if available
        const imagePreview = this.modal.querySelector('.share-image-preview');
        if (imagePreview) {
            if (imageUrl) {
                imagePreview.src = imageUrl;
                imagePreview.alt = title;
                imagePreview.classList.remove('d-none');
            } else {
                imagePreview.classList.add('d-none');
            }
        }

        // Update modal title
        const modalTitle = this.modal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.innerHTML = `<span class="fw-bold">Share</span> ${title}`;
        }
    }

    copyToClipboard(text) {
        if (!text) {
            this.toastManager.show('danger', 'Error', ['No link to copy!']);
            this.updateCopyButton('error');
            return;
        }

        if (!navigator.clipboard) {
            this.toastManager.show('danger', 'Error', ['Clipboard API not supported']);
            return;
        }

        navigator.clipboard.writeText(text)
            .then(() => {
                this.toastManager.show('success', 'Success', ['Link copied to clipboard!']);
                this.updateCopyButton('success');
            })
            .catch((err) => {
                this.toastManager.show('danger', 'Error', [`Failed to copy link: ${err}`]);
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
                const imageUrl = link.dataset.shareImage || null;
                const description = link.dataset.shareDescription || null;
                this.setupShareModal(url, title, imageUrl, description);
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

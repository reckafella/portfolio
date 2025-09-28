/**
 * Wagtail Session Keep-Alive Script
 * Prevents session timeouts during long editing sessions
 */

class WagtailSessionKeepAlive {
    constructor() {
        this.intervalId = null;
        this.keepAliveInterval = 30000; // 30 seconds
        this.isActive = false;
        this.lastActivity = Date.now();
        this.activityThreshold = 60000; // 1 minute
        
        this.init();
    }

    init() {
        // Only run on Wagtail admin pages
        if (!this.isWagtailAdmin()) {
            return;
        }

        this.bindEvents();
        this.startKeepAlive();
        console.log('Wagtail Session Keep-Alive initialized');
    }

    isWagtailAdmin() {
        return window.location.pathname.includes('/admin/') || 
               window.location.pathname.includes('/cms/');
    }

    bindEvents() {
        // Track user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.lastActivity = Date.now();
                if (!this.isActive) {
                    this.startKeepAlive();
                }
            }, true);
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopKeepAlive();
            } else {
                this.startKeepAlive();
            }
        });

        // Handle beforeunload to clean up
        window.addEventListener('beforeunload', () => {
            this.stopKeepAlive();
        });
    }

    startKeepAlive() {
        if (this.isActive) {
            return;
        }

        this.isActive = true;
        this.intervalId = setInterval(() => {
            this.performKeepAlive();
        }, this.keepAliveInterval);
    }

    stopKeepAlive() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isActive = false;
    }

    async performKeepAlive() {
        // Check if user has been active recently
        const timeSinceActivity = Date.now() - this.lastActivity;
        if (timeSinceActivity > this.activityThreshold) {
            this.stopKeepAlive();
            return;
        }

        try {
            // Make a lightweight request to keep session alive
            const response = await fetch('/admin/', {
                method: 'HEAD',
                credentials: 'same-origin',
                cache: 'no-cache'
            });

            if (!response.ok) {
                console.warn('Session keep-alive failed:', response.status);
                this.handleSessionError();
            }
        } catch (error) {
            console.warn('Session keep-alive error:', error);
            this.handleSessionError();
        }
    }

    handleSessionError() {
        // If session appears to be invalid, show a warning
        this.showSessionWarning();
        this.stopKeepAlive();
    }

    showSessionWarning() {
        // Create a non-intrusive warning
        const warning = document.createElement('div');
        warning.id = 'session-warning';
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            max-width: 300px;
        `;
        warning.innerHTML = `
            <strong>Session Warning</strong><br>
            Your session may have expired. Please save your work and refresh the page.
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                float: right;
                cursor: pointer;
                font-size: 18px;
                margin-left: 10px;
            ">×</button>
        `;

        document.body.appendChild(warning);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (warning.parentElement) {
                warning.remove();
            }
        }, 10000);
    }

    // Public method to manually trigger keep-alive
    refresh() {
        this.lastActivity = Date.now();
        if (!this.isActive) {
            this.startKeepAlive();
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WagtailSessionKeepAlive();
    });
} else {
    new WagtailSessionKeepAlive();
}

// Make it globally available for manual control
window.WagtailSessionKeepAlive = WagtailSessionKeepAlive;

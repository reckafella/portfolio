/**
 * Enhanced Session Timeout Manager
 * Only initializes for authenticated users with proper security
 */

class SecureSessionManager {
    constructor(config) {
        this.config = {
            sessionLength: config.sessionLength || 3600, // Default 1 hour
            warningTime: config.warningTime || 300, // Default 5 minutes
            updateInterval: config.updateInterval || 60, // Update every minute
            maxUpdateInterval: config.maxUpdateInterval || 300, // Max 5 minutes between updates
            redirectUrl: config.redirectUrl || '/login/',
            logoutUrl: config.logoutUrl || '/logout/',
            sessionUrl: config.sessionUrl || '/session',
            csrfToken: config.csrfToken || null,
            isAuthenticated: config.isAuthenticated || false,
            debug: config.debug || false
        };

        // Only initialize if user is authenticated
        if (!this.config.isAuthenticated) {
            this.log('User not authenticated, skipping session manager initialization');
            return;
        }

        this.state = {
            timeLeft: this.config.sessionLength,
            lastActivity: Date.now(),
            lastUpdate: 0,
            isWarning: false,
            updateTimer: null,
            checkTimer: null,
            isUpdating: false,
            consecutiveFailures: 0
        };

        this.init();
    }

    log(message, level = 'info') {
        if (this.config.debug) {
            console[level](`[SessionManager] ${message}`);
        }
    }

    init() {
        if (!this.config.isAuthenticated) return;

        this.log('Initializing secure session manager');
        
        // Bind methods to preserve context
        this.handleActivity = this.handleActivity.bind(this);
        this.checkSession = this.checkSession.bind(this);
        this.updateSession = this.updateSession.bind(this);

        // Set up activity listeners
        this.setupActivityListeners();
        
        // Initial session check
        this.checkSession();
        
        // Start periodic checking
        this.startPeriodicCheck();
    }

    setupActivityListeners() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, this.handleActivity, { passive: true });
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.handleActivity();
            }
        });
    }

    handleActivity() {
        if (!this.config.isAuthenticated) return;

        const now = Date.now();
        this.state.lastActivity = now;
        
        // Determine if we should update the session
        const timeSinceLastUpdate = now - this.state.lastUpdate;
        const shouldUpdate = (
            timeSinceLastUpdate > (this.config.updateInterval * 1000) &&
            timeSinceLastUpdate < (this.config.maxUpdateInterval * 1000) &&
            !this.state.isUpdating &&
            this.state.timeLeft > 600 // Only update if more than 10 minutes left
        );

        if (shouldUpdate) {
            this.updateSession();
        }
    }

    async checkSession() {
        if (!this.config.isAuthenticated) return;

        try {
            const response = await fetch(this.config.sessionUrl, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                credentials: 'same-origin'
            });

            if (response.status === 401) {
                this.log('Session expired - redirecting to login');
                this.redirectToLogin();
                return;
            }

            if (response.status === 429) {
                this.log('Session check rate limited - backing off');
                this.state.consecutiveFailures++;
                // Increase check interval when rate limited
                if (this.state.checkTimer) {
                    clearInterval(this.state.checkTimer);
                    this.state.checkTimer = setInterval(() => {
                        this.checkSession();
                    }, 300000); // 5 minutes when rate limited
                }
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.handleSessionData(data);
            this.state.consecutiveFailures = 0;

        } catch (error) {
            this.log(`Session check failed: ${error.message}`, 'error');
            this.state.consecutiveFailures++;
            
            // If too many failures, assume session is invalid
            if (this.state.consecutiveFailures >= 3) {
                this.log('Too many consecutive failures - redirecting to login');
                this.redirectToLogin();
            }
        }
    }

    async updateSession() {
        if (!this.config.isAuthenticated || this.state.isUpdating) return;

        this.state.isUpdating = true;
        this.log('Updating session');

        try {
            const formData = new FormData();
            if (this.config.csrfToken) {
                formData.append('csrfmiddlewaretoken', this.config.csrfToken);
            }

            const response = await fetch(this.config.sessionUrl, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                body: formData,
                credentials: 'same-origin'
            });

            if (response.status === 401) {
                this.log('Session expired during update - redirecting to login');
                this.redirectToLogin();
                return;
            }

            if (response.status === 429) {
                const data = await response.json();
                this.log(`Rate limited - retry after ${data.retry_after} seconds`);
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.handleSessionData(data);
            this.state.lastUpdate = Date.now();
            this.state.consecutiveFailures = 0;
            this.log('Session updated successfully');

        } catch (error) {
            this.log(`Session update failed: ${error.message}`, 'error');
            this.state.consecutiveFailures++;
        } finally {
            this.state.isUpdating = false;
        }
    }

    handleSessionData(data) {
        if (!data.is_authenticated) {
            this.redirectToLogin();
            return;
        }

        this.state.timeLeft = data.expires_in;
        
        // Check if we should show warning
        if (this.state.timeLeft <= this.config.warningTime && !this.state.isWarning) {
            this.showWarning();
        } else if (this.state.timeLeft > this.config.warningTime && this.state.isWarning) {
            this.hideWarning();
        }

        // Check if session has expired
        if (this.state.timeLeft <= 0) {
            this.handleSessionExpiry();
        }
    }

    showWarning() {
        this.state.isWarning = true;
        this.log('Showing session warning');
        
        // Dispatch custom event for UI components to listen to
        document.dispatchEvent(new CustomEvent('sessionWarning', {
            detail: { timeLeft: this.state.timeLeft }
        }));
        
        // You can also show a built-in warning modal here
        this.showWarningModal();
    }

    hideWarning() {
        this.state.isWarning = false;
        this.log('Hiding session warning');
        
        document.dispatchEvent(new CustomEvent('sessionWarningDismissed'));
        this.hideWarningModal();
    }

    showWarningModal() {
        // Create a simple warning modal
        const modal = document.createElement('div');
        modal.id = 'session-warning-modal';
        modal.className = 'session-warning-modal';
        modal.innerHTML = `
            <div class="session-warning-content">
                <h4>Session Expiring Soon</h4>
                <p>Your session will expire in <span id="session-countdown">${Math.floor(this.state.timeLeft / 60)}</span> minutes.</p>
                <button onclick="sessionManager.extendSession()" class="btn btn-primary">Extend Session</button>
                <button onclick="sessionManager.logout()" class="btn btn-secondary">Logout</button>
            </div>
        `;
        
        // Add styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        document.body.appendChild(modal);
        
        // Update countdown
        this.updateCountdown();
    }

    hideWarningModal() {
        const modal = document.getElementById('session-warning-modal');
        if (modal) {
            modal.remove();
        }
    }

    updateCountdown() {
        const countdown = document.getElementById('session-countdown');
        if (countdown && this.state.isWarning) {
            countdown.textContent = Math.floor(this.state.timeLeft / 60);
            setTimeout(() => this.updateCountdown(), 1000);
        }
    }

    extendSession() {
        this.updateSession();
        this.hideWarning();
    }

    logout() {
        window.location.href = this.config.logoutUrl;
    }

    handleSessionExpiry() {
        this.log('Session expired');
        this.cleanup();
        this.redirectToLogin();
    }

    redirectToLogin() {
        this.cleanup();
        window.location.href = this.config.redirectUrl;
    }

    startPeriodicCheck() {
        // Check session every 2 minutes (increased from 30 seconds)
        this.state.checkTimer = setInterval(() => {
            this.checkSession();
        }, 120000); // 2 minutes
    }

    cleanup() {
        this.log('Cleaning up session manager');
        
        if (this.state.checkTimer) {
            clearInterval(this.state.checkTimer);
        }
        
        if (this.state.updateTimer) {
            clearInterval(this.state.updateTimer);
        }
        
        this.hideWarningModal();
        
        // Remove event listeners
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.removeEventListener(event, this.handleActivity);
        });
    }

    destroy() {
        this.cleanup();
        this.config.isAuthenticated = false;
    }
}

// Global session manager instance
let sessionManager = null;

// Initialize session manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we have the necessary data and user is authenticated
    const authElement = document.getElementById('user-logged-in');
    const sessionData = document.getElementById('session-config');
    
    if (authElement && sessionData) {
        try {
            const config = JSON.parse(sessionData.textContent);
            config.isAuthenticated = true;
            
            sessionManager = new SecureSessionManager(config);
            window.sessionManager = sessionManager; // For debugging
            
        } catch (error) {
            console.error('[SessionManager] Failed to initialize:', error);
        }
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureSessionManager;
}

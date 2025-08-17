/**
 * Optimized Session Timeout Manager
 * Reduces request frequency and handles rate limiting gracefully
 * Follows portfolio project patterns for authentication and AJAX handling
 */

class OptimizedSessionManager {
    constructor() {
        this.config = null;
        this.sessionTimer = null;
        this.warningTimer = null;
        this.activityTimer = null;
        this.lastUpdate = 0;
        this.isActive = false;
        this.failureCount = 0;
        this.maxFailures = 3;
        this.backoffMultiplier = 2;
        this.requestInProgress = false;
        
        // Only initialize if user is authenticated - following portfolio pattern
        if (this.isUserAuthenticated()) {
            this.init();
        } else {
            this.log('User not authenticated, skipping session manager initialization');
        }
    }

    isUserAuthenticated() {
        // Check multiple indicators following portfolio project patterns
        const sessionConfig = document.getElementById('session-config');
        const userLoggedIn = document.querySelector('[data-user-authenticated]');
        const authMeta = document.querySelector('meta[name="user-authenticated"]');
        
        return sessionConfig || userLoggedIn || authMeta;
    }

    init() {
        try {
            const configElement = document.getElementById('session-config');
            if (!configElement) {
                this.log('No session config found', 'warn');
                return;
            }
            
            this.config = JSON.parse(configElement.textContent);
            this.log('Session manager initialized', this.config);
            
            // Optimize intervals to reduce requests - following portfolio rate limiting
            this.config.updateInterval = Math.max(this.config.updateInterval || 120, 180); // Min 3 minutes
            this.config.maxUpdateInterval = Math.max(this.config.maxUpdateInterval || 600, 900); // Max 15 minutes
            this.config.warningTime = this.config.warningTime || 300; // 5 minutes default
            
            this.bindEvents();
            this.startSessionCheck();
            
        } catch (error) {
            console.error('[SessionManager] Initialization failed:', error);
        }
    }

    bindEvents() {
        // Throttled activity detection - portfolio project pattern
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        let lastActivity = 0;
        
        const throttledActivity = () => {
            const now = Date.now();
            // Only trigger once per minute to reduce requests
            if (now - lastActivity > 60000) {
                lastActivity = now;
                this.onUserActivity();
            }
        };

        activityEvents.forEach(event => {
            document.addEventListener(event, throttledActivity, { passive: true });
        });

        // Page visibility changes - following browser best practices
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.isActive) {
                // Only check if page becomes visible and we were active
                setTimeout(() => this.checkSessionStatus(), 2000);
            }
        });

        // Window beforeunload - cleanup
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    onUserActivity() {
        this.isActive = true;
        const now = Date.now();
        
        // Only update if enough time has passed and no request is in progress
        // Following portfolio project's conservative approach to API calls
        if (!this.requestInProgress && 
            now - this.lastUpdate > this.config.updateInterval * 1000) {
            this.updateSession();
        }
    }

    async updateSession() {
        if (this.requestInProgress || !this.config) return;
        
        try {
            this.requestInProgress = true;
            const response = await this.makeSessionRequest('POST');
            
            if (response.ok) {
                const data = await response.json();
                this.handleSessionResponse(data);
                this.lastUpdate = Date.now();
                this.failureCount = 0;
                this.log('Session updated successfully');
            } else if (response.status === 429) {
                this.handleRateLimit();
            } else if (response.status === 401) {
                this.handleSessionExpired();
            } else {
                this.handleFailure();
            }
        } catch (error) {
            this.log(`Session update error: ${error.message}`, 'error');
            this.handleFailure();
        } finally {
            this.requestInProgress = false;
        }
    }

    async checkSessionStatus() {
        if (this.requestInProgress || !this.config) return;
        
        try {
            this.requestInProgress = true;
            const response = await this.makeSessionRequest('GET');
            
            if (response.ok) {
                const data = await response.json();
                this.handleSessionResponse(data);
                this.failureCount = 0;
            } else if (response.status === 429) {
                this.handleRateLimit();
            } else if (response.status === 401) {
                this.handleSessionExpired();
            } else {
                this.handleFailure();
            }
        } catch (error) {
            this.log(`Session check error: ${error.message}`, 'error');
            this.handleFailure();
        } finally {
            this.requestInProgress = false;
        }
    }

    async makeSessionRequest(method) {
        // Following portfolio project's AJAX patterns
        const headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        };

        const options = {
            method: method,
            headers: headers,
            credentials: 'same-origin'
        };

        // Add CSRF token for POST requests - portfolio project pattern
        if (method === 'POST' && this.config.csrfToken) {
            const formData = new FormData();
            formData.append('csrfmiddlewaretoken', this.config.csrfToken);
            options.body = formData;
        }

        return fetch(this.config.sessionUrl, options);
    }

    handleRateLimit() {
        this.failureCount++;
        const backoffTime = Math.min(
            this.config.maxUpdateInterval * this.backoffMultiplier, 
            1800 // Max 30 minutes
        );
        
        this.log(`Rate limited. Backing off for ${backoffTime} seconds`);
        
        // Exponential backoff - wait longer before next request
        setTimeout(() => {
            this.lastUpdate = 0; // Reset to allow next update
        }, backoffTime * 1000);
    }

    handleFailure() {
        this.failureCount++;
        
        if (this.failureCount >= this.maxFailures) {
            this.log('Max failures reached. Stopping session updates.');
            this.stopSessionCheck();
            return;
        }
        
        // Linear backoff for failures - portfolio project conservative approach
        const delay = this.failureCount * 120000; // 2, 4, 6 minutes
        setTimeout(() => {
            this.lastUpdate = 0;
        }, delay);
    }

    handleSessionResponse(data) {
        if (!data.is_authenticated) {
            this.handleSessionExpired();
            return;
        }

        if (data.expires_in !== undefined) {
            const remaining = data.expires_in;
            
            // Only show warning if session is actually ending soon
            if (remaining <= this.config.warningTime && !this.warningTimer) {
                this.showSessionWarning(remaining);
            } else if (remaining > this.config.warningTime && this.warningTimer) {
                this.hideSessionWarning();
            }
        }
    }

    showSessionWarning(remainingTime) {
        if (this.warningTimer) return; // Already showing warning
        
        this.log(`Session warning: ${remainingTime} seconds remaining`);
        
        // Create warning modal - following portfolio project's modal patterns
        this.createWarningModal(remainingTime);
        
        // Dispatch custom event for other components - portfolio project pattern
        document.dispatchEvent(new CustomEvent('sessionWarning', {
            detail: { remainingTime }
        }));

        // Update countdown every second
        this.warningTimer = setInterval(() => {
            remainingTime--;
            this.updateWarningCountdown(remainingTime);
            
            if (remainingTime <= 0) {
                this.handleSessionExpired();
            }
        }, 1000);
    }

    createWarningModal(remainingTime) {
        // Remove existing modal if any
        this.hideSessionWarning();

        const modal = document.createElement('div');
        modal.id = 'session-warning-modal';
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.zIndex = '10000';

        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-dark">
                        <h5 class="modal-title">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            Session Expiring Soon
                        </h5>
                    </div>
                    <div class="modal-body text-center">
                        <p class="mb-3">Your session will expire in:</p>
                        <h3 class="text-danger mb-4">
                            <span id="session-countdown">${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')}</span>
                        </h3>
                        <p class="text-muted">Choose an action to continue:</p>
                    </div>
                    <div class="modal-footer justify-content-center">
                        <button type="button" class="btn btn-primary me-2" onclick="window.sessionManager.extendSession()">
                            <i class="bi bi-arrow-clockwise me-1"></i>
                            Extend Session
                        </button>
                        <button type="button" class="btn btn-outline-secondary" onclick="window.sessionManager.logout()">
                            <i class="bi bi-box-arrow-right me-1"></i>
                            Logout Now
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    updateWarningCountdown(remainingTime) {
        const countdown = document.getElementById('session-countdown');
        if (countdown) {
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            countdown.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    hideSessionWarning() {
        const modal = document.getElementById('session-warning-modal');
        if (modal) {
            modal.remove();
        }
        
        if (this.warningTimer) {
            clearInterval(this.warningTimer);
            this.warningTimer = null;
        }

        document.dispatchEvent(new CustomEvent('sessionWarningDismissed'));
    }

    extendSession() {
        this.hideSessionWarning();
        this.updateSession();
    }

    logout() {
        this.cleanup();
        window.location.href = this.config.logoutUrl;
    }

    startSessionCheck() {
        // Initial check after a short delay
        setTimeout(() => this.checkSessionStatus(), 5000);
        
        // Regular checks with increased interval - portfolio project conservative approach
        this.sessionTimer = setInterval(() => {
            if (this.isActive && !document.hidden) {
                this.checkSessionStatus();
            }
        }, this.config.updateInterval * 1000);
    }

    stopSessionCheck() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
        this.hideSessionWarning();
    }

    handleSessionExpired() {
        this.log('Session expired. Redirecting to login.');
        this.cleanup();
        window.location.href = this.config.redirectUrl;
    }

    cleanup() {
        this.stopSessionCheck();
        this.hideSessionWarning();
        
        // Remove activity listeners
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.removeEventListener(event, this.onUserActivity);
        });
    }

    log(message, level = 'info') {
        if (this.config?.debug) {
            console[level](`[OptimizedSessionManager] ${message}`);
        }
    }
}

// Global session manager instance - following portfolio project patterns
let sessionManager = null;

// Initialize session manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we have the necessary data and user is authenticated
    if (document.getElementById('session-config')) {
        try {
            sessionManager = new OptimizedSessionManager();
            window.sessionManager = sessionManager; // For debugging and global access
            
        } catch (error) {
            console.error('[OptimizedSessionManager] Failed to initialize:', error);
        }
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (sessionManager) {
        sessionManager.cleanup();
    }
});

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizedSessionManager;
}

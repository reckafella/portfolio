/**
 * Session Timeout Manager
 * Reduces request frequency and handles rate limiting gracefully
 */

class SessionTimeoutManager {
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
        
        // Only initialize if user is authenticated
        if (document.getElementById('session-config')) {
            this.init();
        }
    }

    init() {
        try {
            const configElement = document.getElementById('session-config');
            if (!configElement) return;
            
            this.config = JSON.parse(configElement.textContent);
            this.log('Session manager initialized', this.config);
            
            // Increase update intervals to reduce requests
            this.config.updateInterval = Math.max(this.config.updateInterval, 180); // Min 3 minutes
            this.config.maxUpdateInterval = Math.max(this.config.maxUpdateInterval, 900); // Max 15 minutes
            
            this.bindEvents();
            this.startSessionCheck();
            
        } catch (error) {
            console.error('Session manager initialization failed:', error);
        }
    }

    bindEvents() {
        // Throttled activity detection - only check once per minute
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        let lastActivity = 0;
        
        const throttledActivity = () => {
            const now = Date.now();
            if (now - lastActivity > 60000) { // Only trigger once per minute
                lastActivity = now;
                this.onUserActivity();
            }
        };

        activityEvents.forEach(event => {
            document.addEventListener(event, throttledActivity, { passive: true });
        });

        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.isActive) {
                this.checkSessionStatus();
            }
        });
    }

    onUserActivity() {
        this.isActive = true;
        const now = Date.now();
        
        // Only update if enough time has passed and no request is in progress
        if (!this.requestInProgress && 
            now - this.lastUpdate > this.config.updateInterval * 1000) {
            this.updateSession();
        }
    }

    async updateSession() {
        if (this.requestInProgress) return;
        
        try {
            this.requestInProgress = true;
            const response = await this.makeSessionRequest('POST');
            
            if (response.ok) {
                this.lastUpdate = Date.now();
                this.failureCount = 0;
                this.log('Session updated successfully');
            } else if (response.status === 429) {
                this.handleRateLimit();
            } else {
                this.handleFailure();
            }
        } catch (error) {
            this.log('Session update error:', error);
            this.handleFailure();
        } finally {
            this.requestInProgress = false;
        }
    }

    async checkSessionStatus() {
        if (this.requestInProgress) return;
        
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
            this.log('Session check error:', error);
            this.handleFailure();
        } finally {
            this.requestInProgress = false;
        }
    }

    async makeSessionRequest(method) {
        const options = {
            method: method,
            headers: {
                'X-CSRFToken': this.config.csrfToken,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        };

        return fetch(this.config.sessionUrl, options);
    }

    handleRateLimit() {
        this.failureCount++;
        const backoffTime = this.config.maxUpdateInterval * this.backoffMultiplier;
        
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
        
        // Linear backoff for failures
        const delay = this.failureCount * 60000; // 1, 2, 3 minutes
        setTimeout(() => {
            this.lastUpdate = 0;
        }, delay);
    }

    handleSessionResponse(data) {
        if (data.remaining_time) {
            const remaining = data.remaining_time;
            
            // Only show warning if session is actually ending soon
            if (remaining <= this.config.warningTime && !this.warningTimer) {
                this.showSessionWarning(remaining);
            }
        }
    }

    showSessionWarning(remainingTime) {
        // Implementation for session warning modal
        this.log(`Session warning: ${remainingTime} seconds remaining`);
        
        // Dispatch custom event for other components
        document.dispatchEvent(new CustomEvent('sessionWarning', {
            detail: { remainingTime }
        }));
    }

    startSessionCheck() {
        // Initial check after a short delay
        setTimeout(() => this.checkSessionStatus(), 5000);
        
        // Regular checks with increased interval
        this.sessionTimer = setInterval(() => {
            if (this.isActive) {
                this.checkSessionStatus();
            }
        }, this.config.updateInterval * 1000);
    }

    stopSessionCheck() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
        if (this.warningTimer) {
            clearInterval(this.warningTimer);
            this.warningTimer = null;
        }
    }

    handleSessionExpired() {
        this.log('Session expired. Redirecting to login.');
        this.stopSessionCheck();
        window.location.href = this.config.redirectUrl;
    }

    log(message, data = null) {
        if (this.config?.debug) {
            console.log(`[SessionManager] ${message}`, data || '');
        }
    }
}

// Initialize session manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sessionManager = new SessionTimeoutManager();
    });
} else {
    window.sessionManager = new SessionTimeoutManager();
}

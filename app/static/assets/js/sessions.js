class SessionTimeout {
  constructor(options = {}) {
		this.warningTime = options.warningTime || 300;
		this.redirectUrl = options.redirectUrl || '/login';
		this.sessionLength = options.sessionLength || 3600;
		this.logoutUrl = options.logoutUrl || '/logout';
		this.warningShown = false;
		this.checkInterval = null;
		this.countdownInterval = null;
		this.isLoggingOut = false;
		this.boundResetTimer = this.resetTimer.bind(this);
		this.resetTimerTimeout = null;
		this.lastActivityTime = Date.now();
		this.startTimer();
		this.userActivity = ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'];

		window.addEventListener('beforeunload', () => this.cleanup());
  }

	getCsrfToken() {
		const name = 'csrftoken';
		let cookieValue = null;
		if (document.cookie && document.cookie !== '') {
			const cookies = document.cookie.split(';');
			for (let i = 0; i < cookies.length; i++) {
				const cookie = cookies[i].trim();
				if (cookie.substring(0, name.length + 1) === (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}

	resetTimer() {
		if (this.isLoggingOut || this.resetTimerTimeout) {
			return;
		}

		this.resetTimerTimeout = setTimeout(async () => {
			try {
				const response = await fetch('/session', {
					method: 'POST',
					headers: {
						'X-CSRFToken': this.getCsrfToken(),
						'Content-Type': 'application/json',
						'X-Requested-With': 'XMLHttpRequest'
					},
					credentials: 'same-origin'
				});
				if (!response.ok) {
					if (response.status === 401 || response.status === 403) {
						this.handleTimeout();
					}
					console.error('Failed to update session');
				}
			} catch (error) {
				console.error('Error updating session:', error);
			} finally {
				this.resetTimerTimeout = null;
			}
		}, 500);
	}

  async checkSession() {
		if (this.isLoggingOut) {
			return;
		}

		try {
			const response = await fetch('/session', {
				method: 'GET',
				headers: {'X-Requested-With': 'XMLHttpRequest'}
			});
			if (!response.ok) {
				if (response.status === 401 || response.status === 403) {
					this.handleTimeout();
					return;
				}
				throw new Error('Session check failed');
			}

			const data = await response.json();
			const timeLeft = data.expires_in;

			if (timeLeft <= this.warningTime && !this.warningShown) {
				this.showWarning(timeLeft);
			} else if (timeLeft <= 0) {
				this.handleTimeout();
			}
		} catch (error) {
			console.error('Error checking session:', error);
		}
  }

  async showWarning(timeLeft) {
		this.warningShown = true;
		let remainingSeconds = timeLeft;
		const timeToSessionExp = 'Your session will expire in ';
		const warning = 'When the timer runs out, you\'ll be logged out';
		const callToAct = 'Would you like to extend your session?';

		const result = await Swal.fire({
			title: 'Session Expiring Soon!',
			html: `${timeToSessionExp}<b id="countdown">--:--</b><br>${warning}</br>${callToAct}`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, extend session',
			cancelButtonText: 'Logout now',
			allowOutsideClick: false,
			allowEscapeKey: false,
			didOpen: () => {
				const countdownElement = Swal.getHtmlContainer().querySelector('#countdown');
				this.countdownInterval = setInterval(() => {
					remainingSeconds--;
					const minutes = Math.floor(remainingSeconds / 60);
					const seconds = remainingSeconds % 60;
					countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
					
					if (remainingSeconds <= 0) {
						clearInterval(this.countdownInterval);
						this.handleTimeout();
					}
				}, 1000);
			},
			willClose: () => {
				clearInterval(this.countdownInterval);
			}
		});

		if (result.isConfirmed) {
			this.resetTimer();
			this.warningShown = false;
		} else {
			await this.performLogout();
		}
	}

	async performLogout() {
		this.isLoggingOut = true;
		await this.cleanup();
		await this.logout();
	}

	async logout() {
		try {
			const response = await fetch(this.logoutUrl, {
				method: 'POST',
				headers: {
					'X-CSRFToken': this.getCsrfToken(),
					'Content-Type': 'application/json',
					'X-Requested-With': 'XMLHttpRequest'
				},
				credentials: 'same-origin'
			});
			if (!response.ok) {
				throw new Error('Logout failed');
			}
			const data = await response.json();
			if (data.success) {
			// Use the redirect URL from the server response
				window.location.href = data.redirect_url;
			} else {
				throw new Error(data.message || 'Logout failed');
			}
		} catch (error) {
			console.error('Error during logout:', error);
			// Fallback to GET logout
			window.location.href = this.logoutUrl;
		}
	}

	async handleTimeout() {
		this.isLoggingOut = true;
		await this.cleanup();

		await Swal.fire({
			title: 'Session Expired',
			text: 'Your session has expired. Please log in again.',
			icon: 'info',
			confirmButtonText: 'Login',
			allowOutsideClick: false,
			allowEscapeKey: false
		});
		await this.logout();
	}
	startTimer() {
		let checkFrequency = 30000; // 30 seconds
		let maxFrequncy = 120000; // 1 minute
		this.checkInterval = setInterval(() => {
			this.checkSession();
			/* if not user activity, reduce check frequency */
			const timeSinceLastActivity = Date.now() - this.lastActivityTime;
			if (timeSinceLastActivity > 5 * 60 * 1000) { // 5 minutes
				clearInterval(this.checkInterval);
				checkFrequency = Math.min(checkFrequency * 2, maxFrequncy);
				this.checkInterval = setInterval(() => this.checkSession(), checkFrequency);
			}
		}, checkFrequency);
		this.lastActivityTime = Date.now();
		// Reset the timer on user activity

		userActivity.forEach(event => {
			document.addEventListener(event, () => {
				this.lastActivityTime = Date.now();
				this.boundResetTimer();
			});
		});
	}

	cleanup() {
		return new Promise((resolve) => {
			clearInterval(this.checkInterval);
			clearInterval(this.countdownInterval);

			this.userActivity.forEach(event => {
				document.removeEventListener(event, this.boundResetTimer);
			});

			// Give a small delay to ensure all pending operations are complete
			setTimeout(resolve, 2000);
		});
	}
}

// Initialize when document is ready
let sessionTimeoutInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  const userLoggedIn = document.getElementById('user-logged-in') !== null;

  if (userLoggedIn) {
      sessionTimeoutInstance = new SessionTimeout({
          sessionLength: 1800,
          warningTime: 300,
          redirectUrl: "/login",
          logoutUrl: "/logout",
      });
  }
});

export const sessionTimeout = new SessionTimeout();

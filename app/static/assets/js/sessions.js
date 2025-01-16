class SessionTimeout {
      constructor(options = {}) {
        this.warningTime = options.warningTime || 5 * 60; // 5 minutes before expiry
        this.redirectUrl = options.redirectUrl || '/accounts/login/';
        this.sessionLength = options.sessionLength || 3600; // 1 hour
        this.warningShown = false;
        this.startTimer();
      }

      startTimer() {
        // Reset timer on user activity
        ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
          document.addEventListener(event, () => this.resetTimer());
        });

        this.checkSession();
      }

      resetTimer() {
        // Update last activity timestamp on server
        fetch('/update-session/', {
          method: 'POST',
          headers: {
            'X-CSRFToken': this.getCsrfToken(),
          },
        }).catch(console.error);

        if (this.warningShown) {
          Swal.close();
          this.warningShown = false;
        }

        this.checkSession();
      }

      getCsrfToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value;
      }

      async checkSession() {
        const response = await fetch('/check-session/');
        const data = await response.json();
        
        const timeLeft = data.expires_in;
        
        if (timeLeft <= this.warningTime && !this.warningShown) {
          this.showWarning(timeLeft);
        } else if (timeLeft <= 0) {
          this.handleTimeout();
        } else {
          // Check again in 30 seconds
          setTimeout(() => this.checkSession(), 30000);
        }
      }

      async showWarning(timeLeft) {
        this.warningShown = true;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        const result = await Swal.fire({
          title: 'Session Expiring Soon!',
          html: `Your session will expire in ${minutes}:${seconds.toString().padStart(2, '0')} minutes.<br>Would you like to continue your session?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, extend session',
          cancelButtonText: 'Logout now',
          allowOutsideClick: false
        });

        if (result.isConfirmed) {
          this.resetTimer();
        } else {
          window.location.href = this.redirectUrl;
        }
      }

      handleTimeout() {
        Swal.fire({
          title: 'Session Expired',
          text: 'Your session has expired. Please log in again.',
          icon: 'info',
          confirmButtonText: 'Login'
        }).then(() => {
          window.location.href = this.redirectUrl;
        });
      }
    }

    // Initialize session timeout
    document.addEventListener('DOMContentLoaded', () => {
      new SessionTimeout({
        sessionLength: 3600,    // 1 hour in seconds
        warningTime: 300,       // Show warning 5 minutes before expiry
        redirectUrl: '/accounts/login/'
      });
    });

export const SetSessionTimeout = new SessionTimeout();
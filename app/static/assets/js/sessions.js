// static/js/session-timeout.js
class SessionTimeout {
  constructor(options = {}) {
      this.warningTime = options.warningTime || 300;
      this.redirectUrl = options.redirectUrl || '/accounts/login/';
      this.sessionLength = options.sessionLength || 3600;
      this.logoutUrl = options.logoutUrl || '/logout/';
      this.warningShown = false;
      this.checkInterval = null;
      this.countdownInterval = null;
      this.startTimer();
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

  async resetTimer() {
      try {
          const response = await fetch('/session/update', {
              method: 'POST',
              headers: {
                  'X-CSRFToken': this.getCsrfToken(),
                  'Content-Type': 'application/json',
              },
              credentials: 'same-origin'
          });
          
          if (!response.ok) {
              console.error('Failed to update session');
          }
      } catch (error) {
          console.error('Error updating session:', error);
      }
  }

  async checkSession() {
      try {
          const response = await fetch('/session/check');
          if (!response.ok) {
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
      
      const result = await Swal.fire({
          title: 'Session Expiring Soon!',
          html: `Your session will expire in <b id="countdown">--:--</b><br>Would you like to continue your session?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, extend session',
          cancelButtonText: 'Logout now',
          allowOutsideClick: false,
          didOpen: () => {
              const countdownElement = Swal.getHtmlContainer().querySelector('#countdown');
              this.countdownInterval = setInterval(() => {
                  remainingSeconds--;
                  const minutes = Math.floor(remainingSeconds / 60);
                  const seconds = remainingSeconds % 60;
                  
                  countdownElement.textContent = 
                      `${minutes}:${seconds.toString().padStart(2, '0')}`;
                  
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
          window.location.href = this.logoutUrl;
      }
  }

  handleTimeout() {
      clearInterval(this.checkInterval);
      clearInterval(this.countdownInterval);
      
      Swal.fire({
          title: 'Session Expired',
          text: 'Your session has expired. Please log in again.',
          icon: 'info',
          confirmButtonText: 'Login',
          allowOutsideClick: false
      }).then(() => {
          window.location.href = this.logoutUrl;
      });
  }

  startTimer() {
      this.checkInterval = setInterval(() => this.checkSession(), 30000);

      ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
          document.addEventListener(event, () => this.resetTimer());
      });
  }
}

export const sessionTimeout = new SessionTimeout;


/*
import { toastManager } from "./toast.js";

class SessionTimeout {
  constructor(options = {}) {
    this.warningTime = options.warningTime || 60; // 5 minutes before expiry
    this.redirectUrl = options.redirectUrl || '/login'; // Redirect to login page
    this.sessionLength = options.sessionLength || 300; // 1 hour
    this.warningShown = false;
    this.logoutUrl = options.logoutUrl || "/logout";
    this.countDownInterval = null;
    this.checkInterval = null;
    this.startTimer();
  }

  getCsrfToken() {
    // Look for the token in cookie
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

  async showWarning(timeLeft) {
    this.warningShown = true;
    let remainingSeconds = timeLeft;
    
    const result = await Swal.fire({
      title: 'Session Expiring Soon!',
      html: `Your session will expire in <b id="countdown">--:--</b><br>Would you like to continue your session?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, extend session',
      cancelButtonText: 'Logout now',
      allowOutsideClick: false,
      didOpen: () => {
        // Start countdown when popup opens
        const countdownElement = Swal.getHtmlContainer().querySelector('#countdown');
        this.countdownInterval = setInterval(() => {
          remainingSeconds--;
          const minutes = Math.floor(remainingSeconds / 60);
          const seconds = remainingSeconds % 60;
          
          countdownElement.textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
          
          if (remainingSeconds <= 0) {
            clearInterval(this.countdownInterval);
            this.handleTimeout();
          }
        }, 1000);
      },
      willClose: () => {
        // Clean up interval when popup closes
        clearInterval(this.countdownInterval);
      }
    });

    if (result.isConfirmed) {
      this.resetTimer();
      this.warningShown = false;
    } else {
      window.location.href = this.logoutUrl;
    }
  }

  handleTimeout() {
    clearInterval(this.checkInterval);
    clearInterval(this.countdownInterval);  // Clear countdown if it's still running
    
    Swal.fire({
      title: 'Session Expired',
      text: 'Your session has expired. Please log in again.',
      icon: 'info',
      confirmButtonText: 'Login',
      allowOutsideClick: false
    }).then(() => {
      // wait for user activity before redirecting.
      window.location.href = this.logoutUrl;
    });
  }

  async resetTimer() {
    try {
      const response = await fetch('/session/update', {
        method: 'POST',
        headers: {
          'X-CSRFToken': this.getCsrfToken(),
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error('Failed to update session');
      }
    } catch (error) {
      toastManager.show('danger', error.message);
    }
  }

  async checkSession() {
    try {
      const response = await fetch('/session/check');
      if (!response.ok) {
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
      toastManager.show('danger', error.message);
    }
  }

  startTimer() {
    // Check session every 30 seconds
    this.checkInterval = setInterval(() => this.checkSession(), 30000);

    // Reset timer on user activity
    ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.resetTimer());
    });
  }
}
const userLoggedIn = document.getElementById('user-logged-in') !== null;

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
  if (userLoggedIn) {
    new SessionTimeout({
      sessionLength: 300,
      warningTime: 60,
      redirectUrl: "/login",
    });
  }
});
class SessionTimeout {
  constructor(options = {}) {
    this.warningTime = options.warningTime || 60; // 5 minutes before expiry
    this.redirectUrl = options.redirectUrl || '/login'; // Redirect to login page
    this.sessionLength = options.sessionLength || 300; // 1 hour
    this.warningShown = false;
    this.logoutUrl = "/logout";
    this.checkInterval = null;
    this.startTimer();
  }

  startTimer() {
    // Check session every 30 seconds
    this.checkInterval = setInterval(() => this.checkSession(), 30000);

    // Reset timer on user activity
    ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.resetTimer());
    });
  }

  async resetTimer() {
    try {
      const response = await fetch('/session/update', {
        method: 'POST',
        headers: {
          'X-CSRFToken': this.getCsrfToken(),
        },
      });
      
      if (!response.ok) {
        console.error('Failed to update session');
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }

  getCsrfToken() {
    // Look for the token in cookie
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

  async checkSession() {
    try {
      const response = await fetch('/session/check');
      if (!response.ok) {
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
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const result = await Swal.fire({
      title: 'Session Expiring Soon!',
      html: `Your session will expire in ${minutes}:${seconds.toString().padStart(2, '0')} minute(s).<br>Would you like to continue your session?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Extend Session',
      cancelButtonText: 'Logout now',
      allowOutsideClick: false
    });

    if (result.isConfirmed) {
      this.resetTimer();
      this.warningShown = false;
    } else {
      window.location.href = this.logoutUrl;
    }
  }

  handleTimeout() {
    clearInterval(this.checkInterval);
    Swal.fire({
      title: 'Session Expired',
      text: 'Your session has expired. Please log in again.',
      icon: 'info',
      confirmButtonText: 'Login'
    }).then(() => {
      window.location.href = this.redirectUrl;
    });
  }
} */

import { sessionTimeout } from 'session-timeout';

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    function setupSessionTimeout() {
        if (document.getElementById('user-logged-in')) {
            new sessionTimeout({
                sessionLength: '{{ request.session.get_expiry_age|default:0 }}',
                warningTime: 300,
                redirectUrl: '{% url "authentication:login" %}',
                logoutUrl: '{% url "authentication:logout" %}',
            });
        }
    }
    setupSessionTimeout();
});

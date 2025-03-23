import { sessionTimeout } from 'session-timeout';

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    function setupSessionTimeout() {
        if (document.getElementById('user-logged-in')) {
            new sessionTimeout({
                sessionLength: '{{ request.session.get_expiry_age|default:0 }}',
                warningTime: 60,
                redirectUrl: '{% url "app:login" %}',
                logoutUrl: '{% url "app:logout" %}',
            });
        }
    }
    setupSessionTimeout();
});

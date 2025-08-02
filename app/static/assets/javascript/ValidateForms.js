import { AuthForm } from './forms/AuthForm.js';
import { BlogPostForm } from './forms/BlogPostForm.js';
import { ContactForm } from './forms/ContactForm.js';
import { PasswordChangeForm } from './forms/PasswordChangeForm.js';
import { ProjectsForm } from './forms/ProjectsForm.js';
import { ToastManager } from '../js/toast.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize forms based on what exists in the page
    // Toast notifications
    const toastManager = new ToastManager();
    window.toastManager = toastManager;
    // Set up global validation errors object
    window.validationErrors = {};
    window.submitButton = document.querySelector('#submitButton');

    // Update submit button state based on validation errors
    window.updateSubmitButton = (state) => {
        if (state === 'disabled' || Object.keys(window.validationErrors).length > 0) {
            window.submitButton.disabled = true;
        } else {
            window.submitButton.disabled = false;
        }
    };

    // Auth forms
    if (document.getElementById('auth-form')) {
        new AuthForm('auth-form');
    }

    // Contact form
    if (document.getElementById('contact-form')) {
        new ContactForm('contact-form');
    }

    // Password change form
    if (document.getElementById('change-password-form')) {
        new PasswordChangeForm('change-password-form');
    }

    // Projects form
    if (document.getElementById('project-form')) {
        new ProjectsForm('project-form');
    }
    // Blog post form
    if (document.getElementById('blog-post-form')) {
        new BlogPostForm('blog-post-form');
    }
});

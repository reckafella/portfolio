import { FormInputValidator } from './form-input.js';

// Example 2: Login Form
document.addEventListener('DOMContentLoaded', function() {
    const loginValidator = new FormInputValidator('other-form', {
        fields: {
            'id_username': { 
                type: 'username', 
                maxLength: 30, 
                required: true,
                errorMessage: 'Username can only contain letters, numbers, and underscores'
            },
            'id_password': { 
                type: 'password', 
                minLength: 8,
                maxLength: 60,
                required: true,
                minLengthMessage: 'Password must be at least 8 characters long'
            },
            'id_captcha_1': { 
                type: 'captcha', 
                required: true 
            }
        },
        showCharacterCount: false // Disable character counting for login
    });
});

// Example 3: Registration Form
document.addEventListener('DOMContentLoaded', function() {
    const registrationValidator = new FormInputValidator('other-form', {
        fields: {
            'id_username': { 
                type: 'username', 
                maxLength: 30, 
                required: true 
            },
            'id_email': { 
                type: 'email', 
                required: true 
            },
            'id_password1': { 
                type: 'password', 
                minLength: 8,
                maxLength: 60,
                required: true 
            },
            'id_password2': { 
                minLength: 8,
                maxLength: 60,
                required: true,
                // Custom validation for password confirmation
                pattern: null, // We'll handle this with custom validation
                errorMessage: 'Passwords do not match'
            },
            'id_first_name': { 
                type: 'text', 
                maxLength: 50, 
                required: true 
            },
            'id_last_name': { 
                type: 'text', 
                maxLength: 50, 
                required: true 
            },
            'id_captcha_1': { 
                type: 'captcha', 
                required: true 
            }
        }
    });
    
    // Add custom password confirmation validator
    registrationValidator.addValidator('passwordConfirm', function(value) {
        const password1 = document.getElementById('id_password1').value;
        return value === password1;
    }, 'Passwords do not match');
    
    // Update password2 field to use custom validator
    registrationValidator.config.fields['id_password2'].type = 'passwordConfirm';

    registrationValidator.init();
});

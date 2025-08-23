import { FormManager } from './manager/FormManager.js';
import { PasswordValidator } from './validators/PasswordValidator.js';

/**
 * PasswordChangeForm handles the password change functionality
 * It initializes the form manager and sets up validators for the password change form.
 * This form allows users to change their password by validating the old password and the new password entries.
 * It includes features like password strength indicators and toggles for password visibility.
 * @class PasswordChangeForm
 */
export class PasswordChangeForm {
    /**
     * Initialize password change form
     */
    constructor(formId) {
        const fieldConfigs = {
            'id_old_password': { min: 8, max: 64, counterId: 'id_old_password-count' },
            'id_new_password1': { min: 8, max: 64, counterId: 'id_new_password1-count' },
            'id_new_password2': { min: 8, max: 64, counterId: 'id_new_password2-count' }
        };

        // Create form manager
        this.formManager = new FormManager(formId, fieldConfigs);

        // Set up validators
        this.setupValidators();

        // Now set up fields with validation
        this.formManager.setupFields();
    }

    /**
     * Set up form validators
     */
    setupValidators() {
        // Create password validator
        const passwordValidator = new PasswordValidator(this.formManager);

        // Register validators
        this.formManager.registerValidator('id_old_password',
            () => passwordValidator.validate('id_old_password'));

        this.formManager.registerValidator('id_new_password1',
            () => {
                passwordValidator.validate('id_new_password1');
                passwordValidator.validatePasswordChangeForm('id_old_password', 'id_new_password1', 'id_new_password2');
            });

        this.formManager.registerValidator('id_new_password2',
            () => passwordValidator.validateConfirmation('id_new_password1', 'id_new_password2'));

        // Add password toggles
        passwordValidator.createToggle('id_old_password');
        passwordValidator.createToggle('id_new_password1');
        passwordValidator.createToggle('id_new_password2');

        // Add password strength indicator for new password
        passwordValidator.createStrengthIndicator('id_new_password1');
    }
}

// Initialize password change form when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('password-change-form')) {
        new PasswordChangeForm('password-change-form');
    }
});

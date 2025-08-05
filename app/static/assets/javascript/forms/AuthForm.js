import { FormManager } from './manager/FormManager.js';
import { UsernameValidator } from './validators/UsernameValidator.js';
import { PasswordValidator } from './validators/PasswordValidator.js';
import { CaptchaValidator } from './validators/CaptchaValidator.js';
import { EmailValidator } from './validators/EmailValidator.js';
import { NameValidator } from './validators/NameValidator.js';


/** * AuthForm handles the authentication forms (login and signup)
 * It initializes the form manager and sets up validators for the authentication forms.
 * This form allows users to log in or register by validating username, password, email, and captcha.
 * It includes features like password strength indicators and toggles for password visibility.
 * @class AuthForm
 */
export class AuthForm {
    /**
     * Initialize authentication form
     * @param {string} formId - Form ID (e.g., 'login-form', 'signup-form')
     */
    constructor(formId) {
        // Define field configurations based on form type
        let isSignupForm = false;
        if (document.getElementById('password2') || document.getElementById('id_email')) {
            isSignupForm = true;
        } else {
            isSignupForm = false;
        }

        // Basic field configurations
        const fieldConfigs = {
            'id_username': { min: 3, max: 50, counterId: 'id_username-count', required: true },
            'password1': { min: 8, max: 64, counterId: 'id_password1-count', required: true },
            'id_captcha_1': { length: 6, counterId: 'id_captcha-count', required: true }
        };

        // Add registration-specific fields
        if (isSignupForm) {
            fieldConfigs['id_first_name'] = { min: 2, max: 50, counterId: 'id_first_name-count', required: true };
            fieldConfigs['id_last_name'] = { min: 2, max: 50, counterId: 'id_last_name-count', required: true };
            fieldConfigs['id_email'] = { max: 70, counterId: 'id_email-count', required: true };
            fieldConfigs['password2'] = { min: 8, max: 64, counterId: 'id_password2-count', required: true };
        }

        // Create form manager (without automatic field setup)
        this.formManager = new FormManager(formId, fieldConfigs);

        // Set up validators first
        this.setupValidators(isSignupForm);

        // Now set up fields with validation
        this.formManager.setupFields();
    }

    /**
     * Set up form validators
     * @param {boolean} isSignupForm - Whether this is a registration form
     */
    setupValidators(isSignupForm) {
        // Create validators and pass fieldConfigs to them
        const usernameValidator = new UsernameValidator(this.formManager, this.formManager.fieldConfigs);
        const passwordValidator = new PasswordValidator(this.formManager, this.formManager.fieldConfigs);
        const captchaValidator = new CaptchaValidator(this.formManager, this.formManager.fieldConfigs);

        // Register validators for all auth forms
        this.formManager.registerValidator('id_username',
            () => usernameValidator.validate('id_username'));
        this.formManager.registerValidator('password1',
            () => passwordValidator.validate('password1'));

        // Set up captcha
        captchaValidator.setupCaptcha('id_captcha_1');
        this.formManager.registerValidator('id_captcha_1',
            () => captchaValidator.validate('id_captcha_1'));

        // Add password toggle for all password fields
        passwordValidator.createToggle('password1');

        // Add password strength indicator
        passwordValidator.createStrengthIndicator('password1');

        // For signup forms, add additional validation
        if (isSignupForm) {
            const emailValidator = new EmailValidator(this.formManager, this.formManager.fieldConfigs);
            const nameValidator = new NameValidator(this.formManager, this.formManager.fieldConfigs);

            // Set up name validation
            this.formManager.registerValidator('id_first_name',
                () => nameValidator.validate('id_first_name'));
            this.formManager.registerValidator('id_last_name',
                () => nameValidator.validate('id_last_name'));

            // Set up confirmation password validation
            this.formManager.registerValidator('password2',
                () => passwordValidator.validateConfirmation('password1', 'password2'));

            // Add toggle for confirmation password
            passwordValidator.createToggle('password2');

            // Set up email validation
            this.formManager.registerValidator('id_email',
                () => emailValidator.validate('id_email'));

        }
    }
}

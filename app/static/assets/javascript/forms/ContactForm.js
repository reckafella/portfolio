import { FormManager } from './manager/FormManager.js';
import { NameValidator } from './validators/NameValidator.js';
import { EmailValidator } from './validators/EmailValidator.js';
import { SubjectValidator } from './validators/SubjectValidator.js';
import { MessageValidator } from './validators/MessageValidator.js';
import { CaptchaValidator } from './validators/CaptchaValidator.js';

/**
 * ContactForm handles the contact form functionality
 * It initializes the form manager and sets up validators for the contact form.
 * This form allows users to submit their contact information, including name, email, subject, and message.
 * It includes features like word counting for the message and captcha validation.
 * @class ContactForm
 */
export class ContactForm {
    /**
     * Initialize contact form
     */
    constructor(formId) {
        const fieldConfigs = {
            'id_name': { min: 2, max: 50, counterId: 'id_name-count' },
            'id_email': { max: 70, counterId: 'id_email-count' },
            'id_subject': { min: 5, max: 150, counterId: 'id_subject-count' },
            'id_message': { min: 20, max: 1000, counterId: 'id_message-count' },
            'id_captcha_1': { length: 6, counterId: 'id_captcha-count' }
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
        // Create validators
        const nameValidator = new NameValidator(this.formManager);
        const emailValidator = new EmailValidator(this.formManager);
        const subjectValidator = new SubjectValidator(this.formManager);
        const messageValidator = new MessageValidator(this.formManager);
        const captchaValidator = new CaptchaValidator(this.formManager);

        // Register validators
        this.formManager.registerValidator('id_name',
            () => nameValidator.validate('id_name'));
        this.formManager.registerValidator('id_email',
            () => emailValidator.validate('id_email'));
        this.formManager.registerValidator('id_subject',
            () => subjectValidator.validate('id_subject'));
        this.formManager.registerValidator('id_message',
            () => messageValidator.validate('id_message'));
        this.formManager.registerValidator('id_captcha_1',
            () => captchaValidator.validate('id_captcha_1'));

        // Set up word counter for message
        messageValidator.setupWordCounter('id_message', 'id_message-word-count');

        // Set up captcha refresh button
        captchaValidator.setupCaptcha('id_captcha_1');
    }
}

// Initialize contact form when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('contact-form')) {
        new ContactForm('contact-form');
    }
});

import { FormManager } from "./manager/FormManager.js";
import { BooleanValidator } from "./validators/SelectValidator.js";

/**
 * SettingsForm handles the update of user settings in profile area
 * It initializes the form manager and sets up validators for the settings form.
 * This form allows users to update their profile information, including email, name, and preferences.
 * @class SettingsForm
 */
export class SettingsForm {
    /**
     * Initialize settings form
     * @param {string} formId - Form ID (e.g., 'settings-form')
     */
    constructor(formId) {
        // Define field configurations for settings form
        const fieldConfigs = {
            'id_security_notifications': { required: true },
            'id_marketing_notifications': { required: false },
            'id_new_products_notifications': { required: false },
            'id_changes_notifications': { required: false }
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
        // Create validators and pass fieldConfigs to them
        const booleanValidator = new BooleanValidator(this.formManager);

        // Register validators for all fields
        this.formManager.registerValidator('id_security_notifications',
            () => booleanValidator.validate('id_security_notifications'));
        this.formManager.registerValidator('id_marketing_notifications',
            () => booleanValidator.validate('id_marketing_notifications'));
        this.formManager.registerValidator('id_new_products_notifications',
            () => booleanValidator.validate('id_new_products_notifications'));
        this.formManager.registerValidator('id_changes_notifications',
            () => booleanValidator.validate('id_changes_notifications'));
    }
}

// Initialize settings form when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('settings-form')) {
        new SettingsForm('settings-form');
    }
});

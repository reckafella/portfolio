import { FormManager } from "./manager/FormManager.js";
import { URLValidator } from "./validators/URLValidator.js";
import { NameValidator } from "./validators/NameValidator.js";
import { MessageValidator } from "./validators/MessageValidator.js";
import { SelectValidator } from "./validators/SelectValidator.js";
import { CountryCitySelector } from "./CountryCitySelector.js";

/**
 * Form for editing user profile information
 * Validates and submits the form data
 * @class EditProfileForm
 */
export class EditProfileForm {
    /**
     * Constructor for EditProfileForm
     * @param {string} formId - The ID of the form to manage
     */
    constructor(formId) {
        this.formId = formId;

        // Field configurations for the profile edit form
        const fieldConfigs = {
            'id_title': {
                min: 5, max: 50, counterId: 'id_title-count', required: true
            },
            'id_country': { min: 2, max: 50, counterId: 'id_country-count', required: true },
            'id_city': { min: 2, max: 50, counterId: 'id_city-count', required: true },
            'id_bio': { min: 2, max: 500, counterId: 'id_bio-count', required: false },
            'id_experience': { min: 2, max: 100, counterId: 'id_experience-count', required: false },
            'id_website': { min: 2, max: 100, counterId: 'id_website-count', required: false },
            'id_twitter_x': { min: 2, max: 100, counterId: 'id_twitter_x-count', required: false },
            'id_facebook': { min: 2, max: 100, counterId: 'id_facebook-count', required: false },
            'id_instagram': { min: 2, max: 100, counterId: 'id_instagram-count', required: false },
            'id_linkedin': { min: 2, max: 100, counterId: 'id_linkedin-count', required: false },
            'id_github': { min: 2, max: 100, counterId: 'id_github-count', required: false },
        };
        // Create form manager instance
        this.formManager = new FormManager(formId, fieldConfigs);

        // Initialize country/city selector
        this.countryCitySelector = new CountryCitySelector(
            'id_country', 
            'id_city', 
            '/api/cities/'
        );

        // Set up validators
        this.setupValidators();

        // Initialize form fields
        this.formManager.setupFields();
    }
    /**
     * Set up validators for the profile edit form
     */
    setupValidators() {
        // Add validators for each field
        const titleValidator = new NameValidator(this.formManager);
        const urlValidator = new URLValidator(this.formManager);
        const messageValidator = new MessageValidator(this.formManager);
        const selectValidator = new SelectValidator(this.formManager);

        this.formManager.registerValidator('id_title', () => titleValidator.validate('id_title'));
        this.formManager.registerValidator('id_country', () => selectValidator.validate('id_country'));
        this.formManager.registerValidator('id_city', () => selectValidator.validate('id_city'));
        this.formManager.registerValidator('id_bio', () => messageValidator.validate('id_bio'));
        this.formManager.registerValidator('id_experience', () => messageValidator.validate('id_experience'));
        this.formManager.registerValidator('id_website', () => urlValidator.validate('id_website'));
        this.formManager.registerValidator('id_twitter_x', () => urlValidator.validate('id_twitter_x'));
        this.formManager.registerValidator('id_facebook', () => urlValidator.validate('id_facebook'));
        this.formManager.registerValidator('id_instagram', () => urlValidator.validate('id_instagram'));
        this.formManager.registerValidator('id_linkedin', () => urlValidator.validate('id_linkedin'));
        this.formManager.registerValidator('id_github', () => urlValidator.validate('id_github'));
    }
}

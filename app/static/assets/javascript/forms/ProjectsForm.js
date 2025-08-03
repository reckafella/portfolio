import { FormManager } from "./manager/FormManager.js";
import { NameValidator } from "./validators/NameValidator.js"; // title, client
import { URLValidator, YouTubeURLValidator } from "./validators/URLValidator.js"; // project URL, YouTube URLs
import { MessageValidator } from "./validators/MessageValidator.js"; //description
import { ImagesValidator } from "./validators/ImagesValidator.js"; // image URLs
import { SelectValidator, BooleanValidator } from "./validators/SelectValidator.js"; // select and boolean fields

/**
 * ProjectsForm class for managing project forms
 * Extends FormManager to provide project-specific validation logic
 * @class ProjectsForm
 * @extends FormManager
 * @param {string} formId - The ID of the project form
 */

export class ProjectsForm {
    /**
     * Initialize project form
     * @param {string} formId - Form ID (e.g., 'project-form')
     */
    constructor(formId) {
        // Define field configurations for project form based on Django form
        const fieldConfigs = {
            // Required text fields
            'id_title': { min: 5, max: 200, counterId: 'id_title-count', required: true },
            'id_description': { min: 25, max: 1500, counterId: 'id_description-count', required: true },
            'id_project_url': { max: 250, counterId: 'id_project_url-count', required: true },

            // Select fields (required)
            'id_project_type': { required: true },
            'id_category': { required: true },

            // Optional text fields
            'id_client': { min: 5, max: 100, counterId: 'id_client-count', required: false },

            // Optional file/media fields
            'id_images': {
                required: false,
                maxFiles: 5,
                maxSize: 5 * 1024 * 1024, // 5MB per file
                maxTotalSize: 25 * 1024 * 1024, // 25MB total
                allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
            },
            'id_youtube_urls': { counterId: 'id_youtube_urls-count', required: false },

            // Boolean field (optional)
            'id_live': { required: false }
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
        const nameValidator = new NameValidator(this.formManager);
        const urlValidator = new URLValidator(this.formManager);
        const youtubeUrlValidator = new YouTubeURLValidator(this.formManager);
        const messageValidator = new MessageValidator(this.formManager);
        const imagesValidator = new ImagesValidator(this.formManager);
        const selectValidator = new SelectValidator(this.formManager);
        const booleanValidator = new BooleanValidator(this.formManager);

        // Register validators - now they can access their own fieldConfigs
        this.formManager.registerValidator('id_title',
            () => nameValidator.validate('id_title'));

        this.formManager.registerValidator('id_description',
            () => messageValidator.validate('id_description'));

        this.formManager.registerValidator('id_project_url',
            () => urlValidator.validate('id_project_url'));

        // Required select fields
        this.formManager.registerValidator('id_project_type',
            () => selectValidator.validate('id_project_type'));

        this.formManager.registerValidator('id_category',
            () => selectValidator.validate('id_category'));

        // Optional fields - validators will check config.required automatically
        this.formManager.registerValidator('id_client',
            () => nameValidator.validate('id_client'));

        this.formManager.registerValidator('id_youtube_urls',
            () => youtubeUrlValidator.validate('id_youtube_urls'));

        this.formManager.registerValidator('id_images',
            () => imagesValidator.validate('id_images'));

        // Boolean field (checkbox)
        this.formManager.registerValidator('id_live',
            () => booleanValidator.validate('id_live'));

        // Set up image preview for file uploads
        imagesValidator.createImagePreview('id_images');
    }
}

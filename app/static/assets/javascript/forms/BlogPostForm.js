import { NameValidator } from "./validators/NameValidator.js";
import { MessageValidator } from "./validators/MessageValidator.js";
import { FormManager } from "./manager/FormManager.js";
import { BooleanValidator } from "./validators/SelectValidator.js";
import { ImagesValidator } from "./validators/ImagesValidator.js";

/**
 * BlogPostForm handles the blog post creation/updates and validation
 * @class BlogPostForm
 * @extends FormManager
 * * @param {string} formId - The ID of the form element
 */
export class BlogPostForm {
    /**
     * Initialize blog post form
     * @param {string} formId - Form ID (e.g., 'blog-post-form')
     */
    constructor(formId) {
        // Define field configurations for blog post form based on Django form
        const fieldConfigs = {
            'id_title': { min: 5, max: 200, counterId: 'id_title-count', required: true },
            'id_content': { min: 25, max: 50000, counterId: 'id_content-count', required: true },
            'id_tags': { min: 3, max: 100, counterId: 'id_tags-count', required: false },
            'id_cover_image': {
                required: false,
                maxFiles: 1,
                maxSize: 5 * 1024 * 1024, // 5MB per file
                allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
            },
            'id_publish': { required: false }
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
        const messageValidator = new MessageValidator(this.formManager);
        const imagesValidator = new ImagesValidator(this.formManager);
        const booleanValidator = new BooleanValidator(this.formManager);

        // Register validators for all blog post fields
        this.formManager.registerValidator('id_title', () => nameValidator.validate('id_title'));
        this.formManager.registerValidator('id_content', () => messageValidator.validate('id_content'));
        this.formManager.registerValidator('id_tags', () => nameValidator.validate('id_tags', 'Tags', false));
        this.formManager.registerValidator('id_cover_image', () => imagesValidator.validate('id_cover_image'));
        this.formManager.registerValidator('id_publish', () => booleanValidator.validate('id_publish'));
    }
}

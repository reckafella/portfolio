from forms.schema.form_schema import FormField, FormSchema


async def return_project_form_schema():
    """Get project submission form schema"""
    return FormSchema(
        form_id="project_form",
        title="Submit a Project",
        description="Share your project details for potential collaboration or showcase.",
        submit_url="/api/projects",
        fields=[
            FormField(
                name="title",
                type="text",
                label="Project Title",
                placeholder="Enter project title",
                required=True,
                validation={"min_length": 3, "max_length": 100}
            ),
            FormField(
                name="description",
                type="textarea",
                label="Description",
                placeholder="Describe your project...",
                required=True,
                validation={"min_length": 20, "max_length": 500}
            ),
            FormField(
                name="technologies",
                type="text",
                label="Technologies Used",
                placeholder="e.g., Python, React, Node.js (comma-separated)",
                required=True,
                help_text="Enter technologies separated by commas"
            ),
            FormField(
                name="project_type",
                type="select",
                label="Project Type",
                required=True,
                options=[
                    {"value": "web_app", "label": "Web Application"},
                    {"value": "mobile_app", "label": "Mobile Application"},
                    {"value": "desktop_app", "label": "Desktop Application"},
                    {"value": "api", "label": "API/Backend Service"},
                    {"value": "library", "label": "Library/Package"},
                    {"value": "other", "label": "Other"}
                ]
            ),
            FormField(
                name="github_url",
                type="url",
                label="GitHub URL",
                placeholder="https://github.com/username/project",
                required=False,
                validation={"pattern": r"^https://github\.com/.+"}
            ),
            FormField(
                name="live_url",
                type="url",
                label="Live Demo URL",
                placeholder="https://your-project.com",
                required=False
            )
        ]
    )

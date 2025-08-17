from fastapi import HTTPException
from pydantic import BaseModel, EmailStr

from forms.schema.form_schema import FormField, FormSchema


# Pydantic models for request validation
class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


async def return_contact_form_schema():
    """Get contact form schema/configuration"""
    return FormSchema(
        form_id="contact_form",
        title="Contact Me",
        description="Send me a message and I'll get back to you as soon as possible.",
        submit_url="/api/contact",
        fields=[
            FormField(
                name="name",
                type="text",
                label="Full Name",
                placeholder="Enter your full name",
                required=True,
                validation={"min_length": 2, "max_length": 100}
            ),
            FormField(
                name="email",
                type="email",
                label="Email Address",
                placeholder="your.email@example.com",
                required=True,
                validation={"pattern": r"^[^\s@]+@[^\s@]+\.[^\s@]+$"}
            ),
            FormField(
                name="subject",
                type="select",
                label="Subject",
                required=True,
                options=[
                    {"value": "general", "label": "General Inquiry"},
                    {"value": "collaboration", "label": "Collaboration"},
                    {"value": "job_opportunity", "label": "Job Opportunity"},
                    {"value": "feedback", "label": "Feedback"},
                    {"value": "other", "label": "Other"}
                ]
            ),
            FormField(
                name="message",
                type="textarea",
                label="Message",
                placeholder="Tell me about your project, idea, or question...",
                required=True,
                validation={"min_length": 10, "max_length": 1000},
                help_text="Please provide as much detail as possible (10-1000 characters)"
            )
        ]
    )


async def return_contact_form(contact_data: ContactRequest):
    """Handle contact form submission"""
    try:
        # Here you would typically save to database or send email
        # For now, just return success response
        return {
            "status": "success",
            "message": f"Hi {contact_data.name}, your message has been sent successfully!",
            "data": {
                "name": contact_data.name,
                "email": contact_data.email,
                "subject": contact_data.subject
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to process contact form" + str(e))

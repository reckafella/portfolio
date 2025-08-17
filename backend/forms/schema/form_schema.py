from pydantic import BaseModel
from typing import List, Dict, Any, Optional


# Form field configuration models
class FormField(BaseModel):
    name: str
    type: str  # text, email, textarea, select, etc.
    label: str
    placeholder: Optional[str] = None
    required: bool = True
    options: Optional[List[Dict[str, Any]]] = None  # For select fields
    validation: Optional[Dict[str, Any]] = None
    help_text: Optional[str] = None


class FormSchema(BaseModel):
    form_id: str
    title: str
    description: Optional[str] = None
    fields: List[FormField]
    submit_url: str
    method: str = "POST"

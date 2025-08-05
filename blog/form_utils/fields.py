"""
Custom form fields for handling Wagtail rich text content
"""
import json
from django import forms
from wagtail.admin.rich_text import DraftailRichTextArea
from wagtail.rich_text import RichText
# from wagtail.rich_text.pages import PageLinkHandler


class DraftailFormField(forms.CharField):
    """
    Custom form field for handling Draftail rich text editor
    """
    def __init__(self, *args, **kwargs):
        # Set the widget to DraftailRichTextArea if not specified
        if 'widget' not in kwargs:
            kwargs['widget'] = DraftailRichTextArea(
                options={
                    'features': [
                        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                        'bold', 'italic',
                        'ol', 'ul',
                        'link',
                        'blockquote',
                        'hr',
                        'code',
                    ]
                }
            )
        super().__init__(*args, **kwargs)

    def prepare_value(self, value):
        """
        Convert RichText object to Draftail format for editing
        """
        if isinstance(value, RichText):
            # Convert RichText to HTML first, then to Draftail format
            html_content = str(value)
            return html_content
        elif value:
            return str(value)
        return value

    def to_python(self, value):
        """
        Convert Draftail JSON to HTML
        """
        if value in self.empty_values:
            return ""

        # If it's already a string (HTML), return as is
        if isinstance(value, str):
            try:
                # Try to parse as JSON (Draftail format)
                data = json.loads(value)
                if 'blocks' in data:
                    # Convert Draftail JSON to HTML
                    return self.draftail_to_html(data)
                else:
                    # It's already HTML
                    return value
            except (json.JSONDecodeError, TypeError):
                # Not JSON, assume it's HTML
                return value

        return str(value)

    def draftail_to_html(self, draftail_data):
        """
        Convert Draftail JSON format to HTML
        """
        if not draftail_data or 'blocks' not in draftail_data:
            return ''

        html_parts = []
        blocks = draftail_data.get('blocks', [])
        entity_map = draftail_data.get('entityMap', {})

        for block in blocks:
            block_type = block.get('type', 'unstyled')
            text = block.get('text', '')

            # Apply inline styles
            styled_text = self.apply_inline_styles(
                text, block.get('inlineStyleRanges', []))

            # Apply entity ranges (links, etc.)
            styled_text = self.apply_entity_ranges(
                styled_text, block.get('entityRanges', []), entity_map)

            # Wrap in appropriate block element
            if block_type == 'unstyled':
                if text.strip():
                    html_parts.append(f'<p>{styled_text}</p>')
            elif block_type == 'header-one':
                html_parts.append(f'<h1>{styled_text}</h1>')
            elif block_type == 'header-two':
                html_parts.append(f'<h2>{styled_text}</h2>')
            elif block_type == 'header-three':
                html_parts.append(f'<h3>{styled_text}</h3>')
            elif block_type == 'header-four':
                html_parts.append(f'<h4>{styled_text}</h4>')
            elif block_type == 'header-five':
                html_parts.append(f'<h5>{styled_text}</h5>')
            elif block_type == 'header-six':
                html_parts.append(f'<h6>{styled_text}</h6>')
            elif block_type == 'blockquote':
                html_parts.append(
                    f'<blockquote><p>{styled_text}</p></blockquote>')
            elif block_type == 'code-block':
                html_parts.append(f'<pre><code>{styled_text}</code></pre>')
            elif block_type in ['ordered-list-item', 'unordered-list-item']:
                # Handle lists
                tag = 'li'
                html_parts.append(f'<{tag}>{styled_text}</{tag}>')
            else:
                # Default to paragraph
                if text.strip():
                    html_parts.append(f'<p>{styled_text}</p>')

        return '\n'.join(html_parts)

    def apply_inline_styles(self, text, style_ranges):
        """
        Apply inline styles like bold, italic to text
        """
        if not style_ranges:
            return text

        # Sort ranges by offset (reverse order to maintain positions)
        style_ranges = sorted(style_ranges, key=lambda x: x['offset'],
                              reverse=True)

        result = text
        for style_range in style_ranges:
            offset = style_range['offset']
            length = style_range['length']
            style = style_range['style']

            before = result[:offset]
            styled_text = result[offset:offset + length]
            after = result[offset + length:]

            if style == 'BOLD':
                styled_text = f'<strong>{styled_text}</strong>'
            elif style == 'ITALIC':
                styled_text = f'<em>{styled_text}</em>'
            elif style == 'CODE':
                styled_text = f'<code>{styled_text}</code>'

            result = before + styled_text + after

        return result

    def apply_entity_ranges(self, text, entity_ranges, entity_map):
        """
        Apply entity ranges like links to text
        """
        if not entity_ranges or not entity_map:
            return text

        # Sort ranges by offset (reverse order to maintain positions)
        entity_ranges = sorted(entity_ranges, key=lambda x: x['offset'],
                               reverse=True)

        result = text
        for entity_range in entity_ranges:
            offset = entity_range['offset']
            length = entity_range['length']
            key = str(entity_range['key'])

            if key in entity_map:
                entity = entity_map[key]
                entity_type = entity.get('type')
                data = entity.get('data', {})

                before = result[:offset]
                entity_text = result[offset:offset + length]
                after = result[offset + length:]

                if entity_type == 'LINK':
                    url = data.get('url', '#')
                    entity_text = f'<a href="{url}">{entity_text}</a>'

                result = before + entity_text + after

        return result

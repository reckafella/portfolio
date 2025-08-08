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
            text = block.get('text', '')

            # Apply inline styles
            styled_text = self.apply_inline_styles(
                text, block.get('inlineStyleRanges', []))

            # Apply entity ranges (links, etc.)
            styled_text = self.apply_entity_ranges(
                styled_text, block.get('entityRanges', []), entity_map)

            # Convert block to HTML
            html_block = self._convert_block_to_html(block, styled_text)
            if html_block:
                html_parts.append(html_block)

        return '\n'.join(html_parts)

    def _convert_block_to_html(self, block, styled_text):
        """
        Convert a single block to HTML based on its type
        """
        block_type = block.get('type', 'unstyled')
        text = block.get('text', '')

        # Get HTML template for block type
        html_template = self._get_block_html_template(block_type)

        if html_template:
            return html_template.format(content=styled_text)
        elif text.strip():
            return f'<p>{styled_text}</p>'
        else:
            return None

    def _get_block_html_template(self, block_type):
        """
        Get HTML template for a given block type
        """
        block_templates = {
            'unstyled': '<p>{content}</p>',
            'header-one': '<h1>{content}</h1>',
            'header-two': '<h2>{content}</h2>',
            'header-three': '<h3>{content}</h3>',
            'header-four': '<h4>{content}</h4>',
            'header-five': '<h5>{content}</h5>',
            'header-six': '<h6>{content}</h6>',
            'blockquote': '<blockquote><p>{content}</p></blockquote>',
            'code-block': '<pre><code>{content}</code></pre>',
            'ordered-list-item': '<li>{content}</li>',
            'unordered-list-item': '<li>{content}</li>',
        }
        return block_templates.get(block_type)

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

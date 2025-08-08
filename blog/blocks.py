"""
Custom Wagtail StreamField blocks for rich blog content with inline images
"""
from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock
from wagtail.embeds.blocks import EmbedBlock


class RichTextBlock(blocks.RichTextBlock):
    """Enhanced rich text block with all formatting options"""

    class Meta:
        icon = "pilcrow"
        label = "Rich Text"
        help_text = "Add formatted text content"


class ImageBlock(blocks.StructBlock):
    """Custom image block with caption and alignment options"""

    image = ImageChooserBlock(required=True)
    caption = blocks.CharBlock(required=False, max_length=255,
                               help_text="Optional image caption")
    alignment = blocks.ChoiceBlock(
        choices=[
            ('left', 'Align Left'),
            ('center', 'Center'),
            ('right', 'Align Right'),
            ('full', 'Full Width'),
        ],
        default='center',
        help_text="How to align the image"
    )
    size = blocks.ChoiceBlock(
        choices=[
            ('small', 'Small (300px)'),
            ('medium', 'Medium (500px)'),
            ('large', 'Large (700px)'),
            ('full', 'Full Width'),
        ],
        default='medium',
        help_text="Image display size"
    )

    class Meta:
        icon = "image"
        label = "Image"
        help_text = "Add an image with caption and alignment options"


class QuoteBlock(blocks.StructBlock):
    """Quote block for highlighting important text"""

    quote = blocks.TextBlock(required=True, help_text="The quote text")
    attribution = blocks.CharBlock(required=False, max_length=100,
                                   help_text="Quote author or source")

    class Meta:
        icon = "openquote"
        label = "Quote"
        help_text = "Add a highlighted quote or testimonial"


class CodeBlock(blocks.StructBlock):
    """Code block with syntax highlighting"""

    language = blocks.ChoiceBlock(
        choices=[
            ('python', 'Python'),
            ('javascript', 'JavaScript'),
            ('html', 'HTML'),
            ('css', 'CSS'),
            ('bash', 'Bash/Shell'),
            ('sql', 'SQL'),
            ('json', 'JSON'),
            ('yaml', 'YAML'),
            ('markdown', 'Markdown'),
            ('text', 'Plain Text'),
        ],
        default='python',
        help_text="Programming language for syntax highlighting"
    )
    code = blocks.TextBlock(required=True, help_text="Your code")
    caption = blocks.CharBlock(required=False, max_length=255,
                               help_text="Optional code description")

    class Meta:
        icon = "code"
        label = "Code Block"
        help_text = "Add syntax-highlighted code"


class HeadingBlock(blocks.StructBlock):
    """Custom heading block with different levels"""

    heading_text = blocks.CharBlock(required=True, max_length=255)
    size = blocks.ChoiceBlock(
        choices=[
            ('h2', 'H2 - Large'),
            ('h3', 'H3 - Medium'),
            ('h4', 'H4 - Small'),
            ('h5', 'H5 - Extra Small'),
        ],
        default='h3'
    )

    class Meta:
        icon = "title"
        label = "Heading"
        help_text = "Add a section heading"


class CalloutBlock(blocks.StructBlock):
    """Callout/alert block for important information"""

    type = blocks.ChoiceBlock(
        choices=[
            ('info', 'Info (Blue)'),
            ('success', 'Success (Green)'),
            ('warning', 'Warning (Yellow)'),
            ('danger', 'Danger (Red)'),
        ],
        default='info'
    )
    title = blocks.CharBlock(required=False, max_length=100,
                             help_text="Optional callout title")
    content = blocks.RichTextBlock(required=True,
                                   help_text="Callout content")

    class Meta:
        icon = "help"
        label = "Callout"
        help_text = "Add an information callout box"


class BlogStreamBlock(blocks.StreamBlock):
    """Main stream block for blog content"""

    rich_text = RichTextBlock()
    image = ImageBlock()
    heading = HeadingBlock()
    quote = QuoteBlock()
    code = CodeBlock()
    callout = CalloutBlock()
    embed = EmbedBlock(help_text="Embed videos, tweets, etc.")

    class Meta:
        icon = "doc-full"
        help_text = "Add various types of content blocks"

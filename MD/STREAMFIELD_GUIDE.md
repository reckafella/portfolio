# StreamField Blog Content Guide

## Overview
Your blog now supports rich content with inline images! You can create engaging posts with:

- **Rich Text**: Formatted text with links, bold, italic, etc.
- **Inline Images**: Images positioned exactly where you want them in your content
- **Headings**: Different heading levels (H2-H5)
- **Quotes**: Highlighted blockquotes with optional attribution
- **Code Blocks**: Syntax-highlighted code in various languages
- **Callouts**: Info boxes for important information
- **Embeds**: Videos, tweets, and other embedded content

## Creating New Posts

### 1. In Wagtail Admin
- Go to your blog post creation page
- Use the **"New Content (StreamField)"** section
- Click **"Add"** to add different content blocks

### 2. Adding Inline Images
1. Click **"Add"** → **"Image"**
2. Choose your image from the library (or upload new)
3. Add an optional caption
4. Choose alignment:
   - **Left**: Image floats left, text wraps around
   - **Center**: Image centered with text above/below
   - **Right**: Image floats right, text wraps around
   - **Full Width**: Image spans full width
5. Choose size: Small (300px), Medium (500px), Large (700px), or Full Width

### 3. Content Block Types

#### Rich Text
- Standard formatted text
- Use for paragraphs, lists, links
- Can include basic formatting

#### Images
- Upload from your device or choose from library
- Automatic Cloudinary optimization
- Responsive design
- Caption support
- Multiple alignment options

#### Headings
- H2 through H5 heading levels
- Use for section breaks
- SEO-friendly structure

#### Quotes
- Highlight important quotes or testimonials
- Optional attribution field
- Visually distinct styling

#### Code Blocks
- Syntax highlighting for multiple languages
- Optional code description/caption
- Perfect for technical content

#### Callouts
- Info, Success, Warning, Danger styles
- Great for highlighting important information
- Optional title and rich content

#### Embeds
- YouTube videos, tweets, etc.
- Just paste the URL
- Automatically responsive

## Migrating Existing Posts

### Option 1: Automatic Migration
Run this command to migrate all existing posts:
```bash
python manage.py migrate_content_to_streamfield
```

### Option 2: Manual Migration
1. Open an existing post in Wagtail admin
2. Copy content from "Current Content" field
3. Add a "Rich Text" block in "New Content" section
4. Paste the content
5. Add images and other blocks as needed
6. Save the post

## Best Practices

### Image Placement
- Use **left/right alignment** for images that complement text
- Use **center alignment** for standalone images
- Use **full width** for hero images or detailed screenshots
- Add descriptive captions for accessibility

### Content Structure
1. Start with a rich text block for your introduction
2. Add images where they enhance understanding
3. Use headings to break up long content
4. Add callouts for important tips or warnings
5. Use code blocks for technical examples

### SEO Considerations
- Use headings (H2-H5) for proper document structure
- Add alt text to images via the caption field
- Break up long text with images and headings
- Use descriptive image filenames

## Example Post Structure
```
1. Rich Text: Introduction paragraph
2. Image: Center-aligned hero image
3. Heading: "Getting Started" (H2)
4. Rich Text: Explanation paragraph
5. Image: Right-aligned screenshot
6. Rich Text: Continued explanation
7. Code Block: Example code
8. Callout: Important tip
9. Rich Text: Conclusion
```

## Legacy Support
- Old posts will continue to work
- Gallery images still appear for backward compatibility
- Legacy content is preserved in read-only field
- Gradual migration recommended

## Troubleshooting

### Images Not Showing
- Check that the image was uploaded successfully
- Verify Cloudinary integration is working
- Ensure proper file permissions

### Migration Issues
- Use `--dry-run` flag first to preview changes
- Migrate one post at a time if bulk migration fails
- Check server logs for detailed error messages

### Performance
- Images are automatically optimized via Cloudinary
- StreamField provides efficient database storage
- Use appropriate image sizes for faster loading

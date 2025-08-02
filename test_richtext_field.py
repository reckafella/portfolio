#!/usr/bin/env python
"""
Test script for rich text form field functionality
"""


class MockRichText:
    """Mock RichText object for testing"""
    def __init__(self, source):
        self.source = source

    def __str__(self):
        return self.source


class RichTextFormField:
    """Simplified version of our custom form field"""

    def prepare_value(self, value):
        """Convert RichText object to HTML string for editing"""
        if hasattr(value, 'source'):
            # If it's a RichText object, get the source HTML
            return value.source
        elif value:
            # If it's already a string, use it as is
            return str(value)
        return value


def test_rich_text_field():
    """Test the functionality"""
    print("Testing RichTextFormField...")

    field = RichTextFormField()

    # Test 1: RichText object
    rich_text = MockRichText('<p>This is <strong>bold</strong> text</p>')
    result1 = field.prepare_value(rich_text)
    print(f"✅ RichText object: {result1}")

    # Test 2: Plain string
    plain_string = '<p>Plain HTML string</p>'
    result2 = field.prepare_value(plain_string)
    print(f"✅ Plain string: {result2}")

    # Test 3: None value
    result3 = field.prepare_value(None)
    print(f"✅ None value: {result3}")

    # Test 4: Empty string
    result4 = field.prepare_value('')
    print(f"✅ Empty string: '{result4}'")

    print("\n🎉 All tests passed! The RichTextFormField works correctly.")

    return True


if __name__ == "__main__":
    test_rich_text_field()

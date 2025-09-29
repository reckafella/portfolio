import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import './RichTextEditor.css';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';

interface RichTextEditorProps {
  content: string;
  onChange: (_content: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing your content...',
  className = '',
  error = false
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'img-fluid rounded',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary text-decoration-none',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none ${error ? 'border-danger' : ''}`,
      },
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [editor, content]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Toolbar */}
      <div className="editor-toolbar border border-bottom-0 rounded-top p-2">
        <div className="d-flex flex-wrap gap-1">
          {/* Text Formatting */}
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${editor.isActive('bold') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
            >
              <i className="bi bi-type-bold"></i>
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${editor.isActive('italic') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
            >
              <i className="bi bi-type-italic"></i>
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${editor.isActive('underline') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline"
            >
              <i className="bi bi-type-underline"></i>
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${editor.isActive('strike') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
            >
              <i className="bi bi-type-strikethrough"></i>
            </button>
          </div>

          {/* Headings */}
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              title="Heading 3"
            >
              H3
            </button>
          </div>

          {/* Lists */}
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${editor.isActive('bulletList') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet List"
            >
              <i className="bi bi-list-ul"></i>
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${editor.isActive('orderedList') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
            >
              <i className="bi bi-list-ol"></i>
            </button>
          </div>

          {/* Text Alignment */}
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              title="Align Left"
            >
              <i className="bi bi-text-left"></i>
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              title="Align Center"
            >
              <i className="bi bi-text-center"></i>
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              title="Align Right"
            >
              <i className="bi bi-text-right"></i>
            </button>
          </div>

          {/* Code */}
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${editor.isActive('code') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleCode().run()}
              title="Inline Code"
            >
              <i className="bi bi-code"></i>
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-outline-secondary ${editor.isActive('codeBlock') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Code Block"
            >
              <i className="bi bi-code-square"></i>
            </button>
          </div>

          {/* Blockquote */}
          <button
            type="button"
            className={`btn btn-sm btn-outline-secondary ${editor.isActive('blockquote') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
          >
            <i className="bi bi-quote"></i>
          </button>

          {/* Horizontal Rule */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <i className="bi bi-hr"></i>
          </button>

          {/* Link */}
          <button
            type="button"
            className={`btn btn-sm btn-outline-secondary ${editor.isActive('link') ? 'active' : ''}`}
            onClick={setLink}
            title="Add Link"
          >
            <i className="bi bi-link-45deg"></i>
          </button>

          {/* Image */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={addImage}
            title="Add Image"
          >
            <i className="bi bi-image"></i>
          </button>

          {/* Highlight */}
          <button
            type="button"
            className={`btn btn-sm btn-outline-secondary ${editor.isActive('highlight') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            title="Highlight"
          >
            <i className="bi bi-highlighter"></i>
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className={`editor-content border rounded-bottom ${error ? 'border-danger' : ''}`} style={{ minHeight: '300px' }}>
        <EditorContent editor={editor} />
      </div>

      {/* Character Count */}
      <div className="editor-footer mt-2 d-flex justify-content-between align-items-center text-muted small">
        <span>
          {editor.storage.characterCount?.characters() || 0} characters
        </span>
        <span>
          {editor.storage.characterCount?.words() || 0} words
        </span>
      </div>
    </div>
  );
};

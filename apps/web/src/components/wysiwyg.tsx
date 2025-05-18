'use client'

import { useEffect, useCallback } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import DOMPurify from 'dompurify'
import { Button } from '@web/components/ui/button'
import { Bold as BoldIcon, Italic as ItalicIcon, List, ListOrdered, Heading as HeadingIcon } from 'lucide-react'

interface WysiwygProps {
  content: string
  onChange: (content: string) => void
}

export default function Wysiwyg({ content, onChange }: WysiwygProps) {
  console.warn('Wysiwyg component mounted', { content })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable default heading to use custom
        bulletList: false, // Disable default bullet list
        orderedList: false, // Disable default ordered list
      }),
      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: 'font-bold',
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc pl-4',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal pl-4',
        },
      }),
      ListItem,
    ],
    content: content || '<p></p>',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[200px] p-4 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const sanitizedHtml = DOMPurify.sanitize(html)
      console.warn('Editor updated', { html, sanitizedHtml })
      onChange(sanitizedHtml)
    },
    onCreate: ({ editor }) => {
      console.warn('Editor created, extensions:', editor.extensionManager.extensions.map(ext => ext.name))
    },
    immediatelyRender: false, // Prevent SSR issues
  })

  useEffect(() => {
    if (editor) {
      console.warn('Editor initialized, state:', editor.state)
    } else {
      console.warn('Editor failed to initialize')
    }
    return () => {
      editor?.destroy()
    }
  }, [editor])

  const toggleBold = useCallback(() => {
    if (!editor) {
      console.warn('Bold button clicked, but editor is null')
      return
    }
    console.warn('Toggling bold', { canToggle: editor.can().toggleBold(), state: editor.state })
    editor.chain().focus().toggleBold().run()
  }, [editor])

  const toggleItalic = useCallback(() => {
    if (!editor) {
      console.warn('Italic button clicked, but editor is null')
      return
    }
    console.warn('Toggling italic', { canToggle: editor.can().toggleItalic(), state: editor.state })
    editor.chain().focus().toggleItalic().run()
  }, [editor])

  const toggleBulletList = useCallback(() => {
    if (!editor) {
      console.warn('Bullet list button clicked, but editor is null')
      return
    }
    console.warn('Toggling bullet list', { canToggle: editor.can().toggleBulletList(), state: editor.state })
    editor.chain().focus().setParagraph().toggleBulletList().run()
  }, [editor])

  const toggleOrderedList = useCallback(() => {
    if (!editor) {
      console.warn('Ordered list button clicked, but editor is null')
      return
    }
    console.warn('Toggling ordered list', { canToggle: editor.can().toggleOrderedList(), state: editor.state })
    editor.chain().focus().setParagraph().toggleOrderedList().run()
  }, [editor])

  const setHeading = useCallback((level: 1 | 2 | 3) => {
    if (!editor) {
      console.warn(`Heading ${level} button clicked, but editor is null`)
      return
    }
    console.warn(`Setting heading ${level}`, { canSet: editor.can().setHeading({ level }), state: editor.state })
    editor.chain().focus().setParagraph().setHeading({ level }).run()
  }, [editor])

  if (!editor) {
    console.warn('Rendering null: editor not initialized')
    return <div className="text-red-500">Editor failed to load</div>
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1 flex-wrap">
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'secondary' : 'outline'}
          size="sm"
          onClick={toggleBold}
          aria-label="Toggle bold"
        >
          <BoldIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'secondary' : 'outline'}
          size="sm"
          onClick={toggleItalic}
          aria-label="Toggle italic"
        >
          <ItalicIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setHeading(1)}
          aria-label="Toggle heading 1"
        >
          <HeadingIcon className="h-4 w-4" /> 1
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setHeading(2)}
          aria-label="Toggle heading 2"
        >
          <HeadingIcon className="h-4 w-4" /> 2
        </Button>
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'secondary' : 'outline'}
          size="sm"
          onClick={toggleBulletList}
          aria-label="Toggle bullet list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'secondary' : 'outline'}
          size="sm"
          onClick={toggleOrderedList}
          aria-label="Toggle ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
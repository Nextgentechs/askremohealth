'use client'

import { useEffect, useCallback, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import FontFamily from '@tiptap/extension-font-family'
import TextStyle from '@tiptap/extension-text-style'
import Link from '@tiptap/extension-link'
import DOMPurify from 'dompurify'
import { Button } from '@web/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@web/components/ui/select'
import { Bold as BoldIcon, Italic as ItalicIcon, List, ListOrdered, Link as LinkIcon } from 'lucide-react'
import type { Command, CommandProps, RawCommands } from '@tiptap/core'

interface WysiwygProps {
  content: string
  onChange: (content: string) => void
}

// Custom FontSize extension
const FontSize = TextStyle.extend({
  name: 'fontSize',
  addAttributes() {
    return {
      fontSize: {
        default: '16px',
        parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, '') || '16px',
        renderHTML: (attributes) => {
          if (!attributes.fontSize) return {}
          return { style: `font-size: ${attributes.fontSize}` }
        },
      },
    }
  },
  addCommands(): Partial<RawCommands> {
    return {
      setFontSize:
        (fontSize: string): Command =>
        ({ commands, state, dispatch }: CommandProps): boolean => {
          console.log('Executing setFontSize', { fontSize, selection: state.selection })
          if (dispatch) {
            // Clear existing textStyle marks to avoid conflicts
            commands.unsetMark('textStyle')
            const result = commands.setMark('textStyle', { fontSize })
            console.log('setFontSize result', { result, activeMarks: state.selection.$head.marks() })
            return result
          }
          return false
        },
      unsetFontSize:
        (): Command =>
        ({ commands }: CommandProps): boolean => {
          console.log('Executing unsetFontSize')
          return commands.resetAttributes('textStyle', 'fontSize')
        },
    }
  },
})

export default function Wysiwyg({ content, onChange }: WysiwygProps) {
  console.log('Wysiwyg component mounted', { content })

  // State to track current font size and link active state
  const [currentFontSize, setCurrentFontSize] = useState<string>('16px')
  const [currentLinkActive, setCurrentLinkActive] = useState<boolean>(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      BulletList.configure({
        HTMLAttributes: { class: 'list-disc pl-4' },
      }),
      OrderedList.configure({
        HTMLAttributes: { class: 'list-decimal pl-4' },
      }),
      ListItem,
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      FontSize,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: 'text-blue-600 underline hover:text-blue-800' },
      }),
    ],
    content: content || '<p></p>',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[200px] p-4 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring',
      },
    },
    onUpdate: ({ editor }) => {
      let html = editor.getHTML()
      html = html.replace(/<p>\s*<\/p>/g, '')
      const sanitizedHtml = DOMPurify.sanitize(html, {
        ADD_TAGS: ['span'],
        ADD_ATTR: ['style', 'href', 'target'],
      })
      console.log('Editor updated', { html, sanitizedHtml })
      onChange(sanitizedHtml)
    },
    onCreate: ({ editor }) => {
      console.log('Editor created, extensions:', editor.extensionManager.extensions.map((ext) => ext.name))
      // Apply initial font size to cursor
      editor.chain().focus().setMark('textStyle', { fontSize: currentFontSize }).run()
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor) {
      console.log('Editor initialized, state:', editor.state)
      // Apply font size and link state on cursor movement or state change
      editor.on('selectionUpdate', ({ editor }) => {
        console.log('Selection updated', { currentFontSize, currentLinkActive })
        // Apply font size
        editor.commands.unsetMark('textStyle')
        editor.commands.setMark('textStyle', { fontSize: currentFontSize })
        // Apply or remove link mark based on currentLinkActive
        if (currentLinkActive) {
          // Keep link mark active if state is true
          if (!editor.isActive('link')) {
            console.log('Applying link mark for future text')
            // Use a dummy href; will be updated when setting a real link
            editor.commands.setMark('link', { href: 'https://placeholder.com', target: '_blank' })
          }
        } else {
          // Remove link mark for future text
          if (editor.isActive('link')) {
            console.log('Removing link mark for future text')
            editor.commands.unsetMark('link')
          }
        }
      })
    } else {
      console.warn('Editor failed to initialize')
    }
    return () => {
      editor?.destroy()
    }
  }, [editor, currentFontSize, currentLinkActive])

  const toggleBold = useCallback(() => {
    if (!editor) {
      console.warn('Bold button clicked, but editor is null')
      return
    }
    console.log('Toggling bold', { canToggle: editor.can().toggleBold(), state: editor.state })
    editor.chain().focus().toggleBold().run()
  }, [editor])

  const toggleItalic = useCallback(() => {
    if (!editor) {
      console.warn('Italic button clicked, but editor is null')
      return
    }
    console.log('Toggling italic', { canToggle: editor.can().toggleItalic(), state: editor.state })
    editor.chain().focus().toggleItalic().run()
  }, [editor])

  const toggleBulletList = useCallback(() => {
    if (!editor) {
      console.warn('Bullet list button clicked, but editor is null')
      return
    }
    const isActive = editor.isActive('bulletList')
    console.log('Toggling bullet list', { isActive, canToggle: editor.can().toggleBulletList(), state: editor.state })
    if (isActive) {
      editor.chain().focus().toggleBulletList().liftListItem('listItem').run()
    } else {
      editor.chain().focus().toggleBulletList().run()
    }
  }, [editor])

  const toggleOrderedList = useCallback(() => {
    if (!editor) {
      console.warn('Ordered list button clicked, but editor is null')
      return
    }
    const isActive = editor.isActive('orderedList')
    console.log('Toggling ordered list', { isActive, canToggle: editor.can().toggleOrderedList(), state: editor.state })
    if (isActive) {
      editor.chain().focus().toggleOrderedList().liftListItem('listItem').run()
    } else {
      editor.chain().focus().toggleOrderedList().run()
    }
  }, [editor])

  const setLink = useCallback(() => {
    if (!editor) {
      console.warn('Link button clicked, but editor is null')
      return
    }
    const { from, to } = editor.state.selection
    const hasSelection = from !== to
    const isActive = editor.isActive('link')
    console.log('Link button clicked', { hasSelection, isActive, currentLinkActive, selection: { from, to } })

    // Toggle link active state for future typing
    if (isActive || currentLinkActive) {
      console.log('Deactivating link for future text', { currentLinkActive })
      setCurrentLinkActive(false)
      editor.chain().focus().unsetMark('link').run()
      return
    }

    // Require selection for setting a new link
    if (!hasSelection) {
      console.warn('No text selected for link')
      alert('Please select text to apply a link.')
      return
    }

    // Prompt for URL to set a new link
    const url = window.prompt('Enter the URL (e.g., https://example.com)')
    if (!url) {
      console.warn('No URL provided for link')
      return
    }
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/
    const isValidUrl = urlRegex.exec(url)
    if (!isValidUrl) {
      console.warn('Invalid URL provided', { url })
      alert('Please enter a valid URL starting with http:// or https://')
      return
    }
    console.log('Setting link', { url, currentLinkActive: true, state: editor.state })
    editor.chain().focus().setLink({ href: url, target: '_blank' }).run()
    setCurrentLinkActive(true)
  }, [editor, currentLinkActive])

  const setFontFamily = useCallback(
    (font: string) => {
      if (!editor) {
        console.warn('Font family select changed, but editor is null')
        return
      }
      console.log('Setting font family', { font, state: editor.state })
      editor.chain().focus().setFontFamily(font).run()
    },
    [editor]
  )

  const setFontSize = useCallback(
    (size: string) => {
      if (!editor) {
        console.warn('Font size select changed, but editor is null')
        return
      }
      console.log('Setting font size', { size, state: editor.state })
      setCurrentFontSize(size)
      // Apply font size to cursor or selection
      editor.chain().focus().unsetMark('textStyle').setMark('textStyle', { fontSize: size }).run()
      console.log('After setFontSize, active marks:', editor.state.selection.$head.marks())
    },
    [editor]
  )

  if (!editor) {
    console.warn('Rendering null: editor not initialized')
    return <div className="text-red-500">Editor failed to load</div>
  }

  return (
    <div className="space-y-2">
      <style jsx>{`
        .tiptap span[style*="font-size"] {
          font-size: inherit !important;
        }
        .tiptap p, .tiptap li {
          font-size: inherit;
        }
      `}</style>
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
          variant={editor.isActive('link') || currentLinkActive ? 'secondary' : 'outline'}
          size="sm"
          onClick={setLink}
          aria-label="Toggle link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Select onValueChange={setFontFamily} defaultValue="Arial">
          <SelectTrigger className="w-[120px] h-8 text-sm">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Roboto">Roboto</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setFontSize} value={currentFontSize}>
          <SelectTrigger className="w-[100px] h-8 text-sm">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12px">12px</SelectItem>
            <SelectItem value="16px">16px</SelectItem>
            <SelectItem value="20px">20px</SelectItem>
            <SelectItem value="24px">24px</SelectItem>
          </SelectContent>
        </Select>
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